"use client";

import { Control, FieldValues, Path, useFormContext } from "react-hook-form";
import { FormDescription, FormMessage } from "../form";
import { Input } from "../input";
import { FormField } from "./FormField";

interface TextFieldProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	required?: boolean;
	placeholder?: string;
	type?: "text" | "email" | "password" | "number" | "time" | "tel";
	className?: string;
	control?: Control<T>;
	description?: string;
	helpText?: string;
	disabled?: boolean;
}

/**
 * A text field component.
 * @param name The name of the field.
 * @param label The label of the field.
 * @param type The type of the field.
 * @param placeholder The placeholder of the field.
 * @param required If the field is required.
 * @param className The class name of the field.
 * @param description The description of the field.
 * @param helpText The help text of the field.
 * @param disabled If the field is disabled.
 *
 * @returns The text field component.
 *
 * @example
 * ```tsx
 * <TextField name="name" label="Name" />
 * ```
 */

export function TextField<T extends FieldValues>({
	name,
	label,
	required = false,
	placeholder,
	type = "text",
	className,
	control: externalControl,
	description,
	helpText,
	disabled = false,
}: TextFieldProps<T>) {
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
					<Input
						{...field}
						type={type}
						placeholder={placeholder}
						className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
						disabled={disabled}
					/>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</div>
			)}
		</FormField>
	);
}

TextField.displayName = "TextField";
