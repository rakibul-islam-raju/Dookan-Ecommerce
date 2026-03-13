"use client";

import { Form } from "@/components/ui/form";
import React from "react";
import {
	type FieldValues,
	FormProvider,
	type UseFormReturn,
} from "react-hook-form";

interface BaseFormProps<TFieldValues extends FieldValues> {
	form: UseFormReturn<TFieldValues>;
	onSubmit: (values: TFieldValues) => void;
	children: React.ReactNode;
	className?: string;
}

export function BaseForm<TFieldValues extends FieldValues>({
	form,
	onSubmit,
	children,
	className = "space-y-4",
}: BaseFormProps<TFieldValues>) {
	return (
		<FormProvider {...form}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className={className}>
					{children}
				</form>
			</Form>
		</FormProvider>
	);
}
