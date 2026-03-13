import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useProductDetails } from "@/lib/api/product";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductForm } from "./components/ProductForm";

export function EditProduct() {
	const { id } = useParams();
	const navigate = useNavigate();

	const { data: product, isPending: isLoadingProduct } = useQuery(
		useProductDetails(id!)
	);

	const handleClose = () => {
		navigate("/products");
	};

	return (
		<div className="space-y-6">
			{/* Header with back button */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={handleClose}
					className="h-8 w-8"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
					<p className="text-muted-foreground">
						Edit the product information below. All required fields are marked
						with an asterisk.
					</p>
				</div>
			</div>

			{/* Product Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Product Details</CardTitle>
					<CardDescription>
						Fill in the product information below. All required fields are
						marked with an asterisk.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingProduct ? (
						<div className="flex justify-center items-center h-full">
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
					) : (
						<ProductForm
							mode="edit"
							handleClose={handleClose}
							product={product}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
