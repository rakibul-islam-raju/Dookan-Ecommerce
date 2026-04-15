"use client";

import { type Control, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormDescription } from "@/components/ui/form";
import { FormField } from "./FormField";

interface DateFieldProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	required?: boolean;
	placeholder?: string;
	className?: string;
	control?: Control<T>;
	description?: string;
	helpText?: string;
	disabled?: boolean;
}

/**
 * A date picker field backed by shadcn Calendar + Popover.
 * Stores and outputs values as "YYYY-MM-DD" strings.
 */
export function DateField<T extends FieldValues>({
	name,
	label,
	required = false,
	placeholder = "Pick a date",
	className,
	control: externalControl,
	description,
	helpText,
	disabled = false,
}: DateFieldProps<T>) {
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
			{({ field, error }) => {
				const selected = field.value ? parseISO(field.value as string) : undefined;

				return (
					<div className="space-y-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="outline"
									disabled={disabled}
									className={cn(
										"w-full justify-start text-left font-normal",
										!field.value && "text-muted-foreground",
										error && "border-red-500 focus-visible:ring-red-500"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{selected ? format(selected, "PPP") : placeholder}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									captionLayout="dropdown"
									selected={selected}
									onSelect={(date) =>
										field.onChange(date ? format(date, "yyyy-MM-dd") : "")
									}
									disabled={disabled}
									autoFocus
								/>
							</PopoverContent>
						</Popover>
						{description && <FormDescription>{description}</FormDescription>}
					</div>
				);
			}}
		</FormField>
	);
}

DateField.displayName = "DateField";
