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
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="orders.create.title" defaultMessage="Create Order" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="orders.create.description"
							defaultMessage="Manually place a new order on behalf of a customer"
						/>
					</p>
				</div>
			</div>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						<T id="orders.create.cardTitle" defaultMessage="Order Details" />
					</CardTitle>
					<CardDescription>
						<T
							id="orders.create.cardDescription"
							defaultMessage="Fill in the order information below. Required fields are marked with an asterisk (*)."
						/>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<OrderForm handleClose={handleClose} />
				</CardContent>
			</Card>
		</div>
	);
}
