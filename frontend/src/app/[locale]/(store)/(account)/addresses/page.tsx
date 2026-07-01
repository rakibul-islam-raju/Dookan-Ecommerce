"use client";

import { IUserAddress } from "@/@types/User";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Separator } from "@/components/ui/separator";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateUserAddress,
	useDeleteUserAddress,
	useGetUserAddresses,
	useUpdateUserAddress,
} from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import { Briefcase, Home, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const createAddressSchema = (t: (key: string) => string) => z.object({
	address_type: z.enum(["home", "work", "other"]),
	full_name: z.string().min(1, t("validation.fullNameRequired")),
	mobile_number: z
		.string()
		.min(1, t("validation.mobileRequired"))
		.regex(/^[0-9]{11}$/, t("validation.mobileDigits")),
	address_line1: z.string().min(1, t("validation.streetRequired")),
	address_line2: z.string().optional(),
	city: z.string().min(1, t("validation.cityRequired")),
	state: z.string().min(1, t("validation.stateRequired")),
	postal_code: z.string().min(1, t("validation.postalCodeRequired")),
	country: z.string().min(1, t("validation.countryRequired")),
});

type AddressFormData = z.infer<ReturnType<typeof createAddressSchema>>;

const getAddressIcon = (type: IUserAddress["address_type"]) => {
	switch (type) {
		case "home":
			return <Home className="size-4" />;
		case "work":
			return <Briefcase className="size-4" />;
		default:
			return <MapPin className="size-4" />;
	}
};

export default function AddressesPage() {
	const t = useTranslations("account");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAddress, setEditingAddress] = useState<IUserAddress | null>(
		null
	);

	const addressSchema = useMemo(() => createAddressSchema(t), [t]);
	const form = useZodForm(addressSchema, {
		defaultValues: {
			address_type: "home" as const,
			full_name: "",
			mobile_number: "",
			address_line1: "",
			address_line2: "",
			city: "",
			state: "",
			postal_code: "",
			country: "",
		},
	});

	// API hooks
	const { data: addressesResponse, isLoading: isLoadingAddresses } =
		useGetUserAddresses();
	const createAddressMutation = useCreateUserAddress();
	const updateAddressMutation = useUpdateUserAddress();
	const deleteAddressMutation = useDeleteUserAddress();

	const addresses = addressesResponse?.results || [];

	const handleCreateAddress = async (data: AddressFormData) => {
		try {
			await createAddressMutation.mutateAsync(data);
			closeDialog();
		} catch {
			toast.error(t("createAddressFailed"));
		}
	};

	const handleUpdateAddress = async (data: AddressFormData) => {
		if (!editingAddress) return;

		try {
			await updateAddressMutation.mutateAsync({
				addressId: editingAddress.id,
				updateData: { ...data, id: editingAddress.id },
			});
			closeDialog();
		} catch {
			toast.error(t("updateAddressFailed"));
		}
	};

	const handleDeleteAddress = async (addressId: string) => {
		if (!confirm(t("deleteAddressConfirm"))) return;

		try {
			await deleteAddressMutation.mutateAsync(addressId);
		} catch {
			toast.error(t("deleteAddressFailed"));
		}
	};

	const handleSetAsDefault = async (address: IUserAddress) => {
		try {
			await updateAddressMutation.mutateAsync({
				addressId: address.id,
				updateData: { id: address.id, is_default: true },
			});
		} catch {
			toast.error(t("setDefaultFailed"));
		}
	};

	const openEditDialog = (address: IUserAddress) => {
		setEditingAddress(address);
		form.reset({
			address_type: address.address_type,
			full_name: address.full_name,
			mobile_number: address.mobile_number,
			address_line1: address.address_line1,
			address_line2: address.address_line2 || "",
			city: address.city,
			state: address.state,
			postal_code: address.postal_code,
			country: address.country,
		});
		setIsDialogOpen(true);
	};

	const openCreateDialog = () => {
		setEditingAddress(null);
		form.reset({
			address_type: "home" as const,
			full_name: "",
			mobile_number: "",
			address_line1: "",
			address_line2: "",
			city: "",
			state: "",
			postal_code: "",
			country: "",
		});
		setIsDialogOpen(true);
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
		setEditingAddress(null);
		form.reset();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold font-serif">{t("addressesTitle")}</h2>
					<p className="text-muted-foreground">
						{t("addressesDescription")}
					</p>
				</div>

				<Button onClick={openCreateDialog}>
					<Plus className="size-4 mr-2" />
					{t("addAddress")}
				</Button>
			</div>

			<Separator />

			<div className="grid md:grid-cols-2 gap-6">
				{isLoadingAddresses ? (
					<div className="col-span-full flex justify-center py-8">
						<div className="text-muted-foreground">{t("loadingAddresses")}</div>
					</div>
				) : addresses.length === 0 ? (
					<div className="col-span-full text-center py-8">
						<p className="text-muted-foreground">
							{t("noAddresses")}
						</p>
					</div>
				) : (
					addresses.map((address) => (
						<div
							key={address.id}
							className={cn(
								"relative p-6 rounded-xl border bg-card transition-all hover:shadow-sm",
								address.is_default &&
									"border-primary/50 ring-1 ring-primary/20 bg-primary/5"
							)}
						>
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-center gap-2">
									<div
										className={cn(
											"h-8 w-8 rounded-full flex items-center justify-center border",
											address.is_default
												? "bg-background text-primary border-primary/30"
												: "bg-muted text-muted-foreground border-transparent"
										)}
									>
										{getAddressIcon(address.address_type)}
									</div>
									<span className="font-medium capitalize">
										{t(address.address_type)}
									</span>
									{address.is_default && (
										<Badge
											variant="secondary"
											className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20"
										>
											{t("default")}
										</Badge>
									)}
								</div>
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="icon-sm"
										className="h-8 w-8 text-muted-foreground hover:text-foreground"
										onClick={() => openEditDialog(address)}
									>
										<Pencil className="size-4" />
									</Button>
									{!address.is_default && (
										<Button
											variant="ghost"
											size="icon-sm"
											className="h-8 w-8 text-muted-foreground hover:text-destructive"
											onClick={() => handleDeleteAddress(address.id)}
											disabled={deleteAddressMutation.isPending}
										>
											<Trash2 className="size-4" />
										</Button>
									)}
								</div>
							</div>

							<div className="space-y-1 text-sm text-muted-foreground">
								<p className="font-medium text-foreground">
									{address.full_name}
								</p>
								<p>{address.mobile_number}</p>
								<p>{address.address_line1}</p>
								{address.address_line2 && <p>{address.address_line2}</p>}
								<p>
									{address.city}, {address.state} {address.postal_code}
								</p>
								<p>{address.country}</p>
							</div>

							{!address.is_default && (
								<div className="mt-6 pt-4 border-t flex justify-end">
									<Button
										variant="link"
										className="h-auto p-0 text-xs text-primary"
										onClick={() => handleSetAsDefault(address)}
										disabled={updateAddressMutation.isPending}
									>
										{t("setAsDefault")}
									</Button>
								</div>
							)}
						</div>
					))
				)}

				{/* Add New Placeholder Card */}
				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all h-auto min-h-[200px] text-muted-foreground hover:text-primary whitespace-normal"
					onClick={openCreateDialog}
				>
					<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
						<Plus className="size-6" />
					</div>
					<span className="font-medium">{t("addNewAddress")}</span>
				</Button>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={closeDialog}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{editingAddress ? t("editAddress") : t("addNewAddress")}
						</DialogTitle>
						<DialogDescription>
							{editingAddress
								? t("editAddressDescription")
								: t("addAddressDescription")}
						</DialogDescription>
					</DialogHeader>
					<BaseForm
						form={form}
						onSubmit={
							editingAddress ? handleUpdateAddress : handleCreateAddress
						}
					>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label htmlFor="address_type" className="text-sm font-medium">
										{t("addressType")}
									</label>
									<select
										id="address_type"
										{...form.register("address_type")}
										className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									>
										<option value="home">{t("home")}</option>
										<option value="work">{t("work")}</option>
										<option value="other">{t("other")}</option>
									</select>
									<FormMessage />
								</div>
								<TextField
									name="full_name"
									label={t("fullName")}
									placeholder={t("fullNamePlaceholder")}
									required
								/>
							</div>
							<TextField
								name="mobile_number"
								label={t("mobileNumber")}
								placeholder="01XXXXXXXXX"
								type="tel"
								required
							/>
							<TextField
								name="address_line1"
								label={t("streetAddress")}
								placeholder={t("streetAddressPlaceholder")}
								required
							/>
							<TextField
								name="address_line2"
								label={t("addressLine2")}
								placeholder={t("addressLine2Placeholder")}
							/>
							<div className="grid grid-cols-2 gap-4">
								<TextField
									name="city"
									label={t("city")}
									placeholder={t("cityPlaceholder")}
									required
								/>
								<TextField
									name="state"
									label={t("stateProvince")}
									placeholder={t("cityPlaceholder")}
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<TextField
									name="postal_code"
									label={t("zipPostalCode")}
									placeholder="1216"
									required
								/>
								<TextField
									name="country"
									label={t("country")}
								placeholder={t("countryPlaceholder")}
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={closeDialog} type="button">
								{t("cancel")}
							</Button>
							<LoadingButton
								type="submit"
								isLoading={
									createAddressMutation.isPending ||
									updateAddressMutation.isPending
								}
							>
								{editingAddress ? t("updateAddress") : t("saveAddress")}
							</LoadingButton>
						</DialogFooter>
					</BaseForm>
				</DialogContent>
			</Dialog>
		</div>
	);
}
