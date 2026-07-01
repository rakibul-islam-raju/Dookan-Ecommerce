"use client";

import { Link } from "@/i18n/navigation";
import { TextField } from "@/components/ui/@form/TextField";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { CheckoutFormValues } from "../_types";

interface CheckoutContactInfoProps {
	isAuthenticated: boolean;
}

export function CheckoutContactInfo({ isAuthenticated }: CheckoutContactInfoProps) {
	const t = useTranslations("checkoutPage");
	const form = useFormContext<CheckoutFormValues>();

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">{t("contactInformation")}</h2>
				{!isAuthenticated && (
					<Link href="/login" className="text-sm text-primary hover:underline">
						{t("alreadyHaveAccountLogin")}
					</Link>
				)}
			</div>
			<TextField
				name="customer_email"
				label={t("emailAddress")}
				placeholder="you@example.com"
				type="email"
				disabled={isAuthenticated}
			/>
			<TextField
				name="guest_mobile_number"
				label={t("mobileNumber")}
				placeholder="+880 1XX XXX XXXX"
				type="tel"
				required
				disabled={isAuthenticated}
			/>
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="newsletter"
					{...form.register("newsletter")}
					className="rounded border-input text-primary focus:ring-primary"
				/>
				<label htmlFor="newsletter" className="text-sm text-muted-foreground">
					{t("newsletter")}
				</label>
			</div>
		</section>
	);
}
