import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateAnnouncement,
	useUpdateAnnouncement,
	type AnnouncementListItem,
} from "@/lib/api/store";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

type TranslateFn = ReturnType<typeof useT>;

const createAnnouncementSchema = (t: TranslateFn) =>
	z
		.object({
			title: z
				.string()
				.min(1, t("store.announcements.form.validation.title", "Title is required"))
				.max(
					100,
					t(
						"store.announcements.form.validation.titleMax",
						"Title must not exceed 100 characters",
					),
				),
			description: z
				.string()
				.min(
					1,
					t(
						"store.announcements.form.validation.description",
						"Description is required",
					),
				)
				.max(
					2000,
					t(
						"store.announcements.form.validation.descriptionMax",
						"Description must not exceed 2000 characters",
					),
				),
			start_date: z
				.string()
				.min(
					1,
					t(
						"store.announcements.form.validation.startDate",
						"Start date is required",
					),
				),
			end_date: z
				.string()
				.min(
					1,
					t(
						"store.announcements.form.validation.endDate",
						"End date is required",
					),
				),
			is_active: z.boolean().default(true),
		})
		.refine(
			(data) => {
				if (data.start_date && data.end_date) {
					return new Date(data.start_date) < new Date(data.end_date);
				}
				return true;
			},
			{
				message: t(
					"store.announcements.form.validation.endAfterStart",
					"End date must be after start date",
				),
				path: ["end_date"],
			},
		);

type AnnouncementFormData = z.infer<ReturnType<typeof createAnnouncementSchema>>;

interface AnnouncementFormProps {
	handleClose: () => void;
	announcement?: AnnouncementListItem | null;
	mode: "create" | "edit";
}

export const AnnouncementForm = ({
	handleClose,
	announcement,
	mode,
}: AnnouncementFormProps) => {
	const t = useT();
	const { mutate: createAnnouncement, isPending: isCreating } =
		useCreateAnnouncement();
	const { mutate: updateAnnouncement, isPending: isUpdating } =
		useUpdateAnnouncement();

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(createAnnouncementSchema(t), {
		defaultValues: {
			title: "",
			description: "",
			start_date: "",
			end_date: "",
			is_active: true,
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const onSubmit = async (data: AnnouncementFormData) => {
		const formattedData = {
			...data,
			start_date: new Date(data.start_date).toISOString(),
			end_date: new Date(data.end_date).toISOString(),
		};

		if (isEditMode && announcement) {
			updateAnnouncement(
				{
					id: announcement.id,
					updateData: formattedData,
				},
				{
					onSuccess: () => {
						handleCancel();
						toast.success(
							t(
								"store.announcements.form.toast.updateSuccess",
								"Announcement updated successfully",
							),
						);
					},
				}
			);
		} else {
			createAnnouncement(formattedData, {
				onSuccess: () => {
					handleCancel();
					toast.success(
						t(
							"store.announcements.form.toast.createSuccess",
							"Announcement created successfully",
						),
					);
				},
			});
		}
	};

	useEffect(() => {
		if (announcement) {
			form.reset({
				title: announcement.title,
				description: announcement.description,
				start_date: new Date(announcement.start_date)
					.toISOString()
					.slice(0, 16),
				end_date: new Date(announcement.end_date).toISOString().slice(0, 16),
				is_active: announcement.is_active,
			});
		}
	}, [announcement]);

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="title"
					label={t("store.announcements.form.title", "Title")}
					placeholder={t(
						"store.announcements.form.titlePlaceholder",
						"e.g., Store Closure Notice, Holiday Hours",
					)}
					required
					description={t(
						"store.announcements.form.titleHelp",
						"The announcement headline",
					)}
				/>
				<TextareaField
					name="description"
					label={t("store.announcements.form.description", "Description")}
					placeholder={t(
						"store.announcements.form.descriptionPlaceholder",
						"e.g., We will be closed on December 25th...",
					)}
					required
					description={t(
						"store.announcements.form.descriptionHelp",
						"The full announcement message",
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="start_date"
						label={t("store.common.startDate", "Start Date")}
						type="datetime-local"
						required
						description={t(
							"store.announcements.form.startDateHelp",
							"When the announcement becomes visible",
						)}
					/>
					<TextField
						name="end_date"
						label={t("store.common.endDate", "End Date")}
						type="datetime-local"
						required
						description={t(
							"store.announcements.form.endDateHelp",
							"When the announcement expires",
						)}
					/>
				</div>

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
							id="store.announcements.form.update"
							defaultMessage="Update Announcement"
						/>
					) : (
						<T
							id="store.announcements.form.create"
							defaultMessage="Create Announcement"
						/>
					)}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
