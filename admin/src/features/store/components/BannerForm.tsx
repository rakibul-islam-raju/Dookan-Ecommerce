import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateBanner,
	useUpdateBanner,
	type BannerListItem,
} from "@/lib/api/store";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

type TranslateFn = ReturnType<typeof useT>;

const createBannerSchema = (t: TranslateFn) =>
	z.object({
		title: z
			.string()
			.min(1, t("store.banners.form.validation.title", "Title is required"))
			.max(
				200,
				t(
					"store.banners.form.validation.titleMax",
					"Title must not exceed 200 characters",
				),
			),
		description: z
			.string()
			.max(
				1000,
				t(
					"store.banners.form.validation.descriptionMax",
					"Description must not exceed 1000 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		start_date: z.string().optional().or(z.literal("")),
		end_date: z.string().optional().or(z.literal("")),
		display_order: z.coerce
			.number()
			.int(
				t(
					"store.banners.form.validation.orderInteger",
					"Order must be a whole number",
				),
			)
			.min(
				0,
				t("store.banners.form.validation.orderMin", "Order must be 0 or greater"),
			)
			.default(0),
		is_active: z.boolean().default(true),
	});

type BannerFormData = z.infer<ReturnType<typeof createBannerSchema>>;

interface BannerFormProps {
	handleClose: () => void;
	banner?: BannerListItem | null;
	mode: "create" | "edit";
}

export const BannerForm = ({ handleClose, banner, mode }: BannerFormProps) => {
	const t = useT();
	const { mutate: createBanner, isPending: isCreating } = useCreateBanner();
	const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner();
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(createBannerSchema(t), {
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
						toast.success(
							t(
								"store.banners.form.toast.updateSuccess",
								"Banner updated successfully",
							),
						);
					},
				}
			);
		} else {
			if (!imageFile) {
				toast.error(
					t(
						"store.banners.form.toast.imageRequired",
						"Please select an image for the banner",
					),
				);
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
						toast.success(
							t(
								"store.banners.form.toast.createSuccess",
								"Banner created successfully",
							),
						);
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
					label={t("store.banners.form.title", "Title")}
					placeholder={t(
						"store.banners.form.titlePlaceholder",
						"e.g., Summer Sale, New Arrivals",
					)}
					required
					description={t(
						"store.banners.form.titleDescription",
						"The banner headline",
					)}
				/>
				<TextareaField
					name="description"
					label={t("store.banners.form.description", "Description")}
					placeholder={t(
						"store.banners.form.descriptionPlaceholder",
						"e.g., Get up to 50% off on all products",
					)}
					description={t(
						"store.banners.form.descriptionHelp",
						"Additional details about the banner",
					)}
				/>

				<div className="space-y-2">
					<Label htmlFor="image">
						<T id="store.banners.form.image" defaultMessage="Banner Image" />{" "}
						{!isEditMode && <span className="text-destructive">*</span>}
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
								alt={t("store.common.preview", "Preview")}
								className="max-h-32 rounded-md object-cover"
							/>
						</div>
					)}
					<p className="text-sm text-muted-foreground">
						{isEditMode
							? t(
									"store.banners.form.imageHelpEdit",
									"Leave empty to keep the current image",
								)
							: t(
									"store.banners.form.imageHelpCreate",
									"Upload an image for the banner",
								)}
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="start_date"
						label={t("store.common.startDate", "Start Date")}
						type="datetime-local"
						description={t(
							"store.banners.form.startDateHelp",
							"When the banner becomes visible",
						)}
					/>
					<TextField
						name="end_date"
						label={t("store.common.endDate", "End Date")}
						type="datetime-local"
						description={t(
							"store.banners.form.endDateHelp",
							"When the banner expires",
						)}
					/>
				</div>

				<TextField
					name="display_order"
					label={t("store.common.displayOrder", "Display Order")}
					placeholder={t("store.common.displayOrderPlaceholder", "e.g., 1")}
					type="number"
					description={t(
						"store.banners.form.displayOrderHelp",
						"Lower numbers appear first",
					)}
				/>

				<CheckboxField
					name="is_active"
					label={t("store.common.isActive", "Is Active")}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					<T id="common.cancel" defaultMessage="Cancel" />
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? (
						<T
							id="store.banners.form.update"
							defaultMessage="Update Banner"
						/>
					) : (
						<T
							id="store.banners.form.create"
							defaultMessage="Create Banner"
						/>
					)}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
