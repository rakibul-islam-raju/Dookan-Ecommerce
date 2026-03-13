import { IPaginatedResponse } from "@/@types/Common";
import {
	ICreateUserAddressRequest,
	IUpdateUserAddressRequest,
	IUserAddress,
} from "@/@types/User";
import { User } from "./auth";
import { clientApi } from "./axios";

export const userApi = {
	getProfile: async (): Promise<User> => {
		const { data } = await clientApi.get<User>("/users/me/");
		return data;
	},
	updateProfile: async (updateData: {
		first_name: string;
		last_name: string;
		email: string;
		mobile_number: string;
	}): Promise<User> => {
		const { data } = await clientApi.patch<User>("/users/profile/", updateData);
		return data;
	},
	changePassword: async (data: {
		old_password: string;
		new_password: string;
	}): Promise<void> => {
		await clientApi.post("/users/profile/change-password/", data);
	},
	getUserAddresses: async (): Promise<IPaginatedResponse<IUserAddress>> => {
		const { data } = await clientApi.get<IPaginatedResponse<IUserAddress>>(
			"/users/profile/addresses/"
		);
		return data;
	},
	createUserAddress: async (
		createData: ICreateUserAddressRequest
	): Promise<IUserAddress> => {
		const { data } = await clientApi.post<IUserAddress>(
			"/users/profile/addresses/",
			createData
		);
		return data;
	},
	updateUserAddress: async (
		addressId: string,
		updateData: IUpdateUserAddressRequest
	): Promise<IUserAddress> => {
		const { data } = await clientApi.patch<IUserAddress>(
			`/users/profile/addresses/${addressId}/`,
			updateData
		);
		return data;
	},
	deleteUserAddress: async (addressId: string): Promise<void> => {
		await clientApi.delete(`/users/profile/addresses/${addressId}/`);
	},
};
