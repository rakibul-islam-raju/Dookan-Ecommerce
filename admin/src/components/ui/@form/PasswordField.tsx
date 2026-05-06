import { cn } from "@/lib/utils";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
	type Control,
	type FieldValues,
	type Path,
	useFormContext,
} from "react-hook-form";
import { Button } from "../button";
import { FormDescription, FormLabel, FormMessage } from "../form";
import { Input } from "../input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { FormField } from "./FormField";
import { Link } from "react-router-dom";

interface PasswordFieldProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	required?: boolean;
	placeholder?: string;
	className?: string;
	control?: Control<T>;
	description?: string;
	forgetPassword?: boolean;
	forgetPasswordPath?: string;
	helpText?: string;
}

export function PasswordField<T extends FieldValues>({
	name,
	label,
	required = false,
	placeholder,
	className,
	control: externalControl,
	description,
	forgetPassword,
	forgetPasswordPath,
	helpText,
}: PasswordFieldProps<T>) {
	const t = useT();
	const { control: contextControl } = useFormContext<T>();
	const control = externalControl || contextControl;
	const [showPassword, setShowPassword] = useState(false);

	const labelWithForgetPass = forgetPassword && forgetPasswordPath && (
		<div className="gapx-2 flex items-center justify-between">
			<div className="flex items-center gap-2 text-sm font-medium">
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
			</div>
			<Link to={forgetPasswordPath} className="text-muted-foreground text-sm">
				<T id="passwordField.forgotPassword" defaultMessage="Forgot Password?" />
			</Link>
		</div>
	);

	return (
		<FormField<T>
			name={name}
			label={label}
			required={required}
			className={className}
			control={control}
			customLabel={labelWithForgetPass}
		>
			{({ field, error }) => (
				<div className="space-y-2">
					<div className="relative">
						<Input
							{...field}
							id={name}
							type={showPassword ? "text" : "password"}
							placeholder={placeholder}
							className={cn(
								"pr-10",
								error ? "border-red-500 focus-visible:ring-red-500" : ""
							)}
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4 text-gray-500" />
							) : (
								<Eye className="h-4 w-4 text-gray-500" />
							)}
							<span className="sr-only">
								{showPassword
									? t("passwordField.hidePassword", "Hide password")
									: t("passwordField.showPassword", "Show password")}
							</span>
						</Button>
					</div>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</div>
			)}
		</FormField>
	);
}

PasswordField.displayName = "PasswordField";
