import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { T } from "@/i18n/translate";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "./components/ProductForm";

export function CreateProduct() {
	const navigate = useNavigate();

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
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="products.create.title" defaultMessage="Create Product" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="products.create.description"
							defaultMessage="Add a new product to your inventory"
						/>
					</p>
				</div>
			</div>

			{/* Product Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						<T id="products.create.cardTitle" defaultMessage="Product Details" />
					</CardTitle>
					<CardDescription>
						<T
							id="products.create.cardDescription"
							defaultMessage="Fill in the product information below. All required fields are marked with an asterisk."
						/>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProductForm mode="create" handleClose={handleClose} />
				</CardContent>
			</Card>
		</div>
	);
}
