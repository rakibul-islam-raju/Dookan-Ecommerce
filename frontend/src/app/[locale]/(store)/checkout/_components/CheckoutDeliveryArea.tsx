"use client";

import { cn } from "@/lib/utils";
import { Truck } from "lucide-react";
import type { FieldError } from "react-hook-form";

interface CheckoutDeliveryAreaProps {
	selectedDeliveryType: "inside_dhaka" | "outside_dhaka";
	onDeliveryTypeChange: (type: "inside_dhaka" | "outside_dhaka") => void;
	error?: FieldError;
	insideDhakaCharge: number;
	outsideDhakaCharge: number;
}

export function CheckoutDeliveryArea({
	selectedDeliveryType,
	onDeliveryTypeChange,
	error,
	insideDhakaCharge,
	outsideDhakaCharge,
}: CheckoutDeliveryAreaProps) {
	const options = [
		{
			value: "inside_dhaka" as const,
			label: "Inside Dhaka",
			description: "Delivery within Dhaka city limits",
			price: `৳${insideDhakaCharge}`,
		},
		{
			value: "outside_dhaka" as const,
			label: "Outside Dhaka",
			description: "Delivery outside Dhaka city limits",
			price: `৳${outsideDhakaCharge}`,
		},
	];

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold">Delivery Area</h2>
			<div className="space-y-3">
				{options.map((option) => (
					<div
						key={option.value}
						className={cn(
							"border rounded-lg p-4 cursor-pointer transition-all",
							selectedDeliveryType === option.value
								? "border-primary ring-1 ring-primary bg-primary/5"
								: "hover:border-muted-foreground/50"
						)}
						onClick={() => onDeliveryTypeChange(option.value)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"w-4 h-4 rounded-full border flex items-center justify-center",
										selectedDeliveryType === option.value
											? "border-primary"
											: "border-muted-foreground"
									)}
								>
									{selectedDeliveryType === option.value && (
										<div className="w-2 h-2 rounded-full bg-primary" />
									)}
								</div>
								<div className="flex items-center gap-3">
									<Truck className="size-5 text-muted-foreground" />
									<div>
										<span className="font-medium">{option.label}</span>
										<p className="text-sm text-muted-foreground">
											{option.description}
										</p>
									</div>
								</div>
							</div>
							<span className="font-semibold">{option.price}</span>
						</div>
					</div>
				))}
			</div>
			{error && <p className="text-sm text-red-600">{error.message}</p>}
		</section>
	);
}
