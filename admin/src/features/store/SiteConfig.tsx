/* eslint-disable react-hooks/set-state-in-effect */
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { getSiteConfig, useUpdateSiteConfig } from "@/lib/api/store";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "react-toastify";
import { SiteConfigLoading } from "./components/site-config/SiteConfigLoading";
import { SiteConfigPageHeader } from "./components/site-config/SiteConfigPageHeader";
import { SiteConfigTabs } from "./components/site-config/SiteConfigTabs";
import {
	createSiteConfigSchema,
	getSiteConfigFormValues,
	siteConfigDefaultValues,
	type SiteConfigFormData,
} from "./components/site-config/site-config-form";

export function SiteConfig() {
	const t = useT();
	const { data: siteConfig, isLoading } = useQuery(getSiteConfig());
	const { mutate: updateSiteConfig, isPending } = useUpdateSiteConfig();
	const { vendorContext } = useAuthStore();
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const form = useZodForm(createSiteConfigSchema(t), {
		defaultValues: siteConfigDefaultValues,
	});

	const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
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
			form.reset(getSiteConfigFormValues(siteConfig));
			if (siteConfig.logo) {
				setLogoPreview(siteConfig.logo);
			}
		}
	}, [form, siteConfig]);

	if (isLoading) {
		return <SiteConfigLoading />;
	}

	return (
		<div className="space-y-6">
			<SiteConfigPageHeader />

			<BaseForm form={form} onSubmit={onSubmit}>
				<SiteConfigTabs
					logoPreview={logoPreview}
					onLogoChange={handleLogoChange}
					showMetaTab={Boolean(vendorContext?.meta_pixel_enabled)}
					t={t}
				/>

				<div className="mt-6 flex justify-end">
					<LoadingButton type="submit" isLoading={isPending} size="lg">
						<T id="store.siteConfig.save" defaultMessage="Save Changes" />
					</LoadingButton>
				</div>
			</BaseForm>
		</div>
	);
}
