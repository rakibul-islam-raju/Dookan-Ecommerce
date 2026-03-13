import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { type ReactNode } from "react";

interface FilterDrawerProps {
	trigger?: ReactNode;
	title?: string;
	description?: string;
	children: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function FilterDrawer({
	trigger,
	title = "Filters",
	description = "Apply filters to refine your search",
	children,
	open,
	onOpenChange,
}: FilterDrawerProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						<Filter className="h-4 w-4 mr-2" />
						Filters
					</Button>
				)}
			</SheetTrigger>
			<SheetContent className="w-full sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>

				<div className="p-4 space-y-4">{children}</div>
			</SheetContent>
		</Sheet>
	);
}
