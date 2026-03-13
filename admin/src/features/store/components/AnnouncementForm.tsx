import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateAnnouncement,
	useUpdateAnnouncement,
	type AnnouncementListItem,
} from "@/lib/api/store";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const announcementSchema = z
	.object({
		title: z
			.string()
			.min(1, "Title is required")
			.max(100, "Title must not exceed 100 characters"),
		description: z
			.string()
			.min(1, "Description is required")
			.max(2000, "Description must not exceed 2000 characters"),
		start_date: z.string().min(1, "Start date is required"),
		end_date: z.string().min(1, "End date is required"),
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
			message: "End date must be after start date",
			path: ["end_date"],
		}
	);

type AnnouncementFormData = z.infer<typeof announcementSchema>;

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
	const { mutate: createAnnouncement, isPending: isCreating } =
		useCreateAnnouncement();
	const { mutate: updateAnnouncement, isPending: isUpdating } =
		useUpdateAnnouncement();

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(announcementSchema, {
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
						toast.success("Announcement updated successfully");
					},
				}
			);
		} else {
			createAnnouncement(formattedData, {
				onSuccess: () => {
					handleCancel();
					toast.success("Announcement created successfully");
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
					label="Title"
					placeholder="e.g., Store Closure Notice, Holiday Hours"
					required
					description="The announcement headline"
				/>
				<TextareaField
					name="description"
					label="Description"
					placeholder="e.g., We will be closed on December 25th..."
					required
					description="The full announcement message"
				/>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="start_date"
						label="Start Date"
						type="datetime-local"
						required
						description="When the announcement becomes visible"
					/>
					<TextField
						name="end_date"
						label="End Date"
						type="datetime-local"
						required
						description="When the announcement expires"
					/>
				</div>

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
					{isEditMode ? "Update Announcement" : "Create Announcement"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
