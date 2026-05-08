/* eslint-disable react-hooks/set-state-in-effect */
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { getSiteConfig, useUpdateSiteConfig } from "@/lib/api/store";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

type TranslateFn = ReturnType<typeof useT>;

const createSiteConfigSchema = (t: TranslateFn) =>
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
			.email(
				t("store.siteConfig.validation.email", "Invalid email address"),
			)
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

type SiteConfigFormData = z.infer<ReturnType<typeof createSiteConfigSchema>>;

export function SiteConfig() {
	const t = useT();
	const { data: siteConfig, isLoading } = useQuery(getSiteConfig());
	const { mutate: updateSiteConfig, isPending } = useUpdateSiteConfig();
	const { vendorContext } = useAuthStore();
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const form = useZodForm(createSiteConfigSchema(t), {
		defaultValues: {
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
		},
	});

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setLogoFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const onSubmit = async (data: SiteConfigFormData) => {
		const payload: Parameters<typeof updateSiteConfig>[0] = {
			...data,
			facebook_url: data.facebook_url || null,
			instagram_url: data.instagram_url || null,
			youtube_url: data.youtube_url || null,
			...(logoFile && { logo: logoFile }),
		};
		if (!data.meta_access_token) {
			delete payload.meta_access_token;
		}
		updateSiteConfig(
			payload,
				{
					onSuccess: () => {
						toast.success(
							t(
								"store.siteConfig.toast.updateSuccess",
								"Site configuration updated successfully",
							),
						);
						setLogoFile(null);
					},
				}
		);
	};

	useEffect(() => {
		if (siteConfig) {
			form.reset({
				tagline: siteConfig.tagline || "",
				address: siteConfig.address || "",
				phone: siteConfig.phone || "",
				email: siteConfig.email || "",
				facebook_url: siteConfig.facebook_url || "",
				instagram_url: siteConfig.instagram_url || "",
				youtube_url: siteConfig.youtube_url || "",
				inside_dhaka_delivery_charge: parseFloat(
					siteConfig.inside_dhaka_delivery_charge ?? "60"
				),
				outside_dhaka_delivery_charge: parseFloat(
					siteConfig.outside_dhaka_delivery_charge ?? "120"
				),
				free_shipping_threshold: parseFloat(
					siteConfig.free_shipping_threshold ?? "1000"
				),
				tax_rate: parseFloat(siteConfig.tax_rate ?? "0"),
				meta_pixel_id: siteConfig.meta_pixel_id || "",
				meta_access_token: "",
				meta_test_event_code: siteConfig.meta_test_event_code || "",
				meta_default_currency: siteConfig.meta_default_currency || "BDT",
			});
			if (siteConfig.logo) {
				setLogoPreview(siteConfig.logo);
			}
		}
	}, [siteConfig]);

	if (isLoading) {
		return (
			<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							<T id="store.siteConfig.title" defaultMessage="Site Settings" />
						</h1>
						<p className="text-muted-foreground">
							<T
								id="store.siteConfig.description"
								defaultMessage="Manage your store's general settings"
							/>
						</p>
					</div>
				<Skeleton className="h-10 w-80" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-4 w-60" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="store.siteConfig.title" defaultMessage="Site Settings" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="store.siteConfig.description"
							defaultMessage="Manage your store's general settings"
						/>
					</p>
				</div>

				<BaseForm form={form} onSubmit={onSubmit}>
					<Tabs defaultValue="general">
						<TabsList className="mb-6">
							<TabsTrigger value="general">
								<T id="store.siteConfig.tabs.general" defaultMessage="General" />
							</TabsTrigger>
							<TabsTrigger value="contact">
								<T
									id="store.siteConfig.tabs.contact"
									defaultMessage="Contact & Social"
								/>
							</TabsTrigger>
							<TabsTrigger value="shipping">
								<T
									id="store.siteConfig.tabs.shipping"
									defaultMessage="Shipping & Tax"
								/>
							</TabsTrigger>
							<TabsTrigger value="branding">
								<T id="store.siteConfig.tabs.branding" defaultMessage="Branding" />
							</TabsTrigger>
							{vendorContext?.meta_pixel_enabled && (
								<TabsTrigger value="meta">
									<T
										id="store.siteConfig.tabs.meta"
										defaultMessage="Meta Tracking"
									/>
								</TabsTrigger>
							)}
						</TabsList>

					{/* ── General ── */}
					<TabsContent value="general" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>
										<T
											id="store.siteConfig.general.title"
											defaultMessage="Store Identity"
										/>
									</CardTitle>
									<CardDescription>
										<T
											id="store.siteConfig.general.description"
											defaultMessage="Basic information shown to customers across the storefront."
										/>
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<TextField
										name="tagline"
										label={t("store.siteConfig.fields.tagline", "Tagline")}
										placeholder={t(
											"store.siteConfig.fields.taglinePlaceholder",
											"e.g., Fresh Organic Products Delivered to Your Door",
										)}
										description={t(
											"store.siteConfig.fields.taglineHelp",
											"A short phrase that captures your store's value. Appears in the site header and SEO meta tags.",
										)}
									/>
									<TextareaField
										name="address"
										label={t(
											"store.siteConfig.fields.address",
											"Physical Address",
										)}
										placeholder={t(
											"store.siteConfig.fields.addressPlaceholder",
											"e.g., 123 Main St, Dhaka 1216, Bangladesh",
										)}
										description={t(
											"store.siteConfig.fields.addressHelp",
											"Your store's physical address. Shown in the footer and contact page.",
										)}
									/>
								</CardContent>
							</Card>
					</TabsContent>

					{/* ── Contact & Social ── */}
					<TabsContent value="contact" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>
										<T
											id="store.siteConfig.contact.title"
											defaultMessage="Contact Information"
										/>
									</CardTitle>
									<CardDescription>
										<T
											id="store.siteConfig.contact.description"
											defaultMessage="How customers can reach your store directly."
										/>
									</CardDescription>
								</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<TextField
										name="phone"
										label={t("store.siteConfig.fields.phone", "Phone Number")}
										placeholder={t(
											"store.siteConfig.fields.phonePlaceholder",
											"e.g., +880 1700 000000",
										)}
										description={t(
											"store.siteConfig.fields.phoneHelp",
											"Primary contact number. Displayed in the footer and contact page.",
										)}
									/>
									<TextField
										name="email"
										label={t("store.siteConfig.fields.email", "Email Address")}
										type="email"
										placeholder={t(
											"store.siteConfig.fields.emailPlaceholder",
											"e.g., support@yourstore.com",
										)}
										description={t(
											"store.siteConfig.fields.emailHelp",
											"Customer-facing support email.",
										)}
									/>
								</div>
							</CardContent>
						</Card>

							<Card>
								<CardHeader>
									<CardTitle>
										<T
											id="store.siteConfig.social.title"
											defaultMessage="Social Media"
										/>
									</CardTitle>
									<CardDescription>
										<T
											id="store.siteConfig.social.description"
											defaultMessage="Links to your social media pages. Leave a field empty to hide its icon from the storefront."
										/>
									</CardDescription>
								</CardHeader>
							<CardContent className="space-y-4">
									<TextField
										name="facebook_url"
										label={t(
											"store.siteConfig.fields.facebook",
											"Facebook Page URL",
										)}
										placeholder="https://facebook.com/yourstore"
										description={t(
											"store.siteConfig.fields.facebookHelp",
											"Full URL to your Facebook business page.",
										)}
									/>
									<TextField
										name="instagram_url"
										label={t(
											"store.siteConfig.fields.instagram",
											"Instagram Profile URL",
										)}
										placeholder="https://instagram.com/yourstore"
										description={t(
											"store.siteConfig.fields.instagramHelp",
											"Full URL to your Instagram profile.",
										)}
									/>
									<TextField
										name="youtube_url"
										label={t(
											"store.siteConfig.fields.youtube",
											"YouTube Channel URL",
										)}
										placeholder="https://youtube.com/@yourstore"
										description={t(
											"store.siteConfig.fields.youtubeHelp",
											"Full URL to your YouTube channel.",
										)}
									/>
							</CardContent>
						</Card>
					</TabsContent>

					{/* ── Shipping & Tax ── */}
						<TabsContent value="shipping" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>
										<T
											id="store.siteConfig.shipping.chargesTitle"
											defaultMessage="Delivery Charges"
										/>
									</CardTitle>
									<CardDescription>
										<T
											id="store.siteConfig.shipping.chargesDescription"
											defaultMessage="Flat delivery fees charged at checkout based on the customer's location. These amounts are shown to customers during order placement."
										/>
									</CardDescription>
								</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<TextField
										name="inside_dhaka_delivery_charge"
										label={t(
											"store.siteConfig.fields.insideDhaka",
											"Inside Dhaka (৳)",
										)}
										type="number"
										placeholder="60"
										description={t(
											"store.siteConfig.fields.insideDhakaHelp",
											"Delivery fee for orders shipped within Dhaka city.",
										)}
									/>
									<TextField
										name="outside_dhaka_delivery_charge"
										label={t(
											"store.siteConfig.fields.outsideDhaka",
											"Outside Dhaka (৳)",
										)}
										type="number"
										placeholder="120"
										description={t(
											"store.siteConfig.fields.outsideDhakaHelp",
											"Delivery fee for orders shipped outside Dhaka.",
										)}
									/>
								</div>
							</CardContent>
						</Card>

							<Card>
								<CardHeader>
									<CardTitle>
										<T
											id="store.siteConfig.shipping.freeTitle"
											defaultMessage="Free Shipping"
										/>
									</CardTitle>
									<CardDescription>
										<T
											id="store.siteConfig.shipping.freeDescription"
											defaultMessage="Automatically waive the delivery fee when a customer's order subtotal meets the threshold below."
										/>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<TextField
										name="free_shipping_threshold"
										label={t(
											"store.siteConfig.fields.freeShippingThreshold",
											"Minimum Order Amount for Free Shipping (৳)",
										)}
										type="number"
										placeholder="1000"
										description={t(
											"store.siteConfig.fields.freeShippingThresholdHelp",
											"Customers whose subtotal is at or above this amount pay ৳0 for delivery. Set to 0 to disable free shipping entirely.",
										)}
									/>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>
										<T id="store.siteConfig.shipping.taxTitle" defaultMessage="Tax" />
									</CardTitle>
									<CardDescription>
										<T
											id="store.siteConfig.shipping.taxDescription"
											defaultMessage="Configure the tax rate applied to orders at checkout."
										/>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<TextField
										name="tax_rate"
										label={t("store.siteConfig.fields.taxRate", "Tax Rate (%)")}
										type="number"
										placeholder="0"
										description={t(
											"store.siteConfig.fields.taxRateHelp",
											"Percentage tax applied to the order subtotal after discounts (e.g. enter 5 for 5% VAT). Set to 0 for tax-free orders.",
										)}
									/>
								</CardContent>
							</Card>
					</TabsContent>

					{/* ── Meta Tracking ── */}
					{vendorContext?.meta_pixel_enabled && (
						<TabsContent value="meta" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>
										<T
											id="store.siteConfig.meta.title"
											defaultMessage="Meta Pixel Credentials"
										/>
									</CardTitle>
									<CardDescription>
										<T
											id="store.siteConfig.meta.description"
											defaultMessage="Configure your Meta Pixel and Conversions API credentials. Enable or disable tracking from the Vendor settings."
										/>
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<TextField
										name="meta_pixel_id"
										label={t("store.siteConfig.fields.pixelId", "Pixel ID")}
										placeholder="e.g., 1234567890123456"
										description={t(
											"store.siteConfig.fields.pixelIdHelp",
											"Your Meta Pixel ID. Found in Events Manager under Data Sources.",
										)}
									/>
									<TextField
										name="meta_access_token"
										label={t(
											"store.siteConfig.fields.accessToken",
											"Access Token",
										)}
										type="password"
										placeholder={t(
											"store.siteConfig.fields.accessTokenPlaceholder",
											"Leave blank to keep the current token",
										)}
										description={t(
											"store.siteConfig.fields.accessTokenHelp",
											"Conversions API access token. Leave blank to keep the existing token unchanged.",
										)}
									/>
									<div className="grid grid-cols-2 gap-4">
										<TextField
											name="meta_test_event_code"
											label={t(
												"store.siteConfig.fields.testEventCode",
												"Test Event Code",
											)}
											placeholder="e.g., TEST12345"
											description={t(
												"store.siteConfig.fields.testEventCodeHelp",
												"Optional. Use during testing to verify events in Test Events tab.",
											)}
										/>
										<TextField
											name="meta_default_currency"
											label={t(
												"store.siteConfig.fields.defaultCurrency",
												"Default Currency",
											)}
											placeholder="BDT"
											description={t(
												"store.siteConfig.fields.defaultCurrencyHelp",
												"ISO currency code for purchase events (e.g., BDT, USD).",
											)}
										/>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					)}

					{/* ── Branding ── */}
					<TabsContent value="branding" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>
									<T
										id="store.siteConfig.branding.title"
										defaultMessage="Store Logo"
									/>
								</CardTitle>
								<CardDescription>
									<T
										id="store.siteConfig.branding.description"
										defaultMessage="Your logo is displayed in the site header, emails, and invoices. Upload a new image to replace the current one."
									/>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									{logoPreview && (
										<div className="p-4 border rounded-lg bg-muted/30 inline-block">
											<img
												src={logoPreview}
												alt={t("store.siteConfig.branding.currentLogo", "Current logo")}
												className="max-h-20 max-w-48 object-contain"
											/>
										</div>
									)}
									<div className="space-y-1.5">
										<Label htmlFor="logo">
											{logoPreview
												? t("store.siteConfig.branding.replaceLogo", "Replace Logo")
												: t("store.siteConfig.branding.uploadLogo", "Upload Logo")}
										</Label>
										<Input
											id="logo"
											type="file"
											accept="image/*"
											onChange={handleLogoChange}
										/>
										<p className="text-sm text-muted-foreground">
											<T
												id="store.siteConfig.branding.logoHelp"
												defaultMessage="Recommended: square image, 200×200 px or larger (PNG or SVG preferred). Leave empty to keep the current logo."
											/>
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className="flex justify-end mt-6">
					<LoadingButton type="submit" isLoading={isPending} size="lg">
						<T
							id="store.siteConfig.save"
							defaultMessage="Save Changes"
						/>
					</LoadingButton>
				</div>
			</BaseForm>
		</div>
	);
}
