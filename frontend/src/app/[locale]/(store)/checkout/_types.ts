import { z } from "zod";

export const checkoutSchema = z.object({
	customer_name: z.string().min(1, "Full name is required"),
	customer_email: z
		.string()
		.email("Please enter a valid email address")
		.optional()
		.or(z.literal("")),
	guest_mobile_number: z.string().min(1, "Mobile number is required"),
	address_line1: z.string().min(1, "Address is required"),
	address_line2: z.string().optional(),
	city: z.string().min(1, "City is required"),
	postal_code: z.string().min(1, "Postal code is required"),
	mobile_number: z.string().min(1, "Delivery phone number is required"),
	delivery_type: z.enum(["inside_dhaka", "outside_dhaka"]),
	customer_note: z.string().optional(),
	newsletter: z.boolean().default(false),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
