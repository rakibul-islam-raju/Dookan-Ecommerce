"use client";

import type { IProductVariant, IProductVariantType } from "@/@types/Product";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
	variantTypes: IProductVariantType[];
	variants: IProductVariant[];
	selectedVariant: IProductVariant | null;
	onSelectVariant: (variant: IProductVariant | null) => void;
}

export const VariantSelector = ({
	variantTypes,
	variants,
	selectedVariant,
	onSelectVariant,
}: VariantSelectorProps) => {
	// Track selected option per variant type
	const selectedOptions: Record<string, string> = {};
	if (selectedVariant) {
		for (const opt of selectedVariant.options) {
			selectedOptions[opt.variant_type_id] = opt.id;
		}
	}

	const handleOptionClick = (typeId: string, optionId: string) => {
		const newSelections = { ...selectedOptions, [typeId]: optionId };

		// Find a variant that matches all selected options
		const match = variants.find((v) =>
			Object.entries(newSelections).every(([, selectedOptId]) =>
				v.options.some((o) => o.id === selectedOptId),
			),
		);

		onSelectVariant(match || null);
	};

	// Check if an option is available (has at least one variant with that option)
	const isOptionAvailable = (typeId: string, optionId: string) => {
		// Build test selections: keep all current selections except for this type
		const testSelections = { ...selectedOptions, [typeId]: optionId };
		return variants.some((v) =>
			Object.entries(testSelections).every(([, selectedOptId]) =>
				v.options.some((o) => o.id === selectedOptId),
			),
		);
	};

	return (
		<div className="space-y-4">
			{variantTypes.map((vt) => (
				<div key={vt.id} className="space-y-2">
					<label className="text-sm font-medium text-foreground">
						{vt.name}
					</label>
					<div className="flex flex-wrap gap-2">
						{vt.options.map((option) => {
							const isSelected = selectedOptions[vt.id] === option.id;
							const available = isOptionAvailable(vt.id, option.id);

							return (
								<button
									key={option.id}
									onClick={() => handleOptionClick(vt.id, option.id)}
									disabled={!available}
									className={cn(
										"px-4 py-2 rounded-lg border text-sm font-medium transition-all",
										isSelected
											? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20"
											: available
												? "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
												: "bg-muted/30 text-muted-foreground/50 border-border/50 cursor-not-allowed line-through",
									)}
								>
									{option.value}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};
