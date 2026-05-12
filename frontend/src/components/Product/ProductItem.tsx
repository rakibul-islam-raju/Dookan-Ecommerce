import { IConsumerProductListItem } from "@/@types/Product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import Image from "next/image";
import { WishlistButton } from "./WishlistButton";

interface ProductItemProps {
	product: IConsumerProductListItem;
	onQuickView: (product: IConsumerProductListItem) => void;
	className?: string;
}

export const ProductItem = ({
	product,
	onQuickView,
	className,
}: ProductItemProps) => {
	const {
		name,
		category,
		base_price,
		sale_price,
		sale_discount_percentage,
		sale_name,
		primary_image,
		is_in_stock,
	} = product;

	const displayPrice = sale_price ?? base_price;

	

	return (
		<Link
			href={`/products/${product.slug}`}
			className={cn(
				"group relative flex flex-col overflow-hidden rounded-xl bg-card border transition-all duration-300 hover:shadow-lg hover:border-primary/20",
				className
			)}
		>
			{/* Image Container */}
			<div className="relative aspect-square overflow-hidden bg-muted">
				{primary_image ? (
					<Image
						src={primary_image}
						alt={name}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-105"
						unoptimized
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground">
						No Image
					</div>
				)}

				{/* Badges */}
				<div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
					{sale_discount_percentage > 0 && (
						<Badge variant="destructive" className="font-bold shadow-sm">
							-{sale_discount_percentage}%
						</Badge>
					)}
					{sale_name && (
						<Badge className="font-bold shadow-sm bg-orange-500 hover:bg-orange-600 text-white border-none">
							{sale_name}
						</Badge>
					)}
					{!is_in_stock && (
						<Badge
							variant="secondary"
							className="font-bold shadow-sm bg-zinc-800 text-white hover:bg-zinc-700"
						>
							Out of Stock
						</Badge>
					)}
				</div>

				{/* Quick Actions Overlay - Desktop */}
				<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 z-20 hidden lg:flex gap-2 justify-center bg-gradient-to-t from-black/60 to-transparent pt-10">
					<Button
						variant="secondary"
						size="icon"
						className="rounded-full h-10 w-10 bg-white text-foreground hover:bg-white/90 hover:scale-110 transition-all shadow-md"
						onClick={(e) => {
							e.preventDefault();
							onQuickView(product);
						}}
						title="Quick View"
					>
						<Eye className="h-5 w-5" />
					</Button>
					<WishlistButton productId={product.id} />
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-4">
				<div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
					{category.name}
				</div>
				<h3 className="mb-2 text-lg font-serif font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
					{name}
				</h3>

				<div className="mt-auto pt-2 flex items-center justify-between border-t border-border/50">
					<div className="flex flex-col">
						{sale_price ? (
							<div className="flex items-baseline gap-2">
								<span className="text-lg font-bold text-primary">৳{sale_price}</span>
								<span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
									৳{base_price}
								</span>
							</div>
						) : (
							<span className="text-lg font-bold text-foreground">
								৳{displayPrice}
							</span>
						)}
					</div>

					{/* Mobile: View options button */}
					<span className="lg:hidden text-xs font-medium text-primary">
						View options
					</span>
				</div>
			</div>
		</Link>
	);
};
