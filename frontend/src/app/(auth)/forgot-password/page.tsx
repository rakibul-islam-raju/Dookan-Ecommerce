import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
				<p className="text-muted-foreground">
					Enter your email address and we&apos;ll send you a link to reset your
					password.
				</p>
			</div>
			<form className="space-y-4">
				<div className="space-y-2">
					<label
						htmlFor="email"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Email
					</label>
					<Input
						id="email"
						placeholder="m@example.com"
						type="email"
						autoCapitalize="none"
						autoComplete="email"
						autoCorrect="off"
						required
					/>
				</div>
				<Button className="w-full" type="submit">
					Send Reset Link
				</Button>
			</form>
			<div className="text-center text-sm text-muted-foreground">
				<Link
					href="/login"
					className="inline-flex items-center justify-center gap-2 font-medium text-primary hover:underline"
				>
					<ArrowLeft className="size-4" />
					Back to login
				</Link>
			</div>
		</div>
	);
}
