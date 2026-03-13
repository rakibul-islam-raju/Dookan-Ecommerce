"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ResendOTPButtonProps {
	onResend: () => void | Promise<void>;
	cooldownSeconds?: number;
	isLoading?: boolean;
	className?: string;
}

export function ResendOTPButton({
	onResend,
	cooldownSeconds = 60,
	isLoading = false,
	className,
}: ResendOTPButtonProps) {
	const [countdown, setCountdown] = useState(0);
	const [isCooldown, setIsCooldown] = useState(false);

	useEffect(() => {
		if (countdown <= 0) {
			setIsCooldown(false);
			return;
		}

		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [countdown]);

	const handleClick = async () => {
		await onResend();
		setCountdown(cooldownSeconds);
		setIsCooldown(true);
	};

	return (
		<Button
			type="button"
			variant="link"
			onClick={handleClick}
			disabled={isCooldown || isLoading}
			className={className}
		>
			{isCooldown
				? `Resend OTP in ${countdown}s`
				: isLoading
					? "Sending..."
					: "Resend OTP"}
		</Button>
	);
}
