import { useT } from "@/i18n/use-t";
import type { SiteConfigData } from "@/lib/api/store";
import { z } from "zod";

export type TranslateFn = ReturnType<typeof useT>;

export const createSiteConfigSchema = (t: TranslateFn) =>
	z.object({
		tagline: z
			.string()
			.max(
				200,
				t(
					"store.siteConfig.validation.taglineMax",
					"Tagline must not exceed 200 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		address: z
			.string()
			.max(
				500,
				t(
					"store.siteConfig.validation.addressMax",
					"Address must not exceed 500 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		phone: z
			.string()
			.max(
				20,
				t(
					"store.siteConfig.validation.phoneMax",
					"Phone must not exceed 20 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		email: z
			.string()
			.email(t("store.siteConfig.validation.email", "Invalid email address"))
			.optional()
			.or(z.literal("")),
		facebook_url: z
			.string()
			.url(t("store.siteConfig.validation.url", "Invalid URL"))
			.optional()
			.or(z.literal(""))
			.nullable(),
		instagram_url: z
			.string()
			.url(t("store.siteConfig.validation.url", "Invalid URL"))
			.optional()
			.or(z.literal(""))
			.nullable(),
		youtube_url: z
			.string()
			.url(t("store.siteConfig.validation.url", "Invalid URL"))
			.optional()
			.or(z.literal(""))
			.nullable(),
		inside_dhaka_delivery_charge: z.coerce
			.number()
			.min(
				0,
				t(
					"store.siteConfig.validation.chargeMin",
					"Charge cannot be negative",
				),
			),
		outside_dhaka_delivery_charge: z.coerce
			.number()
			.min(
				0,
				t(
					"store.siteConfig.validation.chargeMin",
					"Charge cannot be negative",
				),
			),
		free_shipping_threshold: z.coerce
			.number()
			.min(
				0,
				t(
					"store.siteConfig.validation.thresholdMin",
					"Threshold cannot be negative",
				),
			),
		tax_rate: z.coerce
			.number()
			.min(
				0,
				t(
					"store.siteConfig.validation.taxMin",
					"Tax rate cannot be negative",
				),
			)
			.max(
				100,
				t(
					"store.siteConfig.validation.taxMax",
					"Tax rate cannot exceed 100%",
				),
			),
		meta_pixel_id: z
			.string()
			.max(
				32,
				t(
					"store.siteConfig.validation.pixelIdMax",
					"Pixel ID must not exceed 32 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		meta_access_token: z.string().optional().or(z.literal("")),
		meta_test_event_code: z
			.string()
			.max(
				100,
				t(
					"store.siteConfig.validation.testEventMax",
					"Test event code must not exceed 100 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		meta_default_currency: z
			.string()
			.max(
				10,
				t(
					"store.siteConfig.validation.currencyMax",
					"Currency code must not exceed 10 characters",
				),
			)
			.optional()
			.or(z.literal("")),
	});

export type SiteConfigFormData = z.infer<
	ReturnType<typeof createSiteConfigSchema>
>;

export const siteConfigDefaultValues: SiteConfigFormData = {
	tagline: "",
	address: "",
	phone: "",
	email: "",
	facebook_url: "",
	instagram_url: "",
	youtube_url: "",
	inside_dhaka_delivery_charge: 60,
	outside_dhaka_delivery_charge: 120,
	free_shipping_threshold: 1000,
	tax_rate: 0,
	meta_pixel_id: "",
	meta_access_token: "",
	meta_test_event_code: "",
	meta_default_currency: "BDT",
};

export const getSiteConfigFormValues = (
	siteConfig: SiteConfigData,
): SiteConfigFormData => ({
	tagline: siteConfig.tagline || "",
	address: siteConfig.address || "",
	phone: siteConfig.phone || "",
	email: siteConfig.email || "",
	facebook_url: siteConfig.facebook_url || "",
	instagram_url: siteConfig.instagram_url || "",
	youtube_url: siteConfig.youtube_url || "",
	inside_dhaka_delivery_charge: parseFloat(
		siteConfig.inside_dhaka_delivery_charge ?? "60",
	),
	outside_dhaka_delivery_charge: parseFloat(
		siteConfig.outside_dhaka_delivery_charge ?? "120",
	),
	free_shipping_threshold: parseFloat(
		siteConfig.free_shipping_threshold ?? "1000",
	),
	tax_rate: parseFloat(siteConfig.tax_rate ?? "0"),
	meta_pixel_id: siteConfig.meta_pixel_id || "",
	meta_access_token: "",
	meta_test_event_code: siteConfig.meta_test_event_code || "",
	meta_default_currency: siteConfig.meta_default_currency || "BDT",
});
