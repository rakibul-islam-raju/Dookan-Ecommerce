"use client";

import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { useCreateUserAddress } from "@/lib/hooks/useUser";
import { Loader2, Save } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { CheckoutFormValues } from "../_types";

interface CheckoutShippingAddressProps {
	isAuthenticated: boolean;
	hasDefaultAddress: boolean;
}

export function CheckoutShippingAddress({
	isAuthenticated,
	hasDefaultAddress,
}: CheckoutShippingAddressProps) {
	const form = useFormContext<CheckoutFormValues>();
	const createAddress = useCreateUserAddress();

	const [customerName, mobileNumber, addressLine1, city, postalCode] =
		form.watch([
			"customer_name",
			"mobile_number",
			"address_line1",
			"city",
			"postal_code",
		]);

	const canSaveAddress = !!(
		customerName &&
		mobileNumber &&
		addressLine1 &&
		city &&
		postalCode
	);

	const handleSaveAddress = async () => {
		const values = form.getValues();
		await createAddress.mutateAsync({
			address_type: "home",
			full_name: values.customer_name,
			mobile_number: values.mobile_number,
			address_line1: values.address_line1,
			address_line2: values.address_line2 || undefined,
			city: values.city,
			state: values.city,
			postal_code: values.postal_code,
			country: "Bangladesh",
		});
	};

	const showSaveButton = isAuthenticated && !hasDefaultAddress;

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold">Shipping Address</h2>
			<TextField
				name="customer_name"
				label="Full Name"
				placeholder="John Doe"
				required
			/>
			<TextField
				name="address_line1"
				label="Address Line 1"
				placeholder="123 Main Street"
				required
			/>
			<TextField
				name="address_line2"
				label="Address Line 2"
				placeholder="Apt 4B (optional)"
			/>
			<div className="grid grid-cols-2 gap-4">
				<TextField name="city" label="City" placeholder="Dhaka" required />
				<TextField
					name="postal_code"
					label="Postal Code"
					placeholder="1216"
					required
				/>
			</div>
			<TextField
				name="mobile_number"
				label="Delivery Contact Phone"
				placeholder="+880 1XX XXX XXXX"
				type="tel"
				required
			/>

			{showSaveButton && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={!canSaveAddress || createAddress.isPending}
					onClick={handleSaveAddress}
					className="mt-2"
				>
					{createAddress.isPending ? (
						<>
							<Loader2 className="size-4 mr-2 animate-spin" />
							Saving address...
						</>
					) : (
						<>
							<Save className="size-4 mr-2" />
							Save this address for future orders
						</>
					)}
				</Button>
			)}
		</section>
	);
}
