import { z } from "zod";

type CheckoutT = (key: string) => string;

export const createCheckoutSchema = (t: CheckoutT) => z.object({
	customer_name: z.string().min(1, t("validation.fullNameRequired")),
	customer_email: z
		.string()
		.email(t("validation.invalidEmail"))
		.optional()
		.or(z.literal("")),
	guest_mobile_number: z.string().min(1, t("validation.mobileRequired")),
	address_line1: z.string().min(1, t("validation.addressRequired")),
	address_line2: z.string().optional(),
	city: z.string().min(1, t("validation.cityRequired")),
	postal_code: z.string().min(1, t("validation.postalCodeRequired")),
	mobile_number: z.string().min(1, t("validation.deliveryPhoneRequired")),
	delivery_type: z.enum(["inside_dhaka", "outside_dhaka"]),
	customer_note: z.string().optional(),
	newsletter: z.boolean().default(false),
});

export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>;
