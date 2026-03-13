/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
	useFormContext,
} from "react-hook-form";
import { FormLabel } from "../form";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

interface FormFieldProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	required?: boolean;
	error?: string;
	className?: string;
	control?: Control<T>;
	helpText?: string;
	children: (props: {
		field: {
			value: any;
			onChange: (value: any) => void;
			onBlur: () => void;
			name: string;
		};
		error?: string;
	}) => React.ReactNode;
	customLabel?: React.ReactNode;
}

export function FormField<T extends FieldValues>({
	name,
	label,
	required = false,
	error,
	className,
	control: externalControl,
	children,
	helpText,
	customLabel,
}: FormFieldProps<T>) {
	const { control: contextControl } = useFormContext<T>();
	const control = externalControl || contextControl;

	return (
		<div className={cn("space-y-2", className)}>
			{customLabel
				? customLabel
				: label && (
						<label className="flex items-center gap-2 text-sm font-medium">
							<FormLabel htmlFor={name}>{label}</FormLabel>
							{helpText && (
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="cursor-help text-sm text-gray-500 hover:text-gray-700">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<circle cx="12" cy="12" r="10" />
												<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
												<line x1="12" y1="17" x2="12.01" y2="17" />
											</svg>
										</span>
									</TooltipTrigger>
									<TooltipContent side="right">{helpText}</TooltipContent>
								</Tooltip>
							)}
							{required && <span className="ml-1 text-red-500">*</span>}
						</label>
				  )}
			<Controller
				name={name}
				control={control}
				render={({ field, fieldState }) => (
					<>
						{children({
							field,
							error: fieldState.error?.message,
						})}
						{(error || fieldState.error?.message) && (
							<p className="text-sm text-red-500">
								{error || fieldState.error?.message}
							</p>
						)}
					</>
				)}
			/>
		</div>
	);
}
