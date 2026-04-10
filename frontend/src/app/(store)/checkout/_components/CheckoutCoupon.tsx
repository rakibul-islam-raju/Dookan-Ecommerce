"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CouponValidateResponse } from "@/lib/api/coupons";
import { Check, Loader2, Tag, X } from "lucide-react";

interface CheckoutCouponProps {
	couponCode: string;
	setCouponCode: (code: string) => void;
	couponLoading: boolean;
	couponError: string;
	setCouponError: (error: string) => void;
	appliedCoupon: CouponValidateResponse | null;
	onApply: () => void;
	onRemove: () => void;
}

export function CheckoutCoupon({
	couponCode,
	setCouponCode,
	couponLoading,
	couponError,
	setCouponError,
	appliedCoupon,
	onApply,
	onRemove,
}: CheckoutCouponProps) {
	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold flex items-center gap-2">
				<Tag className="size-5" />
				Discount Code
			</h2>

			{appliedCoupon ? (
				<div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
					<div className="flex items-center gap-2">
						<Check className="size-4 text-green-600" />
						<span className="font-mono font-semibold text-green-700 dark:text-green-400">
							{appliedCoupon.code}
						</span>
						<span className="text-sm text-green-600 dark:text-green-400">
							(-৳{parseFloat(appliedCoupon.discount_amount).toFixed(2)})
						</span>
					</div>
					<button
						type="button"
						onClick={onRemove}
						className="text-muted-foreground hover:text-destructive transition-colors"
					>
						<X className="size-4" />
					</button>
				</div>
			) : (
				<div>
					<div className="flex gap-2">
						<Input
							placeholder="Enter coupon code"
							value={couponCode}
							onChange={(e) => {
								setCouponCode(e.target.value.toUpperCase());
								setCouponError("");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									onApply();
								}
							}}
							className={couponError ? "border-red-500" : ""}
						/>
						<Button
							type="button"
							variant="outline"
							onClick={onApply}
							disabled={couponLoading || !couponCode.trim()}
						>
							{couponLoading ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								"Apply"
							)}
						</Button>
					</div>
					{couponError && (
						<p className="text-sm text-red-500 mt-2">{couponError}</p>
					)}
				</div>
			)}
		</section>
	);
}
