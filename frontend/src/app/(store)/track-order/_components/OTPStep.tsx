"use client";

import { IMyOrderListItem } from "@/@types/Order";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { OTPInput } from "@/components/ui/@form/OTPInput";
import { ResendOTPButton } from "@/components/ui/@form/ResendOTPButton";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useRequestGuestOrderOTP,
	useTrackGuestOrders,
} from "@/lib/hooks/useOrders";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const schema = z.object({
	otp_code: z
		.string()
		.length(6, "OTP must be exactly 6 digits")
		.regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type OTPFormValues = z.infer<typeof schema>;

interface OTPStepProps {
	email: string;
	onSuccess: (otp: string, orders: IMyOrderListItem[]) => void;
	onBack: () => void;
}

export function OTPStep({ email, onSuccess, onBack }: OTPStepProps) {
	const trackOrders = useTrackGuestOrders();
	const resendOTP = useRequestGuestOrderOTP();

	const form = useZodForm(schema, {
		defaultValues: { otp_code: "" },
	});

	const onSubmit = (data: OTPFormValues) => {
		trackOrders.mutate(
			{ email, otp_code: data.otp_code },
			{ onSuccess: (orders) => onSuccess(data.otp_code, orders) }
		);
	};

	const handleResend = () => {
		resendOTP.mutate({ email });
	};

	return (
		<div className="space-y-6">
			<Button variant="ghost" onClick={onBack} className="px-0">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back
			</Button>

			<div className="text-center">
				<p className="text-sm text-muted-foreground">
					Enter the code sent to <span className="font-medium">{email}</span>
				</p>
			</div>

			<BaseForm form={form} onSubmit={onSubmit}>
				<div className="space-y-6">
					<OTPInput<OTPFormValues> name="otp_code" />

					<LoadingButton
						type="submit"
						className="w-full"
						isLoading={trackOrders.isPending}
					>
						Verify & Track Orders
					</LoadingButton>

					<div className="text-center">
						<ResendOTPButton
							onResend={handleResend}
							isLoading={resendOTP.isPending}
						/>
					</div>
				</div>
			</BaseForm>
		</div>
	);
}
