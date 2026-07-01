"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface GuestOrderSuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	orderNumber?: string;
}

export function GuestOrderSuccessModal({
	isOpen,
	onClose,
	orderNumber,
}: GuestOrderSuccessModalProps) {
	const t = useTranslations("guestOrder");
	const router = useRouter();
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (!isOpen) return;

		// Initialize countdown asynchronously to avoid synchronous setState in effect
		setTimeout(() => setCountdown(5), 0);

		const timer = setInterval(() => {
			setCountdown((prev) => {
				const next = prev - 1;
				if (next <= 0) {
					clearInterval(timer);
					router.push("/shop");
					onClose();
					return 0;
				}
				return next;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isOpen, router, onClose]);

	const handleNavigate = (path: string) => {
		onClose();
		router.push(path);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent showCloseButton={false} className="sm:max-w-md">
				<DialogHeader className="items-center text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-10 w-10 text-green-600" />
					</div>
					<DialogTitle className="text-2xl">
						{t("title")}
					</DialogTitle>
					{orderNumber && (
						<p className="text-sm text-muted-foreground">
							{t("orderNumber", { number: orderNumber })}
						</p>
					)}
				</DialogHeader>

				<DialogDescription className="text-center space-y-3">
					<p className="text-base">
						{t("thanks")}
					</p>
					<p className="text-sm text-muted-foreground">
						{t("phoneAvailable")}
					</p>
				</DialogDescription>

				<div className="flex items-center justify-center py-4">
					<div className="flex flex-col items-center">
						<div className="relative flex h-16 w-16 items-center justify-center">
							<svg className="h-16 w-16 -rotate-90 transform">
								<circle
									cx="32"
									cy="32"
									r="28"
									stroke="currentColor"
									strokeWidth="4"
									fill="none"
									className="text-muted"
								/>
								<circle
									cx="32"
									cy="32"
									r="28"
									stroke="currentColor"
									strokeWidth="4"
									fill="none"
									strokeDasharray={175.93}
									strokeDashoffset={175.93 - (countdown / 5) * 175.93}
									className="text-primary transition-all duration-1000 ease-linear"
								/>
							</svg>
							<span className="absolute text-2xl font-bold">{countdown}</span>
						</div>
						<p className="mt-2 text-sm text-muted-foreground">
							{t("redirecting")}
						</p>
					</div>
				</div>

				<DialogFooter className="flex-col gap-2 sm:flex-col">
					<Button
						onClick={() => handleNavigate("/shop")}
						className="w-full"
						size="lg"
					>
						<ShoppingBag className="mr-2 h-4 w-4" />
						{t("continueShopping")}
					</Button>
					<Button
						onClick={() => handleNavigate("/")}
						variant="outline"
						className="w-full"
						size="lg"
					>
						<Home className="mr-2 h-4 w-4" />
						{t("goHome")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
