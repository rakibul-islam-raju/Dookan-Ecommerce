"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import {
	Control,
	FieldValues,
	Path,
	useController,
	useFormContext,
} from "react-hook-form";
import { Input } from "../input";

interface OTPInputProps<T extends FieldValues> {
	name: Path<T>;
	length?: number;
	control?: Control<T>;
	className?: string;
	disabled?: boolean;
}

export function OTPInput<T extends FieldValues>({
	name,
	length = 6,
	control: externalControl,
	className,
	disabled = false,
}: OTPInputProps<T>) {
	const { control: contextControl } = useFormContext<T>();
	const control = externalControl || contextControl;

	const { field, fieldState } = useController({ name, control });
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	// Split value into array of digits
	const digits = (field.value as string)?.split("") || [];

	const handleChange = (index: number, value: string) => {
		// Only allow single digit
		const digit = value.slice(-1).replace(/\D/g, "");

		const newDigits = [...digits];
		newDigits[index] = digit;

		// Update form value
		field.onChange(newDigits.join("").slice(0, length));

		// Auto-focus next input
		if (digit && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !digits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, length);
		field.onChange(pastedData);

		// Focus the next empty input or the last one
		const nextIndex = Math.min(pastedData.length, length - 1);
		inputRefs.current[nextIndex]?.focus();
	};

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex gap-2 justify-center">
				{Array.from({ length }).map((_, index) => (
					<Input
						key={index}
						ref={(el) => {
							inputRefs.current[index] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digits[index] || ""}
						onChange={(e) => handleChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						onPaste={handlePaste}
						disabled={disabled}
						className={cn(
							"w-12 h-14 text-center text-2xl font-semibold",
							fieldState.error &&
								"border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
						)}
					/>
				))}
			</div>
			{fieldState.error && (
				<p className="text-sm text-red-500 text-center">
					{fieldState.error.message}
				</p>
			)}
		</div>
	);
}
