/**
 * Store API Service
 * Handles Banners, Announcements, and Site Configuration
 */

import { queryKeys } from "@/constants/queryKeys";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	BaseModel,
	ICommonFilter,
	IPaginatedResponse,
} from "../../@types/Common.type";
import { clientApi } from "./axios";

const storefrontRevalidateUrl = import.meta.env.VITE_STOREFRONT_REVALIDATE_URL;
const storefrontRevalidateSecret =
	import.meta.env.VITE_STOREFRONT_REVALIDATE_SECRET;

const revalidateStorefront = async () => {
	if (!storefrontRevalidateUrl || !storefrontRevalidateSecret) return;

	try {
		const response = await fetch(storefrontRevalidateUrl, {
			method: "POST",
			headers: {
				"X-Revalidate-Secret": storefrontRevalidateSecret,
			},
		});

		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}
	} catch (error) {
		console.warn("[Storefront revalidate] Failed:", error);
	}
};

// ============ Banner Types ============
export interface BannerListItem extends BaseModel {
	title: string;
	description: string;
	image: string;
	start_date: string | null;
	end_date: string | null;
	display_order: number;
}

export type BannerListResponse = IPaginatedResponse<BannerListItem>;

export interface BannerCreateData {
	title: string;
	description?: string;
	image: File;
	start_date?: string | null;
	end_date?: string | null;
	is_active?: boolean;
	display_order?: number;
}

export interface BannerUpdateData {
	title?: string;
	description?: string;
	image?: File;
	start_date?: string | null;
	end_date?: string | null;
	is_active?: boolean;
	display_order?: number;
}

export interface BannerFilter extends ICommonFilter {
	search?: string;
	is_active?: boolean;
}

// ============ Announcement Types ============
export interface AnnouncementListItem {
	id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	is_active: boolean;
}

export type AnnouncementListResponse = IPaginatedResponse<AnnouncementListItem>;

export interface AnnouncementCreateData {
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	is_active?: boolean;
}

export type AnnouncementUpdateData = Partial<AnnouncementCreateData>;

export interface AnnouncementFilter extends ICommonFilter {
	search?: string;
	is_active?: boolean;
}

// ============ Site Config Types ============
export interface SiteConfigData {
	id?: string;
	tagline: string;
	address: string;
	phone: string;
	email: string;
	facebook_url: string | null;
	instagram_url: string | null;
	youtube_url: string | null;
	logo: string | null;
	inside_dhaka_delivery_charge: string;
	outside_dhaka_delivery_charge: string;
	free_shipping_threshold: string;
	tax_rate: string;
	meta_pixel_id: string;
	meta_test_event_code: string;
	meta_default_currency: string;
}

export interface SiteConfigUpdateData {
	tagline?: string;
	address?: string;
	phone?: string;
	email?: string;
	facebook_url?: string | null;
	instagram_url?: string | null;
	youtube_url?: string | null;
	logo?: File | null;
	inside_dhaka_delivery_charge?: number;
	outside_dhaka_delivery_charge?: number;
	free_shipping_threshold?: number;
	tax_rate?: number;
	meta_pixel_id?: string;
	meta_access_token?: string;
	meta_test_event_code?: string;
	meta_default_currency?: string;
}

