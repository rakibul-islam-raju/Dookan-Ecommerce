import LoginPage from "@/app/(auth)/login/page";
import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "login");

	return buildLocalizedMetadata({
		locale,
		pathname: "/login",
		title: copy.title,
		description: copy.description,
		keywords: ["login", "sign in", "account"],
	});
}

export default LoginPage;
