import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
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

interface SiteConfigGeneralTabProps {
	t: TranslateFn;
}

export const SiteConfigGeneralTab = ({ t }: SiteConfigGeneralTabProps) => (
	<TabsContent value="general" className="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>
					<T
						id="store.siteConfig.general.title"
						defaultMessage="Store Identity"
					/>
				</CardTitle>
				<CardDescription>
					<T
						id="store.siteConfig.general.description"
						defaultMessage="Basic information shown to customers across the storefront."
					/>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<TextField
					name="tagline"
					label={t("store.siteConfig.fields.tagline", "Tagline")}
					placeholder={t(
						"store.siteConfig.fields.taglinePlaceholder",
						"e.g., Fresh Organic Products Delivered to Your Door",
					)}
					description={t(
						"store.siteConfig.fields.taglineHelp",
						"A short phrase that captures your store's value. Appears in the site header and SEO meta tags.",
					)}
				/>
				<TextareaField
					name="address"
					label={t("store.siteConfig.fields.address", "Physical Address")}
					placeholder={t(
						"store.siteConfig.fields.addressPlaceholder",
						"e.g., 123 Main St, Dhaka 1216, Bangladesh",
					)}
					description={t(
						"store.siteConfig.fields.addressHelp",
						"Your store's physical address. Shown in the footer and contact page.",
					)}
				/>
			</CardContent>
		</Card>
	</TabsContent>
);
