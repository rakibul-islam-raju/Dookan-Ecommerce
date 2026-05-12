import RegisterPage from "@/app/(auth)/register/page";
import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "register");

	return buildLocalizedMetadata({
		locale,
		pathname: "/register",
		title: copy.title,
		description: copy.description,
		keywords: ["register", "sign up", "account"],
	});
}

export default RegisterPage;
