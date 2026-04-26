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
import { useZodForm } from "@/hooks/useZodForm";
import { getSiteConfig, useUpdateSiteConfig } from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const siteConfigSchema = z.object({
	tagline: z
		.string()
		.max(200, "Tagline must not exceed 200 characters")
		.optional()
		.or(z.literal("")),
	address: z
		.string()
		.max(500, "Address must not exceed 500 characters")
		.optional()
		.or(z.literal("")),
	phone: z
		.string()
		.max(20, "Phone must not exceed 20 characters")
		.optional()
		.or(z.literal("")),
	email: z.string().email("Invalid email address").optional().or(z.literal("")),
	facebook_url: z
		.string()
		.url("Invalid URL")
		.optional()
		.or(z.literal(""))
		.nullable(),
	instagram_url: z
		.string()
		.url("Invalid URL")
		.optional()
		.or(z.literal(""))
		.nullable(),
	youtube_url: z
		.string()
		.url("Invalid URL")
		.optional()
		.or(z.literal(""))
		.nullable(),
	inside_dhaka_delivery_charge: z.coerce
		.number()
		.min(0, "Charge cannot be negative"),
	outside_dhaka_delivery_charge: z.coerce
		.number()
		.min(0, "Charge cannot be negative"),
	free_shipping_threshold: z.coerce
		.number()
		.min(0, "Threshold cannot be negative"),
	tax_rate: z.coerce
		.number()
		.min(0, "Tax rate cannot be negative")
		.max(100, "Tax rate cannot exceed 100%"),
	meta_pixel_id: z
		.string()
		.max(32, "Pixel ID must not exceed 32 characters")
		.optional()
		.or(z.literal("")),
	meta_access_token: z.string().optional().or(z.literal("")),
	meta_test_event_code: z
		.string()
		.max(100, "Test event code must not exceed 100 characters")
		.optional()
		.or(z.literal("")),
	meta_default_currency: z
		.string()
		.max(10, "Currency code must not exceed 10 characters")
		.optional()
		.or(z.literal("")),
});

type SiteConfigFormData = z.infer<typeof siteConfigSchema>;

