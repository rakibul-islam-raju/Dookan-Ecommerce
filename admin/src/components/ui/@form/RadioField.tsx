/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import {
	type Control,
	type FieldValues,
	type Path,
	useFormContext,
} from "react-hook-form";
import { FormDescription, FormLabel, FormMessage } from "../form";
import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { FormField } from "./FormField";

interface RadioFieldProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	required?: boolean;
	className?: string;
	control?: Control<T>;
	description?: string;
	options: any[];
	orientation?: "horizontal" | "vertical";
	layout?: "stacked" | "inline";
	optionLabel?: string;
	optionValue?: string;
}

export function RadioField<T extends FieldValues>({
	name,
	label,
	required = false,
	className,
	control: externalControl,
	description,
	options,
	layout = "stacked",
	orientation = "vertical",
	optionLabel = "label",
	optionValue = "value",
}: RadioFieldProps<T>) {
	const { control: contextControl } = useFormContext<T>();
	const control = externalControl || contextControl;

	return (
		<FormField<T>
			name={name}
			// label={label}
			required={required}
			className={className}
			control={control}
		>
			{({ field, error }) => (
				<div
					className={cn(
						"flex gap-4",
						layout === "stacked" ? "flex-col" : "flex-row items-center"
					)}
				>
					<FormLabel htmlFor={name}>{label}</FormLabel>
					<RadioGroup
						onValueChange={field.onChange}
						defaultValue={field.value}
						value={field.value}
						className={cn(
							"gap-4",
							orientation === "horizontal" ? "flex flex-row" : "flex flex-col"
						)}
					>
						{options?.map((option) => (
							<div
								key={option[optionValue]}
								className="flex items-center space-x-2"
							>
								<RadioGroupItem
									value={option[optionValue]}
									id={`${name}-${option[optionValue]}`}
									className={cn(
										error ? "border-red-500" : "",
										"cursor-pointer"
									)}
								/>
								<Label
									htmlFor={`${name}-${option[optionValue]}`}
									className="cursor-pointer text-sm font-normal"
								>
									{option[optionLabel]}
								</Label>
							</div>
						))}
					</RadioGroup>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</div>
			)}
		</FormField>
	);
}

RadioField.displayName = "RadioField";
