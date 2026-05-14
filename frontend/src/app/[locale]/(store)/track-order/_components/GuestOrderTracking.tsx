"use client";

import { IMyOrderListItem } from "@/@types/Order";
import { useState } from "react";
import { EmailStep } from "./EmailStep";
import { OrdersStep } from "./OrdersStep";
import { OTPStep } from "./OTPStep";

type Step = "email" | "otp" | "orders";

export function GuestOrderTracking() {
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [orders, setOrders] = useState<IMyOrderListItem[]>([]);
	const [otpCode, setOtpCode] = useState("");

	const handleEmailSubmit = (submittedEmail: string) => {
		setEmail(submittedEmail);
		setStep("otp");
	};

	const handleOTPSubmit = (otp: string, ordersList: IMyOrderListItem[]) => {
		setOtpCode(otp);
		setOrders(ordersList);
		setStep("orders");
	};

	const handleBack = () => {
		if (step === "otp") setStep("email");
		if (step === "orders") setStep("otp");
	};

	const handleReset = () => {
		setStep("email");
		setEmail("");
		setOrders([]);
		setOtpCode("");
	};

	return (
		<div>
			{step === "email" && <EmailStep onSuccess={handleEmailSubmit} />}
			{step === "otp" && (
				<OTPStep email={email} onSuccess={handleOTPSubmit} onBack={handleBack} />
			)}
			{step === "orders" && (
				<OrdersStep
					orders={orders}
					email={email}
					otpCode={otpCode}
					onReset={handleReset}
				/>
			)}
		</div>
	);
}
