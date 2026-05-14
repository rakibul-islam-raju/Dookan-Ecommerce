import { getPageMetadataCopy } from "@/i18n/page-metadata";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "./_components/RegisterForm";

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

export default async function RegisterPage() {
	const t = await getTranslations("auth");

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">
					{t("registerTitle")}
				</h1>
				<p className="text-muted-foreground">
					{t("registerDescription")}
				</p>
			</div>
			<RegisterForm />
			<div className="text-center text-sm text-muted-foreground">
				{t("alreadyHaveAccount")}{" "}
				<Link
					href="/login"
					className="font-medium text-primary hover:underline"
				>
					{t("signIn")}
				</Link>
			</div>
		</div>
	);
}
