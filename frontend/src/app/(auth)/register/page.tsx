import { store } from "@/config/store";
import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./_components/RegisterForm";

export const metadata: Metadata = {
	title: `Register | ${store.title}`,
	description: `${store.title} - Create your account`,
	keywords: ["register", "account", "sign up", `${store.title}`],
};

export default function RegisterPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
				<p className="text-muted-foreground">
					Enter your information to create an account
				</p>
			</div>
			<RegisterForm />
			<div className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link
					href="/login"
					className="font-medium text-primary hover:underline"
				>
					Sign in
				</Link>
			</div>
		</div>
	);
}
