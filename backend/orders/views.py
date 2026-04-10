from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import filters
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated

from utils.permissions import HasModulePermission

from django_filters.rest_framework import DjangoFilterBackend

from utils.permissions import IsOwnerOrAdmin
from utils.email import send_guest_order_tracking_otp, send_order_status_update_email
from orders.models import Order, OrderStatusHistory
from orders.filters import OrderFilter
from orders.serializers import (
    OrderCreateSerializer,
    OrderListSerializer,
    OrderDetailSerializer,
    GuestOrderOTPRequestSerializer,
    GuestOrderTrackingSerializer,
    OrderPaymentUpdateSerializer,
    OrderStatusUpdateSerializer,
)


class OrderCreateView(generics.CreateAPIView):
    """
    Create new order (both registered and guest users)
    POST /api/orders/create/
    """

    serializer_class = OrderCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # Return detailed order info
        response_serializer = OrderDetailSerializer(order)

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """
    List all orders (Admin: all orders, User: own orders)
    GET /api/orders/
    """

    serializer_class = OrderListSerializer
    filterset_class = OrderFilter
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            # Admin sees all orders
            queryset = Order.objects.all().prefetch_related("items")
        else:
            # Regular users see only their orders
            return Order.objects.filter(user=user).prefetch_related("items")

        return queryset


class OrderDetailView(generics.RetrieveAPIView):
    """
    Get order details
    GET /api/orders/{id}/
    """

    serializer_class = OrderDetailSerializer
    permission_classes = [IsOwnerOrAdmin]
    queryset = Order.objects.all().prefetch_related(
        "items__product", "shipping_address", "status_history"
    )
    lookup_field = "id"


class MyOrdersView(generics.ListAPIView):
    """
    Get current user's orders
    GET /api/orders/my-orders/
    """

    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["status"]
    search_fields = ["order_number"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user)
        return queryset.prefetch_related("items").order_by("-created_at")


class OrderStatusUpdateView(APIView):
    """
    Update order status (Admin only)
    PATCH /api/orders/{id}/status/
    """

    permission_classes = [HasModulePermission("manage_orders")]

    def patch(self, request, id):
        order = get_object_or_404(Order, id=id)

        serializer = OrderStatusUpdateSerializer(
            data=request.data, context={"order": order}
        )

        if serializer.is_valid():
            new_status = serializer.validated_data["status"]
            note = serializer.validated_data.get("note", "")

            # Update order status
            old_status = order.status
            order.status = new_status

            # Update timestamp fields
            if new_status == "confirmed":
                order.confirmed_at = timezone.now()
            elif new_status == "shipped":
                order.shipped_at = timezone.now()
            elif new_status == "delivered":
                order.delivered_at = timezone.now()

            order.save()

            # Create status history
            OrderStatusHistory.objects.create(
                order=order,
                status=new_status,
                note=note or f"Status changed from {old_status} to {new_status}",
                created_by=request.user,
            )

            # Send status update email to customer
            send_order_status_update_email(order, new_status, note)

            return Response(
                OrderDetailSerializer(order).data,
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderPaymentUpdateView(generics.UpdateAPIView):
    """
    Update order payment details (admin only)
    PATCH /api/orders/{id}/payment-status/
    """

    serializer_class = OrderPaymentUpdateSerializer
    permission_classes = [HasModulePermission("manage_orders")]
    queryset = Order.objects.all()
    lookup_field = "id"


class OrderCancelView(APIView):
    """
    Cancel order (User can cancel pending/confirmed orders)
    POST /api/orders/{id}/cancel/
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        order = get_object_or_404(Order, id=id)

        # Check if user owns the order
        if not request.user.is_staff:
            if not order.user or order.user != request.user:
                return Response(
                    {"error": "You do not have permission to cancel this order."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Check if order can be cancelled
        if order.status not in ["pending", "confirmed"]:
            return Response(
                {"error": f"Cannot cancel order with status: {order.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Cancel order
        order.status = "cancelled"
        order.save()

        # Restore coupon usage count
        if order.coupon and order.coupon.used_count > 0:
            order.coupon.used_count -= 1
            order.coupon.save()

        # Restore stock
        for item in order.items.all():
            product = item.product
            if product.track_inventory:
                product.stock_quantity += item.quantity
                product.save()

        # Create status history
        cancel_note = f'Order cancelled by {"admin" if request.user.is_staff else "customer"}'
        OrderStatusHistory.objects.create(
            order=order,
            status="cancelled",
            note=cancel_note,
            created_by=request.user if request.user.is_authenticated else None,
        )

        # Send cancellation email to customer
        send_order_status_update_email(order, "cancelled", cancel_note)

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class GuestOrderOTPRequestView(APIView):
    """
    Request OTP for guest order tracking.
    POST /api/orders/guest-orders/request-otp/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GuestOrderOTPRequestSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data["email"]

            # Send OTP to email
            send_guest_order_tracking_otp(email)

            return Response(
                {"message": "OTP sent to your email."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GuestOrderTrackingView(APIView):
    """
    Track guest orders with email OTP verification.
    POST /api/orders/guest-orders/track/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GuestOrderTrackingSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data["email"]

            # Get all orders for this email
            orders = Order.objects.filter(
                customer_email=email,
                user__isnull=True,  # Only guest orders
            ).prefetch_related("items__product", "shipping_address")

            if not orders.exists():
                return Response(
                    {"message": "No orders found for this email."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Return orders
            orders_data = OrderDetailSerializer(orders, many=True).data

            return Response(
                orders_data,
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GuestOrderDetailView(APIView):
    """
    Get specific guest order with email OTP verification.
    POST /api/orders/guest-orders/{order_number}/
    """

    permission_classes = [AllowAny]

    def post(self, request, order_number):
        # Verify OTP first
        otp_serializer = GuestOrderTrackingSerializer(data=request.data)

        if otp_serializer.is_valid():
            email = otp_serializer.validated_data["email"]

            # Get order
            try:
                order = Order.objects.prefetch_related(
                    "items__product", "shipping_address", "status_history"
                ).get(
                    order_number=order_number,
                    customer_email=email,
                    user__isnull=True,
                )
            except Order.DoesNotExist:
                return Response(
                    {"error": "Order not found or email does not match."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Return order details
            order_data = OrderDetailSerializer(order).data

            return Response(
                order_data,
                status=status.HTTP_200_OK,
            )

        return Response(otp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductOrdersView(generics.ListAPIView):
    """
    Get all orders containing a specific product (Admin only)
    GET /api/orders/by-product/{product_id}/
    """

    serializer_class = OrderListSerializer
    permission_classes = [HasModulePermission("manage_orders")]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = OrderFilter
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        product_id = self.kwargs["product_id"]
        # Get orders through OrderItem relationship
        return (
            Order.objects.filter(items__product_id=product_id)
            .distinct()
            .prefetch_related("items", "shipping_address")
        )
