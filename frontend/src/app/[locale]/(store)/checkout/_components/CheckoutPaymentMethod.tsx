import { useTranslations } from "next-intl";

export function CheckoutPaymentMethod() {
	const t = useTranslations("checkoutPage");
	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold">{t("paymentMethod")}</h2>
			<p className="text-sm text-muted-foreground">
				{t("paymentSecure")}
			</p>
			<div className="border rounded-lg p-4 bg-muted/30">
				<div className="flex items-center gap-3">
					<div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
						<div className="w-2 h-2 rounded-full bg-primary" />
					</div>
					<div>
						<span className="font-medium">{t("cod")}</span>
						<p className="text-sm text-muted-foreground">
							{t("codDescription")}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
