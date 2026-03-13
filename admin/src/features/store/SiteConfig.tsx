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
import { useZodForm } from "@/hooks/useZodForm";
import { getSiteConfig, useUpdateSiteConfig } from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

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
		updateSiteConfig(
			{
				...data,
				facebook_url: data.facebook_url || null,
				instagram_url: data.instagram_url || null,
				youtube_url: data.youtube_url || null,
				...(logoFile && { logo: logoFile }),
			},
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
				<div className="grid gap-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-4 w-60" />
						</CardHeader>
						<CardContent className="space-y-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-20 w-full" />
						</CardContent>
					</Card>
				</div>
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
				<div className="grid gap-6">
					{/* General Info */}
					<Card>
						<CardHeader>
							<CardTitle>General Information</CardTitle>
							<CardDescription>
								Basic information about your store
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<TextField
								name="tagline"
								label="Tagline"
								placeholder="e.g., Fresh Organic Products Delivered to Your Door"
								description="A short phrase that describes your store"
							/>
							<TextareaField
								name="address"
								label="Address"
								placeholder="e.g., 123 Main St, City, State 12345"
								description="Your store's physical address"
							/>
						</CardContent>
					</Card>

					{/* Contact Info */}
					<Card>
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
							<CardDescription>How customers can reach you</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<TextField
									name="phone"
									label="Phone"
									placeholder="e.g., +1 234 567 8900"
									description="Your store's phone number"
								/>
								<TextField
									name="email"
									label="Email"
									type="email"
									placeholder="e.g., contact@yourstore.com"
									description="Your store's email address"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Social Media */}
					<Card>
						<CardHeader>
							<CardTitle>Social Media</CardTitle>
							<CardDescription>
								Links to your social media profiles
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<TextField
								name="facebook_url"
								label="Facebook URL"
								placeholder="e.g., https://facebook.com/yourstore"
								description="Your Facebook page URL"
							/>
							<TextField
								name="instagram_url"
								label="Instagram URL"
								placeholder="e.g., https://instagram.com/yourstore"
								description="Your Instagram profile URL"
							/>
							<TextField
								name="youtube_url"
								label="YouTube URL"
								placeholder="e.g., https://youtube.com/@yourstore"
								description="Your YouTube channel URL"
							/>
						</CardContent>
					</Card>

					{/* Logo */}
					<Card>
						<CardHeader>
							<CardTitle>Store Logo</CardTitle>
							<CardDescription>
								Your store's logo displayed across the site
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="logo">Logo Image</Label>
								<Input
									id="logo"
									type="file"
									accept="image/*"
									onChange={handleLogoChange}
								/>
								{logoPreview && (
									<div className="mt-2">
										<img
											src={logoPreview}
											alt="Logo Preview"
											className="max-h-24 rounded-md object-contain"
										/>
									</div>
								)}
								<p className="text-sm text-muted-foreground">
									Recommended size: 200x200px or higher. Leave empty to keep the
									current logo.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className="flex justify-end">
						<LoadingButton type="submit" isLoading={isPending} size="lg">
							Save Changes
						</LoadingButton>
					</div>
				</div>
			</BaseForm>
		</div>
	);
}
