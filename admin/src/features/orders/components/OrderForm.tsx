import { BaseForm } from "@/components/ui/@form/BaseForm";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/i18n/locale-context";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { useCreateOrder } from "@/lib/api/orders";
import { getProducts, type ProductListItem } from "@/lib/api/product";
import { getProductVariants, type ProductVariant } from "@/lib/api/variant";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

type TranslateFn = ReturnType<typeof useT>;

const createOrderSchema = (t: TranslateFn) =>
	z.object({
		customer_name: z
			.string()
			.min(1, t("orders.form.validation.customerName", "Customer name is required")),
		customer_email: z
			.string()
			.email(t("orders.form.validation.email", "Enter a valid email"))
			.optional()
			.or(z.literal("")),
		guest_mobile_number: z.string().optional(),
		payment_method: z.enum(["cod", "online", "card", "upi"]),
		delivery_type: z.enum(["inside_dhaka", "outside_dhaka"]),
		customer_note: z.string().optional(),
		items: z
			.array(
				z.object({
					product_id: z
						.string()
						.min(1, t("orders.form.validation.product", "Product is required")),
					variant_id: z
						.string()
						.min(1, t("orders.form.validation.variant", "Variant is required")),
					quantity: z.coerce
						.number()
						.int()
						.min(1, t("orders.form.validation.quantity", "Min 1")),
				}),
			)
			.min(1, t("orders.form.validation.items", "Add at least one item")),
		shipping_address: z.object({
			full_name: z
				.string()
				.min(1, t("orders.form.validation.fullName", "Full name is required")),
			mobile_number: z
				.string()
				.min(
					1,
					t("orders.form.validation.mobileNumber", "Mobile number is required"),
				),
			address_line1: z
				.string()
				.min(1, t("orders.form.validation.address", "Address is required")),
			address_line2: z.string().optional(),
			city: z
				.string()
				.min(1, t("orders.form.validation.city", "City is required")),
			state: z
				.string()
				.min(1, t("orders.form.validation.state", "State / District is required")),
			postal_code: z
				.string()
				.min(1, t("orders.form.validation.postalCode", "Postal code is required")),
			country: z.string().default("Bangladesh"),
		}),
	});

type OrderFormData = z.infer<ReturnType<typeof createOrderSchema>>;

const defaultValues: OrderFormData = {
	customer_name: "",
	customer_email: "",
	guest_mobile_number: "",
	payment_method: "cod",
	delivery_type: "inside_dhaka",
	customer_note: "",
	items: [{ product_id: "", variant_id: "", quantity: 1 }],
	shipping_address: {
		full_name: "",
		mobile_number: "",
		address_line1: "",
		address_line2: "",
		city: "",
		state: "",
		postal_code: "",
		country: "Bangladesh",
	},
};

// ─── Product Picker ───────────────────────────────────────────────────────────

interface ProductPickerProps {
	value: string;
	onChange: (value: string) => void;
	products: ProductListItem[];
	hasError?: boolean;
	t: TranslateFn;
	locale: "en" | "bn";
}

