import { getPageMetadataCopy } from "@/i18n/page-metadata";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { EmailVerificationForm } from "./_components/EmailVerificationForm";

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

export default async function VerifyEmailPage() {
	const t = await getTranslations("auth");

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">
					{t("verifyEmailTitle")}
				</h1>
				<p className="text-muted-foreground">
					{t("verifyEmailDescription")}
				</p>
			</div>
			<EmailVerificationForm />
			<div className="text-center text-sm text-muted-foreground">
				<Link
					href="/login"
					className="font-medium text-primary hover:underline"
				>
					{t("backToLogin")}
				</Link>
			</div>
		</div>
	);
}
