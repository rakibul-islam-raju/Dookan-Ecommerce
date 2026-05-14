import { T } from "@/i18n/translate";

export const SiteConfigPageHeader = () => (
	<div>
		<h1 className="text-3xl font-bold tracking-tight">
			<T id="store.siteConfig.title" defaultMessage="Site Settings" />
		</h1>
		<p className="text-muted-foreground">
			<T
				id="store.siteConfig.description"
				defaultMessage="Manage your store's general settings"
			/>
		</p>
	</div>
);
