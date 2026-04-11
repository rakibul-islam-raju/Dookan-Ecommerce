/* eslint-disable react-hooks/set-state-in-effect */
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useZodForm } from "@/hooks/useZodForm";
import { getSiteConfig, useUpdateSiteConfig } from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
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
	meta_pixel_enabled: z.boolean(),
	meta_pixel_id: z.string().max(32, "Pixel ID must not exceed 32 characters"),
	meta_capi_enabled: z.boolean(),
	meta_access_token: z.string().optional().or(z.literal("")),
	meta_test_event_code: z.string().max(100).optional().or(z.literal("")),
	meta_default_currency: z
		.string()
		.max(10, "Currency code must not exceed 10 characters"),
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
});

type SiteConfigFormData = z.infer<typeof siteConfigSchema>;

export function SiteConfig() {
	const { data: siteConfig, isLoading } = useQuery(getSiteConfig());
	const { mutate: updateSiteConfig, isPending } = useUpdateSiteConfig();
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [hasStoredMetaToken, setHasStoredMetaToken] = useState(false);
	const [isTutorialOpen, setIsTutorialOpen] = useState(false);

	const form = useZodForm(siteConfigSchema, {
		defaultValues: {
			tagline: "",
			address: "",
			phone: "",
			email: "",
			facebook_url: "",
			instagram_url: "",
			youtube_url: "",
			meta_pixel_enabled: false,
			meta_pixel_id: "",
			meta_capi_enabled: false,
			meta_access_token: "",
			meta_test_event_code: "",
			meta_default_currency: "BDT",
			inside_dhaka_delivery_charge: 60,
			outside_dhaka_delivery_charge: 120,
			free_shipping_threshold: 1000,
			tax_rate: 0,
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
		const metaPixelId = data.meta_pixel_id.trim();
		const metaAccessToken = data.meta_access_token?.trim() || "";
		const metaTestEventCode = data.meta_test_event_code?.trim() || "";
		const metaDefaultCurrency = data.meta_default_currency.trim().toUpperCase();

		if (data.meta_pixel_enabled && !metaPixelId) {
			form.setError("meta_pixel_id", {
				message: "Pixel ID is required when Meta Pixel is enabled",
			});
			return;
		}

		if (data.meta_capi_enabled) {
			if (!metaPixelId) {
				form.setError("meta_pixel_id", {
					message: "Pixel ID is required when Conversions API is enabled",
				});
				return;
			}

			if (!metaAccessToken && !hasStoredMetaToken) {
				form.setError("meta_access_token", {
					message:
						"Access token is required when Conversions API is enabled",
				});
				return;
			}
		}

		updateSiteConfig(
			{
				...data,
				facebook_url: data.facebook_url || null,
				instagram_url: data.instagram_url || null,
				youtube_url: data.youtube_url || null,
				meta_pixel_id: metaPixelId,
				meta_test_event_code: metaTestEventCode,
				meta_default_currency: metaDefaultCurrency,
				...(metaAccessToken ? { meta_access_token: metaAccessToken } : {}),
				...(logoFile && { logo: logoFile }),
			},
			{
				onSuccess: () => {
					toast.success("Site configuration updated successfully");
					setLogoFile(null);
					form.setValue("meta_access_token", "");
					setHasStoredMetaToken(
						Boolean(metaAccessToken) || hasStoredMetaToken
					);
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
				meta_pixel_enabled: siteConfig.meta_pixel_enabled || false,
				meta_pixel_id: siteConfig.meta_pixel_id || "",
				meta_capi_enabled: siteConfig.meta_capi_enabled || false,
				meta_access_token: "",
				meta_test_event_code: siteConfig.meta_test_event_code || "",
				meta_default_currency: siteConfig.meta_default_currency || "BDT",
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
			});
			if (siteConfig.logo) {
				setLogoPreview(siteConfig.logo);
			}
			setHasStoredMetaToken(Boolean(siteConfig.has_meta_access_token));
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
						<TabsTrigger value="tracking">Tracking</TabsTrigger>
						<TabsTrigger value="shipping">Shipping & Tax</TabsTrigger>
						<TabsTrigger value="branding">Branding</TabsTrigger>
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

					<TabsContent value="tracking" className="space-y-6">
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-1">
										<CardTitle>Meta Pixel</CardTitle>
										<CardDescription>
											Load Meta browser tracking on the storefront. This sends
											standard pixel events like page views and add-to-cart.
										</CardDescription>
									</div>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsTutorialOpen(true)}
									>
										Setup Tutorial
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<Controller
									name="meta_pixel_enabled"
									control={form.control}
									render={({ field }) => (
										<div className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-1">
												<Label htmlFor="meta_pixel_enabled">
													Enable Meta Pixel
												</Label>
												<p className="text-sm text-muted-foreground">
													Turn on browser-based Meta Pixel tracking for the
													storefront.
												</p>
											</div>
											<Switch
												id="meta_pixel_enabled"
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</div>
									)}
								/>
								<TextField
									name="meta_pixel_id"
									label="Meta Pixel ID"
									placeholder="123456789012345"
									description="Required when browser pixel tracking is enabled."
								/>
								<TextField
									name="meta_default_currency"
									label="Default Currency"
									placeholder="BDT"
									description="Used for Meta event payloads when sending value-based ecommerce events."
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Conversions API</CardTitle>
								<CardDescription>
									Send purchase events from the backend for more reliable
									attribution. Browser Pixel and Conversions API can be used
									independently or together.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Controller
									name="meta_capi_enabled"
									control={form.control}
									render={({ field }) => (
										<div className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-1">
												<Label htmlFor="meta_capi_enabled">
													Enable Conversions API
												</Label>
												<p className="text-sm text-muted-foreground">
													Send server-side purchase events to Meta using your
													access token.
												</p>
											</div>
											<Switch
												id="meta_capi_enabled"
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</div>
									)}
								/>
								<PasswordField
									name="meta_access_token"
									label="Conversions API Access Token"
									placeholder={
										hasStoredMetaToken
											? "Leave blank to keep the saved token"
											: "Enter a Meta access token"
									}
									description={
										hasStoredMetaToken
											? "A token is already saved. Enter a new one only if you want to replace it."
											: "Required when Conversions API is enabled."
									}
								/>
								<TextField
									name="meta_test_event_code"
									label="Test Event Code"
									placeholder="TEST12345"
									description="Optional. Use this while validating events in Meta Events Manager."
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

			<Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
				<DialogContent className="sm:max-w-[760px] max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Meta Pixel and Conversions API Setup Guide</DialogTitle>
						<DialogDescription>
							Follow these steps to connect your store with Meta Events
							Manager and verify that browser Pixel and server-side purchase
							events are working correctly.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 text-sm leading-6">
						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								1. Open Meta Events Manager
							</h3>
							<p className="text-muted-foreground">
								Log in to your Facebook Business account and open Meta Events
								Manager. Choose the correct business account if you manage more
								than one.
							</p>
							<p className="text-muted-foreground">
								If you already have a pixel, open it. If you do not have one,
								create a new Data Source and choose Web.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								2. Copy your Meta Pixel ID
							</h3>
							<p className="text-muted-foreground">
								In Events Manager, open the Data Source details and copy the
								Pixel ID. It is usually a long numeric value.
							</p>
							<p className="text-muted-foreground">
								Return to this admin page, turn on <strong>Enable Meta Pixel</strong>,
								paste the Pixel ID into <strong>Meta Pixel ID</strong>, and keep
								the default currency as <strong>BDT</strong> unless your store
								needs something else.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								3. Create a Conversions API access token
							</h3>
							<p className="text-muted-foreground">
								Inside the same Data Source in Events Manager, find the
								Conversions API or Settings section. Look for the option to
								generate an access token.
							</p>
							<p className="text-muted-foreground">
								Copy that token and paste it into <strong>Conversions API Access Token</strong>.
								Then turn on <strong>Enable Conversions API</strong>.
							</p>
							<p className="text-muted-foreground">
								This token is used by the backend to send server-side
								<code>Purchase</code> events after an order is successfully
								created.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								4. Add a test event code before going live
							</h3>
							<p className="text-muted-foreground">
								In Events Manager, open the <strong>Test Events</strong> tab.
								Meta will show you a temporary <strong>Test Event Code</strong>.
							</p>
							<p className="text-muted-foreground">
								Copy that code and paste it into the <strong>Test Event Code</strong>
								field on this page. This lets you see test traffic immediately
								without waiting for standard reporting.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								5. Save the settings
							</h3>
							<p className="text-muted-foreground">
								Click <strong>Save Changes</strong>. After saving, refresh the
								storefront. The storefront will load the browser Pixel, and the
								backend will be ready to send server-side purchase events.
							</p>
							<p className="text-muted-foreground">
								If you replace the access token later, enter the new token and
								save again. Leaving the token field empty keeps the existing
								saved token.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								6. Test browser Pixel events
							</h3>
							<p className="text-muted-foreground">
								Open your storefront in a new browser tab and browse like a real
								customer:
							</p>
							<ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
								<li>Visit the home page to trigger <code>PageView</code>.</li>
								<li>Open a product page to trigger <code>ViewContent</code>.</li>
								<li>Add a product to cart to trigger <code>AddToCart</code>.</li>
								<li>Open the checkout page to trigger <code>InitiateCheckout</code>.</li>
							</ol>
							<p className="text-muted-foreground">
								Go back to Meta Events Manager and confirm these test events are
								appearing.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								7. Test the server-side purchase event
							</h3>
							<p className="text-muted-foreground">
								Place a real test order from the storefront. When the order is
								successfully created, the storefront sends a browser
								<code>Purchase</code> event and the backend sends a
								server-side <code>Purchase</code> event to Meta.
							</p>
							<p className="text-muted-foreground">
								Both events use the same event ID so Meta can deduplicate them
								and treat them as one purchase.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								8. Confirm everything is connected correctly
							</h3>
							<p className="text-muted-foreground">
								You should see event activity in Meta Events Manager. For this
								project, the expected events are:
							</p>
							<ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
								<li><code>PageView</code></li>
								<li><code>ViewContent</code></li>
								<li><code>AddToCart</code></li>
								<li><code>InitiateCheckout</code></li>
								<li><code>Purchase</code></li>
							</ol>
							<p className="text-muted-foreground">
								If you see Pixel events but no purchase event, check your access
								token, Conversions API toggle, and backend logs.
							</p>
						</section>

						<section className="space-y-2">
							<h3 className="font-semibold text-foreground">
								9. Remove the test event code after verification
							</h3>
							<p className="text-muted-foreground">
								Once you confirm everything is working, clear the
								<strong> Test Event Code </strong>
								field and save again. This moves traffic back to normal
								production reporting.
							</p>
						</section>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
