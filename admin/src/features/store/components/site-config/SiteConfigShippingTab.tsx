import { TextField } from "@/components/ui/@form/TextField";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { T } from "@/i18n/translate";
import type { TranslateFn } from "./site-config-form";

interface SiteConfigShippingTabProps {
	t: TranslateFn;
}

export const SiteConfigShippingTab = ({ t }: SiteConfigShippingTabProps) => (
	<TabsContent value="shipping" className="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>
					<T
						id="store.siteConfig.shipping.chargesTitle"
						defaultMessage="Delivery Charges"
					/>
				</CardTitle>
				<CardDescription>
					<T
						id="store.siteConfig.shipping.chargesDescription"
						defaultMessage="Flat delivery fees charged at checkout based on the customer's location. These amounts are shown to customers during order placement."
					/>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="inside_dhaka_delivery_charge"
						label={t("store.siteConfig.fields.insideDhaka", "Inside Dhaka (৳)")}
						type="number"
						placeholder="60"
						description={t(
							"store.siteConfig.fields.insideDhakaHelp",
							"Delivery fee for orders shipped within Dhaka city.",
						)}
					/>
					<TextField
						name="outside_dhaka_delivery_charge"
						label={t("store.siteConfig.fields.outsideDhaka", "Outside Dhaka (৳)")}
						type="number"
						placeholder="120"
						description={t(
							"store.siteConfig.fields.outsideDhakaHelp",
							"Delivery fee for orders shipped outside Dhaka.",
						)}
					/>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>
					<T
						id="store.siteConfig.shipping.freeTitle"
						defaultMessage="Free Shipping"
					/>
				</CardTitle>
				<CardDescription>
					<T
						id="store.siteConfig.shipping.freeDescription"
						defaultMessage="Automatically waive the delivery fee when a customer's order subtotal meets the threshold below."
					/>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TextField
					name="free_shipping_threshold"
					label={t(
						"store.siteConfig.fields.freeShippingThreshold",
						"Minimum Order Amount for Free Shipping (৳)",
					)}
					type="number"
					placeholder="1000"
					description={t(
						"store.siteConfig.fields.freeShippingThresholdHelp",
						"Customers whose subtotal is at or above this amount pay ৳0 for delivery. Set to 0 to disable free shipping entirely.",
					)}
				/>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>
					<T id="store.siteConfig.shipping.taxTitle" defaultMessage="Tax" />
				</CardTitle>
				<CardDescription>
					<T
						id="store.siteConfig.shipping.taxDescription"
						defaultMessage="Configure the tax rate applied to orders at checkout."
					/>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TextField
					name="tax_rate"
					label={t("store.siteConfig.fields.taxRate", "Tax Rate (%)")}
					type="number"
					placeholder="0"
					description={t(
						"store.siteConfig.fields.taxRateHelp",
						"Percentage tax applied to the order subtotal after discounts (e.g. enter 5 for 5% VAT). Set to 0 for tax-free orders.",
					)}
				/>
			</CardContent>
		</Card>
	</TabsContent>
);
