from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from vendors.services import serialize_vendor_context


class ActiveVendorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(serialize_vendor_context(request))

