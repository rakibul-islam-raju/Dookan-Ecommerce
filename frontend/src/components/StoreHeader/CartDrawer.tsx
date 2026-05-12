"use client";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { env } from "@/config/env";
import {
	useCart,
	useRemoveFromCart,
	useUpdateCartItem,
} from "@/lib/hooks/useCart";
import {
	ArrowRight,
	Loader2,
	Minus,
	Plus,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export interface CartDrawerProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const CartDrawer = ({
	open: controlledOpen,
	onOpenChange,
}: CartDrawerProps = {}) => {
	const t = useTranslations("common");
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setIsOpen = onOpenChange || setInternalOpen;
	const { data: cart, isLoading, error } = useCart();
	const updateCartItem = useUpdateCartItem();
	const removeFromCart = useRemoveFromCart();

	const items = cart?.items || [];
	const totalItems = cart?.total_items || 0;
	const subtotal = cart?.subtotal || 0;

	const updateQuantity = (itemId: string, delta: number) => {
		const item = items.find((item) => item.id === itemId);
		if (!item) return;

		const newQuantity = Math.max(1, item.quantity + delta);
		updateCartItem.mutate({ itemId, quantity: newQuantity });
	};

	const removeItem = (itemId: string) => {
		removeFromCart.mutate(itemId);
	};

	const getImageUrl = (image?: string) => {
		if (!image) return "";
		if (image.startsWith("http")) return image;
		return `${env.api.baseAppUrl}${image.startsWith("/") ? "" : "/"}${image}`;
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<button
					className="cursor-pointer relative p-2 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					aria-label={`View shopping cart with ${totalItems} items`}
				>
					<ShoppingCart className="size-5 lg:size-6" />
					{totalItems > 0 && (
						<span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs font-bold animate-in zoom-in">
							{totalItems}
						</span>
					)}
				</button>
			</SheetTrigger>
			<SheetContent className="w-full sm:max-w-md flex flex-col py-2 px-4">
				<SheetHeader className="space-y-2.5 pr-6">
					<SheetTitle className="flex items-center gap-2">
						<ShoppingCart className="size-5" />
						{t("cart")}
						<Badge variant="secondary" className="ml-auto">
							{totalItems} Items
						</Badge>
					</SheetTitle>
					<Separator />
				</SheetHeader>

				{isLoading ? (
					<div className="flex-1 flex items-center justify-center">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
					</div>
				) : error ? (
					<div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
						<p className="text-destructive text-sm">
							Failed to load cart. Please try again.
						</p>
						<Button variant="outline" onClick={() => window.location.reload()}>
							Retry
						</Button>
					</div>
				) : items.length > 0 ? (
					<>
						<div className="flex-1 overflow-y-auto py-4 -mr-6 pr-6 space-y-4">
							{items.map((item) => (
								<div key={item.id} className="flex gap-4">
									<div className="h-20 w-20 rounded-lg border bg-muted overflow-hidden shrink-0">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={getImageUrl(item.product.primary_image)}
											alt={item.product.name}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="flex-1 min-w-0 flex flex-col justify-between">
										<div>
											<h4 className="font-medium text-sm line-clamp-2 leading-tight">
												<Link
													href={`/products/${item.product.slug}`}
													onClick={() => setIsOpen(false)}
													className="hover:underline"
												>
													{item.product.name}
												</Link>
											</h4>
											{item.variant && (
												<p className="text-xs text-muted-foreground mt-0.5">
													{item.variant.name}
												</p>
											)}
											<p className="text-sm text-muted-foreground mt-1">
												৳{item.variant ? item.variant.price : item.product.price}
											</p>
										</div>
										<div className="flex items-center justify-between mt-2">
											<div className="flex items-center border rounded-md h-8">
												<button
													onClick={() => updateQuantity(item.id, -1)}
													disabled={updateCartItem.isPending}
													className="px-2 hover:bg-muted h-full transition-colors disabled:opacity-50"
												>
													<Minus className="size-3" />
												</button>
												<span className="w-8 text-center text-xs font-medium">
													{item.quantity}
												</span>
												<button
													onClick={() => updateQuantity(item.id, 1)}
													disabled={updateCartItem.isPending}
													className="px-2 hover:bg-muted h-full transition-colors disabled:opacity-50"
												>
													<Plus className="size-3" />
												</button>
											</div>
											<button
												onClick={() => removeItem(item.id)}
												disabled={removeFromCart.isPending}
												className="text-muted-foreground hover:text-destructive transition-colors p-1 disabled:opacity-50"
											>
												{removeFromCart.isPending ? (
													<Loader2 className="size-4 animate-spin" />
												) : (
													<Trash2 className="size-4" />
												)}
											</button>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="space-y-4 pt-4">
							<Separator />
							<div className="space-y-1.5">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal</span>
									<span className="font-medium">৳{subtotal.toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Shipping</span>
									<span className="text-muted-foreground">
										Calculated at checkout
									</span>
								</div>
								<div className="flex justify-between text-sm font-medium pt-2 border-t">
									<span>Total</span>
									<span>৳{subtotal.toFixed(2)}</span>
								</div>
							</div>
							<SheetFooter>
								<Button className="w-full" size="lg" asChild>
									<Link href="/checkout" onClick={() => setIsOpen(false)}>
										Checkout <ArrowRight className="ml-2 size-4" />
									</Link>
								</Button>
							</SheetFooter>
						</div>
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
						<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
							<ShoppingCart className="size-8 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<h3 className="font-semibold text-lg">Your cart is empty</h3>
							<p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
								Looks like you haven&apos;t added anything to your cart yet.
							</p>
						</div>
						<Button variant="outline" onClick={() => setIsOpen(false)}>
							{t("startShopping")}
						</Button>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
};
