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
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const addressSchema = z.object({
	address_type: z.enum(["home", "work", "other"]),
	full_name: z.string().min(1, "Full name is required"),
	mobile_number: z
		.string()
		.min(1, "Mobile number is required")
		.regex(/^[0-9]{11}$/, "Mobile number must be 11 digits"),
	address_line1: z.string().min(1, "Street address is required"),
	address_line2: z.string().optional(),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	postal_code: z.string().min(1, "Postal code is required"),
	country: z.string().min(1, "Country is required"),
});

type AddressFormData = z.infer<typeof addressSchema>;

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
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAddress, setEditingAddress] = useState<IUserAddress | null>(
		null
	);

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
			toast.error("Failed to create address");
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
			toast.error("Failed to update address");
		}
	};

	const handleDeleteAddress = async (addressId: string) => {
		if (!confirm("Are you sure you want to delete this address?")) return;

		try {
			await deleteAddressMutation.mutateAsync(addressId);
		} catch {
			toast.error("Failed to delete address");
		}
	};

	const handleSetAsDefault = async (address: IUserAddress) => {
		try {
			await updateAddressMutation.mutateAsync({
				addressId: address.id,
				updateData: { id: address.id, is_default: true },
			});
		} catch {
			toast.error("Failed to set address as default");
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
					<h2 className="text-2xl font-bold font-serif">My Addresses</h2>
					<p className="text-muted-foreground">
						Manage your shipping and billing addresses.
					</p>
				</div>

				<Button onClick={openCreateDialog}>
					<Plus className="size-4 mr-2" />
					Add Address
				</Button>
			</div>

			<Separator />

			<div className="grid md:grid-cols-2 gap-6">
				{isLoadingAddresses ? (
					<div className="col-span-full flex justify-center py-8">
						<div className="text-muted-foreground">Loading addresses...</div>
					</div>
				) : addresses.length === 0 ? (
					<div className="col-span-full text-center py-8">
						<p className="text-muted-foreground">
							No addresses found. Add your first address above.
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
										{address.address_type}
									</span>
									{address.is_default && (
										<Badge
											variant="secondary"
											className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20"
										>
											Default
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
										Set as Default
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
					<span className="font-medium">Add New Address</span>
				</Button>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={closeDialog}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{editingAddress ? "Edit Address" : "Add New Address"}
						</DialogTitle>
						<DialogDescription>
							{editingAddress
								? "Update your shipping address details."
								: "Enter the details for your new shipping address."}
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
										Address Type
									</label>
									<select
										id="address_type"
										{...form.register("address_type")}
										className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									>
										<option value="home">Home</option>
										<option value="work">Work</option>
										<option value="other">Other</option>
									</select>
									<FormMessage />
								</div>
								<TextField
									name="full_name"
									label="Full Name"
									placeholder="John Doe"
									required
								/>
							</div>
							<TextField
								name="mobile_number"
								label="Mobile Number"
								placeholder="01XXXXXXXXX"
								type="tel"
								required
							/>
							<TextField
								name="address_line1"
								label="Street Address"
								placeholder="123 Main St"
								required
							/>
							<TextField
								name="address_line2"
								label="Apartment, Suite, etc. (Optional)"
								placeholder="Apt 4B"
							/>
							<div className="grid grid-cols-2 gap-4">
								<TextField
									name="city"
									label="City"
									placeholder="Dhaka"
									required
								/>
								<TextField
									name="state"
									label="State / Province"
									placeholder="Dhaka"
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<TextField
									name="postal_code"
									label="Zip / Postal Code"
									placeholder="1216"
									required
								/>
								<TextField
									name="country"
									label="Country"
									placeholder="Bangladesh"
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={closeDialog} type="button">
								Cancel
							</Button>
							<LoadingButton
								type="submit"
								isLoading={
									createAddressMutation.isPending ||
									updateAddressMutation.isPending
								}
							>
								{editingAddress ? "Update Address" : "Save Address"}
							</LoadingButton>
						</DialogFooter>
					</BaseForm>
				</DialogContent>
			</Dialog>
		</div>
	);
}
