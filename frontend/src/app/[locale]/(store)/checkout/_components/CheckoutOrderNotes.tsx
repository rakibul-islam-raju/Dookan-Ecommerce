"use client";

import { useFormContext } from "react-hook-form";
import type { CheckoutFormValues } from "../_types";

export function CheckoutOrderNotes() {
	const form = useFormContext<CheckoutFormValues>();

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold">Order Notes (Optional)</h2>
			<div className="space-y-2">
				<textarea
					{...form.register("customer_note")}
					placeholder="Any special instructions for delivery..."
					className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					rows={4}
				/>
				{form.formState.errors.customer_note && (
					<p className="text-sm text-red-600">
						{form.formState.errors.customer_note.message}
					</p>
				)}
			</div>
		</section>
	);
}
