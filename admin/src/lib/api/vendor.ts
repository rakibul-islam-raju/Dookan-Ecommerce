import type { IVendorContext } from "@/@types/User.type";
import { queryKeys } from "@/constants/queryKeys";
import { queryOptions } from "@tanstack/react-query";
import { clientApi } from "./axios";

export const vendorApi = {
	async getContext(): Promise<IVendorContext> {
		const { data } = await clientApi.get<IVendorContext>("/vendors/me/");
		return data;
	},
};

export const getVendorContext = () =>
	queryOptions({
		queryKey: [queryKeys.vendorContext],
		queryFn: vendorApi.getContext,
		staleTime: 1000 * 60 * 5,
	});