function ProductPicker({
	value,
	onChange,
	products,
	hasError,
	t,
	locale,
}: ProductPickerProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const filtered = products.filter(
		(p) =>
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.sku.toLowerCase().includes(search.toLowerCase())
	);

	const selected = products.find((p) => p.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					type="button"
					className={cn(
						"w-full justify-between font-normal h-9 px-3",
						!selected && "text-muted-foreground",
						hasError && "border-red-500 focus-visible:ring-red-500"
					)}
				>
					<span className="truncate text-sm">
						{selected
							? selected.name
							: t("orders.form.items.selectProduct", "Select product...")}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[420px] p-2" align="start">
				<Input
					placeholder={t(
						"orders.form.items.searchProduct",
						"Search by name or SKU...",
					)}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="mb-2 h-8 text-sm"
					autoFocus
				/>
				<div className="max-h-[220px] overflow-y-auto space-y-0.5">
					{filtered.length === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							{t("orders.form.items.noProducts", "No products found")}
						</p>
					) : (
						filtered.map((product) => (
							<div
								key={product.id}
								className={cn(
									"flex items-center gap-2 rounded px-2 py-2 cursor-pointer hover:bg-accent transition-colors",
									value === product.id && "bg-accent"
								)}
								onClick={() => {
									onChange(product.id);
									setOpen(false);
									setSearch("");
								}}
							>
								<Check
									className={cn(
										"h-4 w-4 shrink-0",
										value === product.id
											? "opacity-100 text-primary"
											: "opacity-0"
									)}
								/>
								<div className="min-w-0">
									<p className="text-sm font-medium truncate">{product.name}</p>
									<p className="text-xs text-muted-foreground">
										{t("orders.form.items.skuLine", "SKU: {sku} · {price}", {
											sku: product.sku,
											price: `৳${parseFloat(product.base_price).toLocaleString(
												locale === "bn" ? "bn-BD" : "en-BD",
												{
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												},
											)}`,
										})}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

// ─── Variant Picker ───────────────────────────────────────────────────────────

interface VariantPickerProps {
	productId: string;
	value: string;
	onChange: (value: string) => void;
	hasError?: boolean;
	t: TranslateFn;
	locale: "en" | "bn";
}

function VariantPicker({
	productId,
	value,
	onChange,
	hasError,
	t,
	locale,
}: VariantPickerProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const { data: variants = [], isLoading } = useQuery(
		getProductVariants(productId)
	);

	const filtered = variants.filter(
		(v) =>
			v.name.toLowerCase().includes(search.toLowerCase()) ||
			v.sku.toLowerCase().includes(search.toLowerCase())
	);

	const selected = variants.find((v) => v.id === value);

	if (!productId) {
		return (
			<Button
				variant="outline"
				type="button"
				disabled
				className="w-full justify-between font-normal h-9 px-3 text-muted-foreground"
			>
				<span className="truncate text-sm">
					{t("orders.form.items.selectProductFirst", "Select product first...")}
				</span>
				<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					type="button"
					className={cn(
						"w-full justify-between font-normal h-9 px-3",
						!selected && "text-muted-foreground",
						hasError && "border-red-500 focus-visible:ring-red-500"
					)}
				>
					<span className="truncate text-sm">
						{selected
							? `${selected.name} (${selected.sku})`
							: isLoading
								? t("orders.form.items.loadingVariants", "Loading...")
								: t("orders.form.items.selectVariant", "Select variant...")}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[380px] p-2" align="start">
				<Input
					placeholder={t(
						"orders.form.items.searchVariant",
						"Search by name or SKU...",
					)}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="mb-2 h-8 text-sm"
					autoFocus
				/>
				<div className="max-h-[200px] overflow-y-auto space-y-0.5">
					{filtered.length === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							{t("orders.form.items.noVariants", "No variants found")}
						</p>
					) : (
						filtered.map((variant: ProductVariant) => (
							<div
								key={variant.id}
								className={cn(
									"flex items-center gap-2 rounded px-2 py-2 cursor-pointer hover:bg-accent transition-colors",
									value === variant.id && "bg-accent",
									!variant.is_in_stock && "opacity-50"
								)}
								onClick={() => {
									onChange(variant.id);
									setOpen(false);
									setSearch("");
								}}
							>
								<Check
									className={cn(
										"h-4 w-4 shrink-0",
										value === variant.id
											? "opacity-100 text-primary"
											: "opacity-0"
									)}
								/>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium truncate">{variant.name}</p>
									<p className="text-xs text-muted-foreground">
										{t(
											"orders.form.items.variantLine",
											"{sku} · {price}{stockState}",
											{
												sku: variant.sku,
												price: `৳${parseFloat(
													variant.base_price,
												).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}`,
												stockState: !variant.is_in_stock
													? ` · ${t(
															"orders.form.items.outOfStock",
															"Out of stock",
														)}`
													: "",
											},
										)}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

// ─── Order Form ───────────────────────────────────────────────────────────────

export function OrderForm({ handleClose }: { handleClose: () => void }) {
	const t = useT();
	const { locale } = useLocale();
	const navigate = useNavigate();

	const form = useZodForm(createOrderSchema(t), {
		defaultValues,
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	const { data: productsData, isLoading: isLoadingProducts } = useQuery(
		getProducts({ limit: 200, offset: 0, is_active: true })
	);
	const products = productsData?.results ?? [];

	const { mutate: createOrder, isPending } = useCreateOrder();

	const onSubmit = (data: OrderFormData) => {
		createOrder(
			{
				...data,
				customer_email: data.customer_email || undefined,
				guest_mobile_number: data.guest_mobile_number || undefined,
				customer_note: data.customer_note || undefined,
				shipping_address: {
					...data.shipping_address,
					address_line2: data.shipping_address.address_line2 || undefined,
				},
			},
			{
				onSuccess: (order) => {
					toast.success(
						t("orders.form.toast.createSuccess", "Order created successfully"),
					);
					navigate(`/orders/${order.id}`);
				},
				onError: () => {
					toast.error(
						t(
							"orders.form.toast.createFailed",
							"Failed to create order. Please check the form and try again.",
						),
					);
				},
			}
		);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const itemsErrors = form.formState.errors.items as any;
	const itemsRootError: string | undefined =
		itemsErrors?.message ?? itemsErrors?.root?.message;

	return (
		<BaseForm form={form} onSubmit={onSubmit} className="space-y-6 pb-12">
			{/* ── Customer Information ─────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>
						{t("orders.form.customer.title", "Customer Information")}
					</CardTitle>
					<CardDescription>
						{t(
							"orders.form.customer.description",
							"Enter the customer's details. Use the mobile field for guest orders.",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<TextField
						name="customer_name"
						label={t("orders.form.customer.name", "Customer Name")}
						required
						placeholder={t("orders.form.customer.namePlaceholder", "e.g., John Doe")}
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextField
							name="customer_email"
							label={t("orders.form.customer.email", "Email")}
							type="email"
							placeholder={t(
								"orders.form.customer.emailPlaceholder",
								"e.g., customer@example.com",
							)}
							helpText={t(
								"orders.form.customer.emailHelp",
								"Optional. Leave blank for guest orders.",
							)}
						/>
						<TextField
							name="guest_mobile_number"
							label={t("orders.form.customer.mobile", "Mobile Number")}
							type="tel"
							placeholder={t(
								"orders.form.customer.mobilePlaceholder",
								"e.g., 01700000000",
							)}
							helpText={t(
								"orders.form.customer.mobileHelp",
								"Required for guest orders without an account.",
							)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Order Items ──────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{t("orders.form.items.title", "Order Items")}</CardTitle>
					<CardDescription>
						{t(
							"orders.form.items.description",
							"Add the products, variants, and quantities for this order.",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{/* Column headers */}
					<div className="hidden md:grid md:grid-cols-[1fr_1fr_100px_40px] gap-3 px-1">
						<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							{t("orders.form.items.product", "Product")}{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							{t("orders.form.items.variant", "Variant")}{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							{t("orders.form.items.quantity", "Qty")}{" "}
							<span className="text-red-500">*</span>
						</Label>
						<span />
					</div>

					{fields.map((field, index) => {
						const productId = form.watch(`items.${index}.product_id`);
						return (
							<div
								key={field.id}
								className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_40px] gap-3 items-start"
							>
								{/* Product picker */}
								<div>
									<Label className="md:hidden text-sm font-medium mb-1 block">
										{t("orders.form.items.product", "Product")}{" "}
										<span className="text-red-500">*</span>
									</Label>
									<ProductPicker
										value={form.watch(`items.${index}.product_id`)}
										onChange={(val) => {
											form.setValue(`items.${index}.product_id`, val, {
												shouldValidate: true,
											});
											// Reset variant when product changes
											form.setValue(`items.${index}.variant_id`, "");
										}}
										products={products}
										hasError={!!itemsErrors?.[index]?.product_id}
										t={t}
										locale={locale}
									/>
									{itemsErrors?.[index]?.product_id && (
										<p className="text-xs text-red-500 mt-1">
											{itemsErrors[index].product_id.message}
										</p>
									)}
								</div>

								{/* Variant picker */}
								<div>
									<Label className="md:hidden text-sm font-medium mb-1 block">
										{t("orders.form.items.variant", "Variant")}{" "}
										<span className="text-red-500">*</span>
									</Label>
									<VariantPicker
										productId={productId}
										value={form.watch(`items.${index}.variant_id`)}
										onChange={(val) =>
											form.setValue(`items.${index}.variant_id`, val, {
												shouldValidate: true,
											})
										}
										hasError={!!itemsErrors?.[index]?.variant_id}
										t={t}
										locale={locale}
									/>
									{itemsErrors?.[index]?.variant_id && (
										<p className="text-xs text-red-500 mt-1">
											{itemsErrors[index].variant_id.message}
										</p>
									)}
								</div>

								{/* Quantity */}
								<div>
									<Label className="md:hidden text-sm font-medium mb-1 block">
										{t("orders.form.items.quantity", "Qty")}{" "}
										<span className="text-red-500">*</span>
									</Label>
									<Input
										type="number"
										min={1}
										{...form.register(`items.${index}.quantity`, {
											valueAsNumber: true,
										})}
										className={cn(
											"h-9",
											itemsErrors?.[index]?.quantity && "border-red-500"
										)}
										placeholder="1"
									/>
									{itemsErrors?.[index]?.quantity && (
										<p className="text-xs text-red-500 mt-1">
											{itemsErrors[index].quantity.message}
										</p>
									)}
								</div>

								{/* Remove row */}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-9 w-9 text-muted-foreground hover:text-destructive"
									onClick={() => remove(index)}
									disabled={fields.length === 1}
									title={t("orders.form.items.remove", "Remove item")}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						);
					})}

					{itemsRootError && (
						<p className="text-sm text-red-500">{itemsRootError}</p>
					)}

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => append({ product_id: "", variant_id: "", quantity: 1 })}
						className="w-full mt-1"
						disabled={isLoadingProducts}
					>
						<Plus className="h-4 w-4 mr-2" />
						{t("orders.form.items.add", "Add Item")}
					</Button>
				</CardContent>
			</Card>

			{/* ── Shipping Address ─────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>
						{t("orders.form.shipping.title", "Shipping Address")}
					</CardTitle>
					<CardDescription>
						{t("orders.form.shipping.description", "Delivery address for this order.")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextField
							name="shipping_address.full_name"
							label={t("orders.form.shipping.fullName", "Full Name")}
							required
							placeholder={t("orders.form.shipping.fullNamePlaceholder", "e.g., John Doe")}
						/>
						<TextField
							name="shipping_address.mobile_number"
							label={t("orders.form.shipping.mobile", "Mobile Number")}
							type="tel"
							required
							placeholder={t("orders.form.shipping.mobilePlaceholder", "e.g., 01700000000")}
						/>
					</div>
					<TextField
						name="shipping_address.address_line1"
						label={t("orders.form.shipping.addressLine1", "Address Line 1")}
						required
						placeholder={t(
							"orders.form.shipping.addressLine1Placeholder",
							"House / flat number, street name",
						)}
					/>
					<TextField
						name="shipping_address.address_line2"
						label={t("orders.form.shipping.addressLine2", "Address Line 2")}
						placeholder={t(
							"orders.form.shipping.addressLine2Placeholder",
							"Apartment, suite, landmark (optional)",
						)}
					/>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<TextField
							name="shipping_address.city"
							label={t("orders.form.shipping.city", "City")}
							required
							placeholder={t("orders.form.shipping.cityPlaceholder", "e.g., Dhaka")}
						/>
						<TextField
							name="shipping_address.state"
							label={t("orders.form.shipping.state", "State / District")}
							required
							placeholder={t(
								"orders.form.shipping.statePlaceholder",
								"e.g., Dhaka Division",
							)}
						/>
						<TextField
							name="shipping_address.postal_code"
							label={t("orders.form.shipping.postalCode", "Postal Code")}
							required
							placeholder={t("orders.form.shipping.postalCodePlaceholder", "e.g., 1207")}
						/>
					</div>
					<TextField
						name="shipping_address.country"
						label={t("orders.form.shipping.country", "Country")}
						placeholder={t("orders.form.shipping.countryPlaceholder", "Bangladesh")}
					/>
				</CardContent>
			</Card>

			{/* ── Payment & Delivery ───────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>
						{t("orders.form.payment.title", "Payment & Delivery")}
					</CardTitle>
					<CardDescription>
						{t(
							"orders.form.payment.description",
							"Select the payment method and delivery zone.",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<SelectField
							name="payment_method"
							label={t("orders.form.payment.method", "Payment Method")}
							required
							options={[
								{
									value: "cod",
									label: t(
										"orders.common.paymentMethod.cod",
										"Cash on Delivery",
									),
								},
								{
									value: "online",
									label: t(
										"orders.common.paymentMethod.online",
										"Online Payment",
									),
								},
								{
									value: "card",
									label: t("orders.common.paymentMethod.card", "Card"),
								},
								{
									value: "upi",
									label: t("orders.common.paymentMethod.upi", "UPI"),
								},
							]}
							placeholder={t(
								"orders.form.payment.methodPlaceholder",
								"Select payment method",
							)}
						/>
						<SelectField
							name="delivery_type"
							label={t("orders.form.payment.deliveryType", "Delivery Type")}
							required
							options={[
								{
									value: "inside_dhaka",
									label: t(
										"orders.common.deliveryType.insideDhaka",
										"Inside Dhaka",
									),
								},
								{
									value: "outside_dhaka",
									label: t(
										"orders.common.deliveryType.outsideDhaka",
										"Outside Dhaka",
									),
								},
							]}
							placeholder={t(
								"orders.form.payment.deliveryTypePlaceholder",
								"Select delivery type",
							)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Notes ───────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{t("orders.form.note.title", "Customer Note")}</CardTitle>
					<CardDescription>
						{t(
							"orders.form.note.description",
							"Optional message or special instruction from the customer.",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TextareaField
						name="customer_note"
						label={t("orders.form.note.label", "Note")}
						placeholder={t(
							"orders.form.note.placeholder",
							"Any special instructions for this order...",
						)}
						rows={3}
					/>
				</CardContent>
			</Card>

			{/* ── Actions ─────────────────────────────────────────── */}
			<Separator />
			<div className="flex items-center justify-end gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={handleClose}
					disabled={isPending}
				>
					{t("orders.form.cancel", "Cancel")}
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{t("orders.form.submit", "Create Order")}
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
