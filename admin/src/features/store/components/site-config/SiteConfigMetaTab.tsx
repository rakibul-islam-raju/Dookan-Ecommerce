import { TextField } from "@/components/ui/@form/TextField";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { T } from "@/i18n/translate";
import { useStartMetaOAuth } from "@/lib/api/store";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import type { TranslateFn } from "./site-config-form";

interface SiteConfigMetaTabProps {
	t: TranslateFn;
}

export const SiteConfigMetaTab = ({ t }: SiteConfigMetaTabProps) => {
	const { mutate: startMetaOAuth, isPending } = useStartMetaOAuth();

	const handleConnect = () => {
		startMetaOAuth(undefined, {
			onSuccess: (data) => {
				window.location.assign(data.authorization_url);
			},
			onError: () => {
				toast.error(
					t(
						"store.siteConfig.meta.connectFailed",
						"Failed to start Facebook connection",
					),
				);
			},
		});
	};

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
							defaultMessage="Configure your Meta Pixel and Conversions API credentials. Enable or disable tracking from the Vendor settings."
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
				<CardFooter className="flex items-center justify-between border-t pt-4">
					<p className="text-sm text-muted-foreground">
						<T
							id="store.siteConfig.meta.connectHelp"
							defaultMessage="Use Facebook Login to find an existing Pixel ID. CAPI access token remains manual."
						/>
					</p>
					<Button
						type="button"
						variant="outline"
						onClick={handleConnect}
						disabled={isPending}
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<ExternalLink className="h-4 w-4" />
						)}
						<T
							id="store.siteConfig.meta.connectFacebook"
							defaultMessage="Connect Facebook"
						/>
					</Button>
				</CardFooter>
			</Card>
		</TabsContent>
	);
};
