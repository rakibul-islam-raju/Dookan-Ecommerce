import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
				<p className="text-muted-foreground">
					Enter your new password below to reset your account password.
				</p>
			</div>
			<form className="space-y-4">
				<div className="space-y-2">
					<label
						htmlFor="password"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						New Password
					</label>
					<Input
						id="password"
						type="password"
						autoComplete="new-password"
						required
					/>
				</div>
				<div className="space-y-2">
					<label
						htmlFor="confirm-password"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Confirm Password
					</label>
					<Input
						id="confirm-password"
						type="password"
						autoComplete="new-password"
						required
					/>
				</div>
				<Button className="w-full" type="submit">
					Reset Password
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
