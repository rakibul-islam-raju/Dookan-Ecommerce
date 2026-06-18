import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { T } from "@/i18n/translate";
import { SiteConfigBrandingTab } from "./SiteConfigBrandingTab";
import { SiteConfigContactTab } from "./SiteConfigContactTab";
import { SiteConfigGeneralTab } from "./SiteConfigGeneralTab";
import { SiteConfigMetaTab } from "./SiteConfigMetaTab";
import { SiteConfigShippingTab } from "./SiteConfigShippingTab";
import type { TranslateFn } from "./site-config-form";
import type { ChangeEvent } from "react";

interface SiteConfigTabsProps {
	logoPreview: string | null;
	onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
	showMetaTab: boolean;
	defaultTab?: string;
	t: TranslateFn;
}

export const SiteConfigTabs = ({
	logoPreview,
	onLogoChange,
	showMetaTab,
	defaultTab = "general",
	t,
}: SiteConfigTabsProps) => (
	<Tabs defaultValue={defaultTab}>
		<TabsList className="mb-6">
			<TabsTrigger value="general">
				<T id="store.siteConfig.tabs.general" defaultMessage="General" />
			</TabsTrigger>
			<TabsTrigger value="contact">
				<T
					id="store.siteConfig.tabs.contact"
					defaultMessage="Contact & Social"
				/>
			</TabsTrigger>
			<TabsTrigger value="shipping">
				<T
					id="store.siteConfig.tabs.shipping"
					defaultMessage="Shipping & Tax"
				/>
			</TabsTrigger>
			<TabsTrigger value="branding">
				<T id="store.siteConfig.tabs.branding" defaultMessage="Branding" />
			</TabsTrigger>
			{showMetaTab && (
				<TabsTrigger value="meta">
					<T id="store.siteConfig.tabs.meta" defaultMessage="Meta Tracking" />
				</TabsTrigger>
			)}
		</TabsList>

		<SiteConfigGeneralTab t={t} />
		<SiteConfigContactTab t={t} />
		<SiteConfigShippingTab t={t} />
		{showMetaTab && <SiteConfigMetaTab t={t} />}
		<SiteConfigBrandingTab
			logoPreview={logoPreview}
			onLogoChange={onLogoChange}
			t={t}
		/>
	</Tabs>
);
