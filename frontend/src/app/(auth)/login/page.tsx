import { store } from "@/config/store";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
	title: `Login | ${store.title}`,
	description: `${store.title} - Login to your account`,
	keywords: ["login", "account", "sign in", `${store.title}`],
};

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
