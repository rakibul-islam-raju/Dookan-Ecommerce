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

interface SiteConfigContactTabProps {
	t: TranslateFn;
}

export const SiteConfigContactTab = ({ t }: SiteConfigContactTabProps) => (
	<TabsContent value="contact" className="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>
					<T
						id="store.siteConfig.contact.title"
						defaultMessage="Contact Information"
					/>
				</CardTitle>
				<CardDescription>
					<T
						id="store.siteConfig.contact.description"
						defaultMessage="How customers can reach your store directly."
					/>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="phone"
						label={t("store.siteConfig.fields.phone", "Phone Number")}
						placeholder={t(
							"store.siteConfig.fields.phonePlaceholder",
							"e.g., +880 1700 000000",
						)}
						description={t(
							"store.siteConfig.fields.phoneHelp",
							"Primary contact number. Displayed in the footer and contact page.",
						)}
					/>
					<TextField
						name="email"
						label={t("store.siteConfig.fields.email", "Email Address")}
						type="email"
						placeholder={t(
							"store.siteConfig.fields.emailPlaceholder",
							"e.g., support@yourstore.com",
						)}
						description={t(
							"store.siteConfig.fields.emailHelp",
							"Customer-facing support email.",
						)}
					/>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>
					<T id="store.siteConfig.social.title" defaultMessage="Social Media" />
				</CardTitle>
				<CardDescription>
					<T
						id="store.siteConfig.social.description"
						defaultMessage="Links to your social media pages. Leave a field empty to hide its icon from the storefront."
					/>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<TextField
					name="facebook_url"
					label={t("store.siteConfig.fields.facebook", "Facebook Page URL")}
					placeholder="https://facebook.com/yourstore"
					description={t(
						"store.siteConfig.fields.facebookHelp",
						"Full URL to your Facebook business page.",
					)}
				/>
				<TextField
					name="instagram_url"
					label={t("store.siteConfig.fields.instagram", "Instagram Profile URL")}
					placeholder="https://instagram.com/yourstore"
					description={t(
						"store.siteConfig.fields.instagramHelp",
						"Full URL to your Instagram profile.",
					)}
				/>
				<TextField
					name="youtube_url"
					label={t("store.siteConfig.fields.youtube", "YouTube Channel URL")}
					placeholder="https://youtube.com/@yourstore"
					description={t(
						"store.siteConfig.fields.youtubeHelp",
						"Full URL to your YouTube channel.",
					)}
				/>
			</CardContent>
		</Card>
	</TabsContent>
);
