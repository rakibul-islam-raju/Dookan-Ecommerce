"use client";

import { TextField } from "@/components/ui/@form/TextField";
import { useTranslations } from "next-intl";
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
	const t = useTranslations("checkoutPage");
	const form = useFormContext<CheckoutFormValues>();

	const showSaveAddressOption = isAuthenticated && !hasDefaultAddress;

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold">{t("shippingAddress")}</h2>
			<TextField
				name="customer_name"
				label={t("fullName")}
				placeholder={t("fullNamePlaceholder")}
				required
			/>
			<TextField
				name="address_line1"
				label={t("addressLine1")}
				placeholder={t("addressLine1Placeholder")}
				required
			/>
			<TextField
				name="address_line2"
				label={t("addressLine2")}
				placeholder={t("addressLine2Placeholder")}
			/>
			<div className="grid grid-cols-2 gap-4">
				<TextField
					name="city"
					label={t("city")}
					placeholder={t("cityPlaceholder")}
					required
				/>
				<TextField
					name="postal_code"
					label={t("postalCode")}
					placeholder="1216"
					required
				/>
			</div>
			<TextField
				name="mobile_number"
				label={t("deliveryContactPhone")}
				placeholder="+880 1XX XXX XXXX"
				type="tel"
				required
			/>

			{showSaveAddressOption && (
				<label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
					<input
						type="checkbox"
						className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						{...form.register("save_address")}
					/>
					<span>{t("saveAddressFuture")}</span>
				</label>
			)}
		</section>
	);
}