// ============ Banner API ============
export const bannerApi = {
	async list(params: BannerFilter): Promise<BannerListResponse> {
		const { data } = await clientApi.get<BannerListResponse>(
			"/store/banners/",
			{ params }
		);
		return data;
	},

	async create(bannerData: BannerCreateData): Promise<BannerListItem> {
		const formData = new FormData();
		formData.append("title", bannerData.title);
		if (bannerData.description) {
			formData.append("description", bannerData.description);
		}
		formData.append("image", bannerData.image);
		if (bannerData.start_date) {
			formData.append("start_date", bannerData.start_date);
		}
		if (bannerData.end_date) {
			formData.append("end_date", bannerData.end_date);
		}
		if (bannerData.is_active !== undefined) {
			formData.append("is_active", String(bannerData.is_active));
		}
		if (bannerData.display_order !== undefined) {
			formData.append("display_order", String(bannerData.display_order));
		}

		const { data } = await clientApi.post<BannerListItem>(
			"/store/banners/",
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } }
		);
		return data;
	},

	async update(
		id: string,
		updateData: BannerUpdateData
	): Promise<BannerListItem> {
		const formData = new FormData();
		if (updateData.title !== undefined) {
			formData.append("title", updateData.title);
		}
		if (updateData.description !== undefined) {
			formData.append("description", updateData.description);
		}
		if (updateData.image) {
			formData.append("image", updateData.image);
		}
		if (updateData.start_date !== undefined) {
			formData.append("start_date", updateData.start_date || "");
		}
		if (updateData.end_date !== undefined) {
			formData.append("end_date", updateData.end_date || "");
		}
		if (updateData.is_active !== undefined) {
			formData.append("is_active", String(updateData.is_active));
		}
		if (updateData.display_order !== undefined) {
			formData.append("display_order", String(updateData.display_order));
		}

		const { data } = await clientApi.patch<BannerListItem>(
			`/store/banners/${id}/`,
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } }
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/store/banners/${id}/`);
	},
};

// ============ Announcement API ============
export const announcementApi = {
	async list(params: AnnouncementFilter): Promise<AnnouncementListResponse> {
		const { data } = await clientApi.get<AnnouncementListResponse>(
			"/store/announcements/",
			{ params }
		);
		return data;
	},

	async create(
		announcementData: AnnouncementCreateData
	): Promise<AnnouncementListItem> {
		const { data } = await clientApi.post<AnnouncementListItem>(
			"/store/announcements/",
			announcementData
		);
		return data;
	},

	async update(
		id: number,
		updateData: AnnouncementUpdateData
	): Promise<AnnouncementListItem> {
		const { data } = await clientApi.patch<AnnouncementListItem>(
			`/store/announcements/${id}/`,
			updateData
		);
		return data;
	},

	async delete(id: number): Promise<void> {
		await clientApi.delete(`/store/announcements/${id}/`);
	},
};

// ============ Site Config API ============
export const siteConfigApi = {
	async get(): Promise<SiteConfigData> {
		const { data } = await clientApi.get<SiteConfigData>("/store/site-config/");
		return data;
	},

	async update(updateData: SiteConfigUpdateData): Promise<SiteConfigData> {
		const formData = new FormData();
		if (updateData.tagline !== undefined) {
			formData.append("tagline", updateData.tagline);
		}
		if (updateData.address !== undefined) {
			formData.append("address", updateData.address);
		}
		if (updateData.phone !== undefined) {
			formData.append("phone", updateData.phone);
		}
		if (updateData.email !== undefined) {
			formData.append("email", updateData.email);
		}
		if (updateData.facebook_url !== undefined) {
			formData.append("facebook_url", updateData.facebook_url || "");
		}
		if (updateData.instagram_url !== undefined) {
			formData.append("instagram_url", updateData.instagram_url || "");
		}
		if (updateData.youtube_url !== undefined) {
			formData.append("youtube_url", updateData.youtube_url || "");
		}
		if (updateData.logo) {
			formData.append("logo", updateData.logo);
		}
		if (updateData.inside_dhaka_delivery_charge !== undefined) {
			formData.append(
				"inside_dhaka_delivery_charge",
				String(updateData.inside_dhaka_delivery_charge)
			);
		}
		if (updateData.outside_dhaka_delivery_charge !== undefined) {
			formData.append(
				"outside_dhaka_delivery_charge",
				String(updateData.outside_dhaka_delivery_charge)
			);
		}
		if (updateData.free_shipping_threshold !== undefined) {
			formData.append(
				"free_shipping_threshold",
				String(updateData.free_shipping_threshold)
			);
		}
		if (updateData.tax_rate !== undefined) {
			formData.append("tax_rate", String(updateData.tax_rate));
		}
		if (updateData.meta_pixel_id !== undefined) {
			formData.append("meta_pixel_id", updateData.meta_pixel_id);
		}
		if (updateData.meta_access_token !== undefined) {
			formData.append("meta_access_token", updateData.meta_access_token);
		}
		if (updateData.meta_test_event_code !== undefined) {
			formData.append("meta_test_event_code", updateData.meta_test_event_code);
		}
		if (updateData.meta_default_currency !== undefined) {
			formData.append("meta_default_currency", updateData.meta_default_currency);
		}

		const { data } = await clientApi.patch<SiteConfigData>(
			"/store/site-config/",
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } }
		);
		return data;
	},
};

// ============ Query Options ============
export const getBanners = (params: BannerFilter) =>
	queryOptions({
		queryKey: [queryKeys.banners, { params }],
		queryFn: async () => bannerApi.list(params),
	});

export const getAnnouncements = (params: AnnouncementFilter) =>
	queryOptions({
		queryKey: [queryKeys.announcements, { params }],
		queryFn: async () => announcementApi.list(params),
	});

export const getSiteConfig = () =>
	queryOptions({
		queryKey: [queryKeys.siteConfig],
		queryFn: async () => siteConfigApi.get(),
	});

// ============ Banner Hooks ============
export const useCreateBanner = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (bannerData: BannerCreateData) => bannerApi.create(bannerData),
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.banners],
			});
			await revalidateStorefront();
		},
	});
};

export const useUpdateBanner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			updateData,
		}: {
			id: string;
			updateData: BannerUpdateData;
		}) => bannerApi.update(id, updateData),
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.banners],
			});
			await revalidateStorefront();
		},
	});
};

export const useDeleteBanner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => bannerApi.delete(id),
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.banners],
			});
			await revalidateStorefront();
		},
	});
};

// ============ Announcement Hooks ============
export const useCreateAnnouncement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (announcementData: AnnouncementCreateData) =>
			announcementApi.create(announcementData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.announcements],
			});
		},
	});
};

export const useUpdateAnnouncement = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			updateData,
		}: {
			id: number;
			updateData: AnnouncementUpdateData;
		}) => announcementApi.update(id, updateData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.announcements],
			});
		},
	});
};

export const useDeleteAnnouncement = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => announcementApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.announcements],
			});
		},
	});
};

// ============ Site Config Hooks ============
export const useUpdateSiteConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (updateData: SiteConfigUpdateData) =>
			siteConfigApi.update(updateData),
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.siteConfig],
			});
			await revalidateStorefront();
		},
	});
};
