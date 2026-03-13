import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetPassword() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Set Password</CardTitle>
				<CardDescription>Enter your new password below</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="password">New Password</Label>
						<Input id="password" type="password" required />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="confirm-password">Confirm Password</Label>
						<Input id="confirm-password" type="password" required />
					</div>
					<Button type="submit" className="w-full">
						Set Password
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
