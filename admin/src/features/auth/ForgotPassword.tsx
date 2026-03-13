import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export function ForgotPassword() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Forgot Password</CardTitle>
				<CardDescription>
					Enter your email below to receive a password reset link
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Send Reset Link
					</Button>
				</div>
			</CardContent>
			<CardFooter>
				<Link
					to="/login"
					className="text-sm text-center w-full text-muted-foreground hover:underline"
				>
					Remember your password? Login
				</Link>
			</CardFooter>
		</Card>
	);
}
