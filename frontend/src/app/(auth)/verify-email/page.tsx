import { store } from "@/config/store";
import { Metadata } from "next";
import Link from "next/link";
import { EmailVerificationForm } from "./_components/EmailVerificationForm";

export const metadata: Metadata = {
	title: `Verify Email | ${store.title}`,
	description: `${store.title} - Verify your email address`,
	keywords: ["verify email", "verification", "OTP", `${store.title}`],
};

export default function VerifyEmailPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
				<p className="text-muted-foreground">
					We&apos;ve sent a 6-digit verification code to your email address.
				</p>
			</div>
			<EmailVerificationForm />
			<div className="text-center text-sm text-muted-foreground">
				<Link
					href="/login"
					className="font-medium text-primary hover:underline"
				>
					Back to login
				</Link>
			</div>
		</div>
	);
}
