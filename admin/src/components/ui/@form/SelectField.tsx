"use client";

import { cn } from "@/lib/utils";
import {
	type Control,
	type FieldValues,
	type Path,
	useFormContext,
} from "react-hook-form";
import { FormDescription, FormMessage } from "../form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../select";
import { FormField } from "./FormField";

interface SelectFieldProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	required?: boolean;
	placeholder?: string;
	className?: string;
	control?: Control<T>;
	description?: string;
	options: { value: string; label: string }[];
	disabled?: boolean;
	helpText?: string;
}

// Radix Select forbids empty-string values; use this sentinel internally
const EMPTY_SENTINEL = "__empty__";

function toRadix(value: string): string {
	return value === "" ? EMPTY_SENTINEL : value;
}

function fromRadix(value: string): string {
	return value === EMPTY_SENTINEL ? "" : value;
}

export function SelectField<T extends FieldValues>({
	name,
	label,
	required = false,
	placeholder = "Select an option",
	className,
	control: externalControl,
	description,
	options,
	disabled = false,
	helpText,
}: SelectFieldProps<T>) {
	const { control: contextControl } = useFormContext<T>();
	const control = externalControl || contextControl;

	return (
		<FormField<T>
			name={name}
			label={label}
			required={required}
			className={className}
			control={control}
			helpText={helpText}
		>
			{({ field, error }) => (
				<div className="space-y-2">
					<Select
						onValueChange={(val) => field.onChange(fromRadix(val))}
						defaultValue={toRadix(field.value ?? "")}
						value={toRadix(field.value ?? "")}
						disabled={disabled}
					>
						<SelectTrigger
							className={cn(
								error ? "border-red-500 focus:ring-red-500" : "",
								"w-full"
							)}
						>
							<SelectValue placeholder={placeholder ?? ""} />
						</SelectTrigger>
						<SelectContent>
							{options.map((option) => (
								<SelectItem key={toRadix(option.value)} value={toRadix(option.value)}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</div>
			)}
		</FormField>
	);
}

SelectField.displayName = "SelectField";
