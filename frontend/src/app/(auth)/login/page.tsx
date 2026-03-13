import { store } from "@/config/store";
import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
	title: `Login | ${store.title}`,
	description: `${store.title} - Login to your account`,
	keywords: ["login", "account", "sign in", `${store.title}`],
};

export default function LoginPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
				<p className="text-muted-foreground">
					Enter your email to sign in to your account
				</p>
			</div>
			<LoginForm />
			<div className="text-center text-sm text-muted-foreground">
				<div className="text-primary font-medium mb-2">
					<Link href="/forgot-password">Forgot password?</Link>
				</div>
				<div className="mb-2">
					<Link
						href="/verify-email"
						className="text-xs text-muted-foreground hover:text-primary hover:underline"
					>
						Didn&apos;t receive verification email?
					</Link>
				</div>
				Don&apos;t have an account?{" "}
				<Link
					href="/register"
					className="font-medium text-primary hover:underline"
				>
					Sign up
				</Link>
			</div>
		</div>
	);
}
