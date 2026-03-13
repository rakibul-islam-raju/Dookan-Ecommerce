import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateBanner,
	useUpdateBanner,
	type BannerListItem,
} from "@/lib/api/store";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const bannerSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(200, "Title must not exceed 200 characters"),
	description: z
		.string()
		.max(1000, "Description must not exceed 1000 characters")
		.optional()
		.or(z.literal("")),
	start_date: z.string().optional().or(z.literal("")),
	end_date: z.string().optional().or(z.literal("")),
	display_order: z.coerce
		.number()
		.int("Order must be a whole number")
		.min(0, "Order must be 0 or greater")
		.default(0),
	is_active: z.boolean().default(true),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerFormProps {
	handleClose: () => void;
	banner?: BannerListItem | null;
	mode: "create" | "edit";
}

export const BannerForm = ({ handleClose, banner, mode }: BannerFormProps) => {
	const { mutate: createBanner, isPending: isCreating } = useCreateBanner();
	const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner();
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(bannerSchema, {
		defaultValues: {
			title: "",
			description: "",
			start_date: "",
			end_date: "",
			display_order: 0,
			is_active: true,
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
		setImageFile(null);
		setImagePreview(null);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const onSubmit = async (data: BannerFormData) => {
		if (isEditMode && banner) {
			updateBanner(
				{
					id: banner.id,
					updateData: {
						...data,
						start_date: data.start_date || null,
						end_date: data.end_date || null,
						...(imageFile && { image: imageFile }),
					},
				},
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Banner updated successfully");
					},
				}
			);
		} else {
			if (!imageFile) {
				toast.error("Please select an image for the banner");
				return;
			}
			createBanner(
				{
					...data,
					image: imageFile,
					start_date: data.start_date || null,
					end_date: data.end_date || null,
				},
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Banner created successfully");
					},
				}
			);
		}
	};

	useEffect(() => {
		if (banner) {
			form.reset({
				title: banner.title,
				description: banner.description || "",
				start_date: banner.start_date
					? new Date(banner.start_date).toISOString().slice(0, 16)
					: "",
				end_date: banner.end_date
					? new Date(banner.end_date).toISOString().slice(0, 16)
					: "",
				display_order: banner.display_order,
				is_active: banner.is_active,
			});
			if (banner.image) {
				setImagePreview(banner.image);
			}
		}
	}, [banner]);

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="title"
					label="Title"
					placeholder="e.g., Summer Sale, New Arrivals"
					required
					description="The banner headline"
				/>
				<TextareaField
					name="description"
					label="Description"
					placeholder="e.g., Get up to 50% off on all products"
					description="Additional details about the banner"
				/>

				<div className="space-y-2">
					<Label htmlFor="image">
						Banner Image {!isEditMode && <span className="text-destructive">*</span>}
					</Label>
					<Input
						id="image"
						type="file"
						accept="image/*"
						onChange={handleImageChange}
					/>
					{imagePreview && (
						<div className="mt-2">
							<img
								src={imagePreview}
								alt="Preview"
								className="max-h-32 rounded-md object-cover"
							/>
						</div>
					)}
					<p className="text-sm text-muted-foreground">
						{isEditMode
							? "Leave empty to keep the current image"
							: "Upload an image for the banner"}
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="start_date"
						label="Start Date"
						type="datetime-local"
						description="When the banner becomes visible"
					/>
					<TextField
						name="end_date"
						label="End Date"
						type="datetime-local"
						description="When the banner expires"
					/>
				</div>

				<TextField
					name="display_order"
					label="Display Order"
					placeholder="e.g., 1"
					type="number"
					description="Lower numbers appear first"
				/>

				<CheckboxField name="is_active" label="Is Active" />
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Banner" : "Create Banner"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
