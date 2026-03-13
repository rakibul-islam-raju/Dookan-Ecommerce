"use client";

import { User } from "@/lib/api";
import { userApi } from "@/lib/api/user";
import { userKeys } from "@/lib/hooks/useUser";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const AuthInitializer = () => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const query = useQuery<User>({
		queryKey: userKeys.me,
		queryFn: () => userApi.getProfile(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: isAuthenticated,
	});

	const updateUser = useAuthStore((state) => state.updateUser);

	useEffect(() => {
		if (query.data) {
			updateUser(query.data);
		}
	}, [query.data, updateUser]);

	return null;
};
