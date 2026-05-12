"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
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
	const t = useTranslations("auth");
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (countdown <= 0) return;

		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [countdown]);

	const handleClick = async () => {
		await onResend();
		setCountdown(cooldownSeconds);
	};

	return (
		<Button
			type="button"
			variant="link"
			onClick={handleClick}
			disabled={countdown > 0 || isLoading}
			className={className}
		>
			{countdown > 0
				? t("resendOtpIn", { countdown })
				: isLoading
					? t("sending")
					: t("resendOtp")}
		</Button>
	);
}
