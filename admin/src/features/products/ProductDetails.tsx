import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useProductDetails, useUpdateProduct } from "@/lib/api/product";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Edit,
	EllipsisVertical,
	Loader2,
	Package,
	Trash,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductImages } from "./components/ProductImages";
import { ProductOrders } from "./components/ProductOrders";
import { ProductVariants } from "./components/ProductVariants";

export const ProductDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
	const [confirmPublishProduct, setConfirmPublishProduct] = useState(false);

	const { data: product, isPending: isLoadingProduct } = useQuery(
		useProductDetails(id!)
	);
	const { mutate: updateProduct, isPending: isUpdatingProduct } =
		useUpdateProduct();

	const handlePublishProduct = () => {
		updateProduct(
			{
				id: id!,
				updateData: {
					is_active: true,
				},
			},
			{
				onSuccess: () => {
					toast.success("Product published successfully");
				},
				onError: (error) => {
					toast.error("Failed to publish product");
					console.error(error);
				},
				onSettled: () => {
					setConfirmPublishProduct(false);
				},
			}
		);
	};

	const handleBack = () => {
		navigate("/products");
	};

	if (isLoadingProduct) {
		return (
			<div className="flex justify-center items-center h-full min-h-[400px]">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!product) {
		return (
			<div className="flex flex-col justify-center items-center h-full min-h-[400px] gap-4">
				<Package className="h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">Product not found</p>
				<Button onClick={handleBack} variant="outline" size="sm">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Products
				</Button>
			</div>
		);
	}

	// Sort images: primary first, then by display_order
	const sortedImages = [...(product.images || [])].sort((a, b) => {
		if (a.is_primary) return -1;
		if (b.is_primary) return 1;
		return a.display_order - b.display_order;
	});

	const handlePreviousImage = () => {
		setSelectedImageIndex((prev) =>
			prev > 0 ? prev - 1 : sortedImages.length - 1
		);
	};

	const handleNextImage = () => {
		setSelectedImageIndex((prev) =>
			prev < sortedImages.length - 1 ? prev + 1 : 0
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-2xl font-bold">{product.name}</h1>
				</div>

				<div className="flex items-center gap-2">
					{!product.is_active ? (
						<Button
							className="bg-green-500 text-white hover:bg-green-600 hover:text-\"
							variant="outline"
							onClick={() => setConfirmPublishProduct(true)}
							disabled={isUpdatingProduct}
						>
							Publish Product
						</Button>
					) : (
						<Badge variant="success">Published</Badge>
					)}
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<EllipsisVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => navigate(`/products/edit/${id}`)}
								>
									<Edit className="h-4 w-4 mr-2" />
									Edit Product
								</DropdownMenuItem>
								<DropdownMenuItem variant="destructive">
									<Trash className="h-4 w-4 mr-2" />
									Delete Product
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Main Content: Left (wider) + Right (sidebar) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - General Info & Media */}
				<div className="lg:col-span-2 space-y-6">
					{/* General Information */}
					<Card>
						<CardHeader>
							<CardTitle>General Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* name */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									Product Name
								</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium">{product.name}</p>
								</div>
							</div>

							{/* short description */}
							{product.short_description && (
								<div>
									<p className="text-sm text-muted-foreground mb-1.5">
										Short Description
									</p>
								</div>
							)}

							{/* description */}
							{product.description && (
								<div>
									<p className="text-sm text-muted-foreground mb-1.5">
										Description
									</p>
									<div className="px-3 py-2 bg-muted/50 rounded-md">
										<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
											{product.description}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Product Media */}
					<ProductImages product={product} />

					{/* SEO data */}
					<Card>
						<CardHeader>
							<CardTitle>SEO Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-muted-foreground mb-1.5">Meta Title</p>
							<div className="px-3 py-2 bg-muted/50 rounded-md">
								<p className="font-medium text-sm">{product.meta_title}</p>
							</div>
							<p className="text-sm text-muted-foreground mb-1.5">
								Meta Description
							</p>
							<div className="px-3 py-2 bg-muted/50 rounded-md">
								<p className="font-medium text-sm">
									{product.meta_description}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Sidebar */}
				<div className="space-y-6">
					{/* Status */}
					<Card>
						<CardContent>
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant={product.is_active ? "success" : "destructive"}>
									{product.is_active ? "Active" : "Inactive"}
								</Badge>
								<Badge variant={product.is_featured ? "info" : "secondary"}>
									{product.is_featured ? "Featured" : "Not Featured"}
								</Badge>
								<Badge variant={product.is_digital ? "purple" : "secondary"}>
									{product.is_digital ? "Digital" : "Physical"}
								</Badge>
								<Badge
									variant={product.is_in_stock ? "success" : "destructive"}
								>
									{product.is_in_stock ? "In Stock" : "Out of Stock"}
								</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Product Organization */}
					<Card>
						<CardHeader>
							<CardTitle>Product Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* sku */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">SKU</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium text-sm">{product.sku}</p>
								</div>
							</div>

							{/* category */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									Product Category
								</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium text-sm">{product.category.name}</p>
								</div>
							</div>
							{/* unit */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">Unit</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium text-sm">
										{product.unit_value} {product.unit}
									</p>
								</div>
							</div>

							{/* total stock */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									Total Stock
								</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium text-sm">
										{product.is_digital ? "N/A (Digital)" : (product.total_stock ?? 0)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Pricing */}
					<Card>
						<CardHeader>
							<CardTitle>Pricing</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* cost price */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									Cost Price
								</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium">
										BDT {Number(product.cost_price).toFixed(2)}
									</p>
								</div>
							</div>
							{/* base price (MRP) */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									Base Price (MRP)
								</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium">
										BDT {Number(product.base_price).toFixed(2)}
									</p>
								</div>
							</div>
							{/* sale price */}
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									Sale Price
								</p>
								{product.sale_price ? (
									<div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md">
										<div className="flex items-center justify-between">
											<p className="font-semibold text-green-700">
												BDT {Number(product.sale_price).toFixed(2)}
											</p>
											{product.sale_discount_percentage ? (
												<span className="text-xs font-medium bg-red-500 text-white px-2 py-0.5 rounded">
													-{product.sale_discount_percentage}%
												</span>
											) : null}
										</div>
										{product.sale_name && (
											<p className="text-xs text-orange-600 font-medium mt-1">
												{product.sale_name}
											</p>
										)}
									</div>
								) : (
									<div className="px-3 py-2 bg-muted/50 rounded-md">
										<p className="text-sm text-muted-foreground">
											No active sale
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Product Variants Section */}
			<ProductVariants productId={id!} />

			{/* Product Orders Section */}
			<ProductOrders productId={id!} />

			{/* Image Viewer Dialog */}
			<Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
				<DialogContent className="max-w-3xl p-0" showCloseButton={false}>
					<div className="relative">
						{sortedImages.length > 0 && (
							<>
								<img
									src={sortedImages[selectedImageIndex]?.image}
									alt={
										sortedImages[selectedImageIndex]?.alt_text || product.name
									}
									className="w-full max-h-[80vh] object-contain"
								/>
								{sortedImages.length > 1 && (
									<>
										<Button
											variant="ghost"
											size="icon"
											className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80"
											onClick={handlePreviousImage}
										>
											<ChevronLeft className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80"
											onClick={handleNextImage}
										>
											<ChevronRight className="h-4 w-4" />
										</Button>
										<div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
											{selectedImageIndex + 1} / {sortedImages.length}
										</div>
									</>
								)}
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Confirm Publish Product Dialog */}
			<AppConfirmDialog
				title="Publish Product"
				description="Are you sure you want to publish this product?"
				confirmButtonText="Publish"
				cancelButtonText="Cancel"
				open={confirmPublishProduct}
				onConfirm={handlePublishProduct}
				onCancel={() => setConfirmPublishProduct(false)}
			/>
		</div>
	);
};
