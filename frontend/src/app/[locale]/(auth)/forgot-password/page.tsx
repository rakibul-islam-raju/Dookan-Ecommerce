import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "forgotPassword");

	return buildLocalizedMetadata({
		locale,
		pathname: "/forgot-password",
		title: copy.title,
		description: copy.description,
	});
}

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
