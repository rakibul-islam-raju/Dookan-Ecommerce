import VerifyEmailPage from "@/app/(auth)/verify-email/page";
import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "verifyEmail");

	return buildLocalizedMetadata({
		locale,
		pathname: "/verify-email",
		title: copy.title,
		description: copy.description,
		keywords: ["verify email", "otp", "account verification"],
	});
}

export default VerifyEmailPage;
