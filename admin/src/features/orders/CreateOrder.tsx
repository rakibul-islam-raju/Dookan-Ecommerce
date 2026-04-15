import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OrderForm } from "./components/OrderForm";

export function CreateOrder() {
	const navigate = useNavigate();

	const handleClose = () => {
		navigate("/orders");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
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
					<h1 className="text-3xl font-bold tracking-tight">Create Order</h1>
					<p className="text-muted-foreground">
						Manually place a new order on behalf of a customer
					</p>
				</div>
			</div>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Order Details</CardTitle>
					<CardDescription>
						Fill in the order information below. Required fields are marked with
						an asterisk (*).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<OrderForm handleClose={handleClose} />
				</CardContent>
			</Card>
		</div>
	);
}
