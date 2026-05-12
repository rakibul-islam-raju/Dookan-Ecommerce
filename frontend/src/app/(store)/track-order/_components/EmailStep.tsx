"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { useRequestGuestOrderOTP } from "@/lib/hooks/useOrders";
import { useTranslations } from "next-intl";
import { z } from "zod";

const schema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type EmailFormValues = z.infer<typeof schema>;

interface EmailStepProps {
	onSuccess: (email: string) => void;
}

export function EmailStep({ onSuccess }: EmailStepProps) {
	const t = useTranslations("trackOrder");
	const requestOTP = useRequestGuestOrderOTP();

	const form = useZodForm(schema, {
		defaultValues: { email: "" },
	});

	const onSubmit = (data: EmailFormValues) => {
		requestOTP.mutate(
			{ email: data.email },
			{ onSuccess: () => onSuccess(data.email) }
		);
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="space-y-4">
				<TextField<EmailFormValues>
					name="email"
					label={t("emailAddress")}
					placeholder="you@example.com"
					type="email"
				/>
				<LoadingButton
					type="submit"
					className="w-full"
					isLoading={requestOTP.isPending}
				>
					{t("sendOtp")}
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
