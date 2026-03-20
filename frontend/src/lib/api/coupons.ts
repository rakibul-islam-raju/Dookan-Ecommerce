import { clientApi } from "./axios";

export interface CouponValidateRequest {
	code: string;
	subtotal: number;
}

export interface CouponValidateResponse {
	valid: boolean;
	code: string;
	discount_type: "percentage" | "fixed_amount";
	discount_value: string;
	discount_amount: string;
	description: string;
}

export const couponClientApi = {
	async validate(
		data: CouponValidateRequest
	): Promise<CouponValidateResponse> {
		const { data: response } = await clientApi.post<CouponValidateResponse>(
			"/coupons/validate/",
			data
		);
		return response;
	},
};
