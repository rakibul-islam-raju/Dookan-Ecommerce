/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

/**
 * Custom hook that integrates Zod schema validation with React Hook Form
 * @param schema - Zod schema for form validation
 * @param options - React Hook Form options (excluding resolver)
 * @returns UseFormReturn instance with Zod validation
 */
export function useZodForm<T extends z.ZodType<any, any>>(
	schema: T,
	options?: Omit<Parameters<typeof useForm<z.infer<T>>>[0], "resolver">
) {
	return useForm<z.infer<T>>({
		resolver: zodResolver(schema) as any,
		mode: "onChange",
		...options,
	});
}