export function SiteConfig() {
	const { data: siteConfig, isLoading } = useQuery(getSiteConfig());
	const { mutate: updateSiteConfig, isPending } = useUpdateSiteConfig();
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const form = useZodForm(siteConfigSchema, {
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
					toast.success("Site configuration updated successfully");
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
					<h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
					<p className="text-muted-foreground">
						Manage your store's general settings
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
				<h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
				<p className="text-muted-foreground">
					Manage your store's general settings
				</p>
			</div>

			<BaseForm form={form} onSubmit={onSubmit}>
				<Tabs defaultValue="general">
					<TabsList className="mb-6">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="contact">Contact & Social</TabsTrigger>
						<TabsTrigger value="shipping">Shipping & Tax</TabsTrigger>
						<TabsTrigger value="branding">Branding</TabsTrigger>
						<TabsTrigger value="meta">Meta Tracking</TabsTrigger>
					</TabsList>

					{/* ── General ── */}
					<TabsContent value="general" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Store Identity</CardTitle>
								<CardDescription>
									Basic information shown to customers across the storefront.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<TextField
									name="tagline"
									label="Tagline"
									placeholder="e.g., Fresh Organic Products Delivered to Your Door"
									description="A short phrase that captures your store's value. Appears in the site header and SEO meta tags."
								/>
								<TextareaField
									name="address"
									label="Physical Address"
									placeholder="e.g., 123 Main St, Dhaka 1216, Bangladesh"
									description="Your store's physical address. Shown in the footer and contact page."
								/>
							</CardContent>
						</Card>
					</TabsContent>

					{/* ── Contact & Social ── */}
					<TabsContent value="contact" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Contact Information</CardTitle>
								<CardDescription>
									How customers can reach your store directly.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<TextField
										name="phone"
										label="Phone Number"
										placeholder="e.g., +880 1700 000000"
										description="Primary contact number. Displayed in the footer and contact page."
									/>
									<TextField
										name="email"
										label="Email Address"
										type="email"
										placeholder="e.g., support@yourstore.com"
										description="Customer-facing support email."
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Social Media</CardTitle>
								<CardDescription>
									Links to your social media pages. Leave a field empty to hide
									its icon from the storefront.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<TextField
									name="facebook_url"
									label="Facebook Page URL"
									placeholder="https://facebook.com/yourstore"
									description="Full URL to your Facebook business page."
								/>
								<TextField
									name="instagram_url"
									label="Instagram Profile URL"
									placeholder="https://instagram.com/yourstore"
									description="Full URL to your Instagram profile."
								/>
								<TextField
									name="youtube_url"
									label="YouTube Channel URL"
									placeholder="https://youtube.com/@yourstore"
									description="Full URL to your YouTube channel."
								/>
							</CardContent>
						</Card>
					</TabsContent>

					{/* ── Shipping & Tax ── */}
					<TabsContent value="shipping" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Delivery Charges</CardTitle>
								<CardDescription>
									Flat delivery fees charged at checkout based on the customer's
									location. These amounts are shown to customers during order
									placement.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<TextField
										name="inside_dhaka_delivery_charge"
										label="Inside Dhaka (৳)"
										type="number"
										placeholder="60"
										description="Delivery fee for orders shipped within Dhaka city."
									/>
									<TextField
										name="outside_dhaka_delivery_charge"
										label="Outside Dhaka (৳)"
										type="number"
										placeholder="120"
										description="Delivery fee for orders shipped outside Dhaka."
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Free Shipping</CardTitle>
								<CardDescription>
									Automatically waive the delivery fee when a customer's order
									subtotal meets the threshold below.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<TextField
									name="free_shipping_threshold"
									label="Minimum Order Amount for Free Shipping (৳)"
									type="number"
									placeholder="1000"
									description="Customers whose subtotal is at or above this amount pay ৳0 for delivery. Set to 0 to disable free shipping entirely."
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tax</CardTitle>
								<CardDescription>
									Configure the tax rate applied to orders at checkout.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<TextField
									name="tax_rate"
									label="Tax Rate (%)"
									type="number"
									placeholder="0"
									description="Percentage tax applied to the order subtotal after discounts (e.g. enter 5 for 5% VAT). Set to 0 for tax-free orders."
								/>
							</CardContent>
						</Card>
					</TabsContent>

					{/* ── Meta Tracking ── */}
					<TabsContent value="meta" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Meta Pixel Credentials</CardTitle>
								<CardDescription>
									Configure your Meta Pixel and Conversions API credentials.
									Enable or disable tracking from the Vendor settings.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<TextField
									name="meta_pixel_id"
									label="Pixel ID"
									placeholder="e.g., 1234567890123456"
									description="Your Meta Pixel ID. Found in Events Manager under Data Sources."
								/>
								<TextField
									name="meta_access_token"
									label="Access Token"
									type="password"
									placeholder="Leave blank to keep the current token"
									description="Conversions API access token. Leave blank to keep the existing token unchanged."
								/>
								<div className="grid grid-cols-2 gap-4">
									<TextField
										name="meta_test_event_code"
										label="Test Event Code"
										placeholder="e.g., TEST12345"
										description="Optional. Use during testing to verify events in Test Events tab."
									/>
									<TextField
										name="meta_default_currency"
										label="Default Currency"
										placeholder="BDT"
										description="ISO currency code for purchase events (e.g., BDT, USD)."
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* ── Branding ── */}
					<TabsContent value="branding" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Store Logo</CardTitle>
								<CardDescription>
									Your logo is displayed in the site header, emails, and invoices.
									Upload a new image to replace the current one.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									{logoPreview && (
										<div className="p-4 border rounded-lg bg-muted/30 inline-block">
											<img
												src={logoPreview}
												alt="Current logo"
												className="max-h-20 max-w-48 object-contain"
											/>
										</div>
									)}
									<div className="space-y-1.5">
										<Label htmlFor="logo">
											{logoPreview ? "Replace Logo" : "Upload Logo"}
										</Label>
										<Input
											id="logo"
											type="file"
											accept="image/*"
											onChange={handleLogoChange}
										/>
										<p className="text-sm text-muted-foreground">
											Recommended: square image, 200×200 px or larger (PNG or
											SVG preferred). Leave empty to keep the current logo.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className="flex justify-end mt-6">
					<LoadingButton type="submit" isLoading={isPending} size="lg">
						Save Changes
					</LoadingButton>
				</div>
			</BaseForm>
		</div>
	);
}
