import { getPageMetadataCopy } from "@/i18n/page-metadata";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./_components/LoginForm";

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

export default async function LoginPage() {
	const t = await getTranslations("auth");

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">{t("loginTitle")}</h1>
				<p className="text-muted-foreground">
					{t("loginDescription")}
				</p>
			</div>
			<LoginForm />
			<div className="text-center text-sm text-muted-foreground">
				<div className="text-primary font-medium mb-2">
					<Link href="/forgot-password">{t("forgotPasswordLink")}</Link>
				</div>
				<div className="mb-2">
					<Link
						href="/verify-email"
						className="text-xs text-muted-foreground hover:text-primary hover:underline"
					>
						{t("verificationMissing")}
					</Link>
				</div>
				{t("noAccount")}{" "}
				<Link
					href="/register"
					className="font-medium text-primary hover:underline"
				>
					{t("signUp")}
				</Link>
			</div>
		</div>
	);
}
