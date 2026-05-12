import { store } from "@/config/store";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { EmailVerificationForm } from "./_components/EmailVerificationForm";

export const metadata: Metadata = {
	title: `Verify Email | ${store.title}`,
	description: `${store.title} - Verify your email address`,
	keywords: ["verify email", "verification", "OTP", `${store.title}`],
};

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
