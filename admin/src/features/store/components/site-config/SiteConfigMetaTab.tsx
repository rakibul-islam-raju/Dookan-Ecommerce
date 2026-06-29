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

interface SiteConfigMetaTabProps {
	t: TranslateFn;
}

export const SiteConfigMetaTab = ({ t }: SiteConfigMetaTabProps) => {
	return (
		<TabsContent value="meta" className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>
						<T
							id="store.siteConfig.meta.title"
							defaultMessage="Meta Pixel Credentials"
						/>
					</CardTitle>
					<CardDescription>
						<T
							id="store.siteConfig.meta.description"
							defaultMessage="Configure your Meta Pixel and Conversions API credentials manually. Enable or disable tracking from the Vendor settings."
						/>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<TextField
						name="meta_pixel_id"
						label={t("store.siteConfig.fields.pixelId", "Pixel ID")}
						placeholder="e.g., 1234567890123456"
						description={t(
							"store.siteConfig.fields.pixelIdHelp",
							"Your Meta Pixel ID. Found in Events Manager under Data Sources.",
						)}
					/>
					<TextField
						name="meta_access_token"
						label={t("store.siteConfig.fields.accessToken", "Access Token")}
						type="password"
						placeholder={t(
							"store.siteConfig.fields.accessTokenPlaceholder",
							"Leave blank to keep the current token",
						)}
						description={t(
							"store.siteConfig.fields.accessTokenHelp",
							"Conversions API access token. Leave blank to keep the existing token unchanged.",
						)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<TextField
							name="meta_test_event_code"
							label={t("store.siteConfig.fields.testEventCode", "Test Event Code")}
							placeholder="e.g., TEST12345"
							description={t(
								"store.siteConfig.fields.testEventCodeHelp",
								"Optional. Use during testing to verify events in Test Events tab.",
							)}
						/>
						<TextField
							name="meta_default_currency"
							label={t(
								"store.siteConfig.fields.defaultCurrency",
								"Default Currency",
							)}
							placeholder="BDT"
							description={t(
								"store.siteConfig.fields.defaultCurrencyHelp",
								"ISO currency code for purchase events (e.g., BDT, USD).",
							)}
						/>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
};
