import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { T } from "@/i18n/translate";
import type { ChangeEvent } from "react";
import type { TranslateFn } from "./site-config-form";

interface SiteConfigBrandingTabProps {
	logoPreview: string | null;
	onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
	t: TranslateFn;
}

export const SiteConfigBrandingTab = ({
	logoPreview,
	onLogoChange,
	t,
}: SiteConfigBrandingTabProps) => (
	<TabsContent value="branding" className="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>
					<T id="store.siteConfig.branding.title" defaultMessage="Store Logo" />
				</CardTitle>
				<CardDescription>
					<T
						id="store.siteConfig.branding.description"
						defaultMessage="Your logo is displayed in the site header, emails, and invoices. Upload a new image to replace the current one."
					/>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					{logoPreview && (
						<div className="inline-block rounded-lg border bg-muted/30 p-4">
							<img
								src={logoPreview}
								alt={t("store.siteConfig.branding.currentLogo", "Current logo")}
								className="max-h-20 max-w-48 object-contain"
							/>
						</div>
					)}
					<div className="space-y-1.5">
						<Label htmlFor="logo">
							{logoPreview
								? t("store.siteConfig.branding.replaceLogo", "Replace Logo")
								: t("store.siteConfig.branding.uploadLogo", "Upload Logo")}
						</Label>
						<Input
							id="logo"
							type="file"
							accept="image/*"
							onChange={onLogoChange}
						/>
						<p className="text-sm text-muted-foreground">
							<T
								id="store.siteConfig.branding.logoHelp"
								defaultMessage="Recommended: square image, 200×200 px or larger (PNG or SVG preferred). Leave empty to keep the current logo."
							/>
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</TabsContent>
);
