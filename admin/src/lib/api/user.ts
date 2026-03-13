import { queryKeys } from "@/constants/queryKeys";
import { queryOptions } from "@tanstack/react-query";
import type { User } from "./auth";
import { clientApi } from "./axios";

export const userApi = {
	async getMeInfo(): Promise<User> {
		const { data } = await clientApi.get<User>("/users/me/");
		return data;
	},
};

export const useGetMeInfo = () =>
	queryOptions({
		queryKey: [queryKeys.me],
		queryFn: userApi.getMeInfo,
	});
