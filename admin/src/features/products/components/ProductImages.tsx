import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	useDeleteImage,
	useUploadImages,
	type ProductDetailsResponse,
	type ProductImage,
	type ProductImageUploadRequest,
} from "@/lib/api/product";
import { GripVertical, ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type ProductImagesProps = {
	product?: ProductDetailsResponse;
};

type ImageToUpload = {
	image: File;
	alt_text: string;
	is_primary: boolean;
	display_order: number;
	preview: string;
};

export const ProductImages: React.FC<ProductImagesProps> = ({ product }) => {
	const [imagesToUpload, setImagesToUpload] = useState<ImageToUpload[]>([]);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [imageToDelete, setImageToDelete] = useState<string | null>(null);
	const [previewImage, setPreviewImage] = useState<ProductImage | null>(null);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { mutate: uploadImages, isPending: isUploadingImages } =
		useUploadImages();
	const { mutate: deleteImage, isPending: isDeletingImage } = useDeleteImage();

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		const newImages = Array.from(files).map((file, index) => ({
			image: file,
			alt_text: product?.name || "Product image",
			is_primary: imagesToUpload.length === 0 && index === 0, // First image is primary if no images exist
			display_order: imagesToUpload.length + index,
			preview: URL.createObjectURL(file),
		}));

		setImagesToUpload((prev) => [...prev, ...newImages]);

		// Reset the file input so the same file can be selected again
		if (event.target) {
			event.target.value = "";
		}
	};

	const handleDropZoneDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDraggingOver(false);

		const files = event.dataTransfer.files;
		if (!files || files.length === 0) return;

		// Filter only image files
		const imageFiles = Array.from(files).filter((file) =>
			file.type.startsWith("image/"),
		);

		if (imageFiles.length === 0) {
			toast.error("Please drop only image files");
			return;
		}

		const newImages = imageFiles.map((file, index) => ({
			image: file,
			alt_text: product?.name || "Product image",
			is_primary: imagesToUpload.length === 0 && index === 0,
			display_order: imagesToUpload.length + index,
			preview: URL.createObjectURL(file),
		}));

		setImagesToUpload((prev) => [...prev, ...newImages]);
	};

	const handleDropZoneDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDraggingOver(true);
	};

	const handleDropZoneDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDraggingOver(false);
	};

	const handleRemoveFile = (index: number) => {
		setImagesToUpload((prev) => {
			// Revoke the object URL to free memory
			URL.revokeObjectURL(prev[index].preview);
			const newImages = prev.filter((_, i) => i !== index);

			// If we removed the primary image, make the first image primary
			const hadPrimary = prev[index].is_primary;
			if (hadPrimary && newImages.length > 0) {
				newImages[0].is_primary = true;
			}

			// Reorder display_order
			return newImages.map((img, idx) => ({
				...img,
				display_order: idx,
			}));
		});
	};

	const handleUpdateAltText = (index: number, value: string) => {
		setImagesToUpload((prev) =>
			prev.map((img, i) => (i === index ? { ...img, alt_text: value } : img)),
		);
	};

	const handleUpdateOrder = (index: number, value: string) => {
		const numValue = parseInt(value) || 0;
		setImagesToUpload((prev) =>
			prev.map((img, i) =>
				i === index ? { ...img, display_order: numValue } : img,
			),
		);
	};

	const handleTogglePrimary = (index: number) => {
		setImagesToUpload((prev) =>
			prev.map((img, i) => ({
				...img,
				is_primary: i === index, // Only the clicked image becomes primary
			})),
		);
	};

	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		setImagesToUpload((prev) => {
			const newImages = [...prev];
			const draggedItem = newImages[draggedIndex];

			// Remove dragged item
			newImages.splice(draggedIndex, 1);
			// Insert at new position
			newImages.splice(index, 0, draggedItem);

			// Update display_order for all images
			return newImages.map((img, idx) => ({
				...img,
				display_order: idx,
			}));
		});

		setDraggedIndex(index);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	const handleUploadImages = async () => {
		if (imagesToUpload.length === 0) {
			toast.error("Please select at least one image");
			return;
		}

		if (!product?.id) {
			toast.error("Product ID is required");
			return;
		}

		const imageData: ProductImageUploadRequest[] = imagesToUpload;

		console.log("imageData--->", imageData);

		uploadImages(
			{ productId: product.id, images: imageData },
			{
				onSuccess: () => {
					toast.success("Images uploaded successfully");
					// Clear selected files and their previews
					imagesToUpload.forEach((item) => URL.revokeObjectURL(item.preview));
					setImagesToUpload([]);
				},
				onError: (error) => {
					toast.error("Failed to upload images");
					console.error(error);
				},
			},
		);
	};

	const handleClickUpload = () => {
		fileInputRef.current?.click();
	};

	const handleDeleteImage = (imageId: string) => {
		setImageToDelete(imageId);
	};

	const handleConfirmDelete = () => {
		if (!imageToDelete) return;

		deleteImage(imageToDelete, {
			onSuccess: () => {
				toast.success("Image deleted successfully");
				setImageToDelete(null);
			},
			onError: (error) => {
				toast.error("Failed to delete image");
				console.error(error);
				setImageToDelete(null);
			},
		});
	};

	const handleCancelDelete = () => {
		setImageToDelete(null);
	};

	const handleViewImage = (image: ProductImage) => {
		setPreviewImage(image);
	};

	const handleClosePreview = () => {
		setPreviewImage(null);
	};

	// Cleanup object URLs on unmount
	useEffect(() => {
		return () => {
			imagesToUpload.forEach((item) => URL.revokeObjectURL(item.preview));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Product Media</CardTitle>
				<Button
					size="sm"
					variant="outline"
					onClick={handleClickUpload}
					disabled={isUploadingImages}
				>
					<ImagePlus className="h-4 w-4 mr-2" />
					Add Images
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					className="hidden"
					onChange={handleFileSelect}
				/>

				{/* Upload Preview Section */}
				{imagesToUpload.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">
								Selected Images ({imagesToUpload.length})
							</p>
							<Button
								size="sm"
								onClick={handleUploadImages}
								disabled={isUploadingImages}
							>
								{isUploadingImages ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="h-4 w-4 mr-2" />
										Upload Images
									</>
								)}
							</Button>
						</div>
						<div className="space-y-2 p-3 border rounded-lg bg-muted/30">
							{imagesToUpload.map((item, index) => (
								<div
									key={index}
									draggable
									onDragStart={() => handleDragStart(index)}
									onDragOver={(e) => handleDragOver(e, index)}
									onDragEnd={handleDragEnd}
									className={`flex items-start gap-3 p-3 bg-background border rounded-lg transition-all cursor-move ${
										draggedIndex === index ? "opacity-50" : ""
									} hover:border-primary`}
								>
									{/* Drag Handle */}
									<div className="flex items-center pt-2">
										<GripVertical className="h-5 w-5 text-muted-foreground" />
									</div>

									{/* Image Preview */}
									<div className="relative">
										<img
											src={item.preview}
											alt={item.alt_text}
											className="w-20 h-20 object-cover rounded-md border"
										/>
										{item.is_primary && (
											<Badge
												className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0"
												variant="default"
											>
												Primary
											</Badge>
										)}
									</div>

									{/* Form Fields */}
									<div className="flex-1 space-y-3">
										{/* Alt Text */}
										<div className="space-y-1">
											<Label htmlFor={`alt-${index}`} className="text-xs">
												Alt Text
											</Label>
											<Input
												id={`alt-${index}`}
												value={item.alt_text}
												onChange={(e) =>
													handleUpdateAltText(index, e.target.value)
												}
												placeholder="Enter image description"
												className="text-sm"
											/>
										</div>

										{/* Order and Primary */}
										<div className="flex items-end gap-3">
											<div className="space-y-1 w-24">
												<Label htmlFor={`order-${index}`} className="text-xs">
													Order
												</Label>
												<Input
													id={`order-${index}`}
													type="number"
													value={item.display_order}
													onChange={(e) =>
														handleUpdateOrder(index, e.target.value)
													}
													className="text-sm"
													min={0}
												/>
											</div>

											<div className="flex items-center space-x-2 pb-2">
												<Switch
													id={`primary-${index}`}
													checked={item.is_primary}
													onCheckedChange={() => handleTogglePrimary(index)}
												/>
												<Label
													htmlFor={`primary-${index}`}
													className="text-xs cursor-pointer"
												>
													Primary
												</Label>
											</div>
										</div>
									</div>

									{/* Remove Button */}
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleRemoveFile(index)}
										className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Existing Images */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium">Uploaded Images</h3>
						{product?.images && product.images.length > 0 && (
							<span className="text-xs text-muted-foreground">
								{product.images.length}{" "}
								{product.images.length === 1 ? "image" : "images"}
							</span>
						)}
					</div>

					{product?.images && product?.images?.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{product?.images?.map((image) => (
								<div
									key={image.id}
									className="group relative aspect-square rounded-lg border-2 border-border overflow-hidden bg-muted hover:border-primary transition-all duration-200"
								>
									<img
										src={image.image}
										alt={image.alt_text || product.name}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
									/>

									{/* Primary Badge */}
									{image.is_primary && (
										<Badge
											className="absolute top-2 left-2 text-[10px] px-2 py-0.5 shadow-md"
											variant="default"
										>
											Primary
										</Badge>
									)}

									{/* Display Order Badge */}
									<div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
										#{image.display_order}
									</div>

									{/* Hover Overlay */}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
										<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
											<Button
												size="sm"
												variant="secondary"
												className="h-8 text-xs"
												onClick={() => handleViewImage(image)}
											>
												View
											</Button>
											<Button
												size="sm"
												variant="destructive"
												className="h-8 text-xs"
												onClick={() => handleDeleteImage(image.id)}
												disabled={isDeletingImage}
											>
												{isDeletingImage && imageToDelete === image.id ? (
													<Loader2 className="h-3 w-3 animate-spin" />
												) : (
													"Delete"
												)}
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div
							className={`flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/30 transition-all duration-200 ${
								isDraggingOver
									? "border-primary bg-primary/10 scale-[1.02]"
									: "border-border"
							}`}
							onDrop={handleDropZoneDrop}
							onDragOver={handleDropZoneDragOver}
							onDragLeave={handleDropZoneDragLeave}
						>
							<div
								className={`rounded-full bg-muted p-3 mb-3 transition-all duration-200 ${
									isDraggingOver ? "bg-primary/20 scale-110" : ""
								}`}
							>
								<ImagePlus
									className={`h-6 w-6 text-muted-foreground transition-all duration-200 ${
										isDraggingOver ? "text-primary scale-110" : ""
									}`}
								/>
							</div>
							<p className="text-sm font-medium text-foreground mb-1">
								{isDraggingOver ? "Drop images here" : "No images yet"}
							</p>
							<p className="text-xs text-muted-foreground mb-4">
								{isDraggingOver
									? "Release to upload multiple images"
									: "Drag & drop images here, or click to browse"}
							</p>
							<Button
								size="sm"
								variant="outline"
								onClick={handleClickUpload}
							>
								<ImagePlus className="h-4 w-4 mr-2" />
								Upload Images
							</Button>
						</div>
					)}
				</div>

				{/* Confirmation Dialog */}
				<AppConfirmDialog
					open={!!imageToDelete}
					title="Delete Image"
					description="Are you sure you want to delete this image? This action cannot be undone."
					confirmButtonText={isDeletingImage ? "Deleting..." : "Delete"}
					cancelButtonText="Cancel"
					confirmButtonVariant="destructive"
					onConfirm={handleConfirmDelete}
					onCancel={handleCancelDelete}
				/>

				{/* Preview Modal */}
				<Dialog open={!!previewImage} onOpenChange={handleClosePreview}>
					<DialogContent className="max-w-4xl">
						<DialogHeader>
							<DialogTitle>Image Preview</DialogTitle>
						</DialogHeader>
						{previewImage && (
							<div className="space-y-4">
								<div className="relative w-full">
									<img
										src={previewImage.image}
										alt={previewImage.alt_text || product?.name}
										className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
									/>
								</div>
								<div className="space-y-2 p-4 bg-muted rounded-lg">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">Alt Text:</span>
										<span className="text-sm text-muted-foreground">
											{previewImage.alt_text || "No alt text"}
										</span>
									</div>
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												Display Order:
											</span>
											<Badge variant="outline">
												#{previewImage.display_order}
											</Badge>
										</div>
										{previewImage.is_primary && (
											<Badge variant="default">Primary Image</Badge>
										)}
									</div>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
};
