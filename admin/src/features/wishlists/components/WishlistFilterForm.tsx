import { DateField } from "@/components/ui/@form/DateField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { WishlistFilter } from "@/@types/Wishlist";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type WishlistFilterFormProps = {
	initialFilter: WishlistFilter;
	onFilter: (filter: WishlistFilter) => void;
	onReset: () => void;
};

export const WishlistFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: WishlistFilterFormProps) => {
	const form = useForm<WishlistFilter>({
		defaultValues: initialFilter,
	});

	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: WishlistFilter) => {
		onFilter({ ...data, offset: 0 });
	};

	const handleResetFilter = () => {
		form.reset(initialFilter);
		onReset();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleUpdateFilter)}>
				<div className="flex h-[calc(100vh-130px)] w-full flex-col items-start justify-between gap-4 overflow-y-auto">
					<div className="w-full space-y-6">
						<DateField<WishlistFilter>
							name="date_from"
							label="Added From"
						/>
						<DateField<WishlistFilter>
							name="date_to"
							label="Added To"
						/>
					</div>

					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button
							type="button"
							onClick={handleResetFilter}
							variant="outline"
						>
							Reset
						</Button>
						<Button type="submit">Apply Filters</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
