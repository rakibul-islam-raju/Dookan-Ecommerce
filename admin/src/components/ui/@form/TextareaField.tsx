import { cn } from "@/lib/utils";
import {
	type Control,
	type FieldValues,
	type Path,
	useFormContext,
} from "react-hook-form";
import { FormDescription, FormMessage } from "../form";
import { Textarea } from "../textarea";
import { FormField } from "./FormField";

interface TextareaFieldProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	required?: boolean;
	placeholder?: string;
	className?: string;
	control?: Control<T>;
	description?: string;
	rows?: number;
	helpText?: string;
}

export function TextareaField<T extends FieldValues>({
	name,
	label,
	required = false,
	placeholder,
	className,
	control: externalControl,
	description,
	rows = 4,
	helpText,
}: TextareaFieldProps<T>) {
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
					<Textarea
						{...field}
						placeholder={placeholder}
						rows={rows}
						className={cn(error && "border-red-500 focus-visible:ring-red-500")}
					/>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</div>
			)}
		</FormField>
	);
}

TextareaField.displayName = "TextareaField";
