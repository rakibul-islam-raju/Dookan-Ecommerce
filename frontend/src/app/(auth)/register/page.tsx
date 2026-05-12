import { store } from "@/config/store";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { RegisterForm } from "./_components/RegisterForm";

export const metadata: Metadata = {
	title: `Register | ${store.title}`,
	description: `${store.title} - Create your account`,
	keywords: ["register", "account", "sign up", `${store.title}`],
};

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
