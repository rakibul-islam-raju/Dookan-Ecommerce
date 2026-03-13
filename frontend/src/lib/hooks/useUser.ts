/**
 * React Query Hooks for users
 */

import { IPaginatedResponse } from "@/@types/Common";
import {
	ICreateUserAddressRequest,
	IUpdateUserAddressRequest,
	IUserAddress,
} from "@/@types/User";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { User } from "../api/auth";
import { userApi } from "../api/user";
import { queryClient } from "../react-query";
import { useAuthStore } from "../store/useAuthStore";

export const userKeys = {
	me: ["me"] as const,
	userAddresses: ["userAddresses"] as const,
	userAddress: (addressId: string) =>
		[...userKeys.userAddresses, addressId] as const,
};

export function useMe() {
	return useQuery<User>({
		queryKey: userKeys.me,
		queryFn: () => userApi.getProfile(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useUpdateProfile() {
	const updateUser = useAuthStore((state) => state.updateUser);

	return useMutation<
		User,
		Error,
		{
			first_name: string;
			last_name: string;
			email: string;
			mobile_number: string;
		}
	>({
		mutationFn: (updateData) => userApi.updateProfile(updateData),
		onSuccess: (data) => {
			toast.success("Profile updated successfully");
			updateUser(data);
		},
	});
}

export function useChangePassword() {
	return useMutation<
		void,
		Error,
		{ old_password: string; new_password: string }
	>({
		mutationFn: (changePasswordData) =>
			userApi.changePassword(changePasswordData),
		onSuccess: () => {
			toast.success("Password changed successfully");
		},
	});
}

export function useGetUserAddresses() {
	return useQuery<IPaginatedResponse<IUserAddress>>({
		queryKey: userKeys.userAddresses,
		queryFn: () => userApi.getUserAddresses(),
	});
}

export function useCreateUserAddress() {
	return useMutation<IUserAddress, Error, ICreateUserAddressRequest>({
		mutationFn: (createData) => userApi.createUserAddress(createData),
		onSuccess: async () => {
			toast.success("Address created successfully");
			await queryClient.refetchQueries({ queryKey: userKeys.userAddresses });
		},
	});
}

export function useUpdateUserAddress() {
	return useMutation<
		IUserAddress,
		Error,
		{ addressId: string; updateData: IUpdateUserAddressRequest }
	>({
		mutationFn: ({ addressId, updateData }) =>
			userApi.updateUserAddress(addressId, updateData),
		onSuccess: async () => {
			toast.success("Address updated successfully");
			await queryClient.refetchQueries({ queryKey: userKeys.userAddresses });
		},
	});
}

export function useDeleteUserAddress() {
	return useMutation<void, Error, string>({
		mutationFn: (addressId) => userApi.deleteUserAddress(addressId),
		onSuccess: () => {
			toast.success("Address deleted successfully");
			queryClient.invalidateQueries({ queryKey: userKeys.userAddresses });
		},
	});
}
