import { type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "./button";

export const LoadingButton = ({
	isLoading,
	children,
	className,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		isLoading?: boolean;
	}) => {
	return (
		<Button {...props} disabled={isLoading} className={className}>
			{children}
			{isLoading && <Loader2 className="animate-spin" />}
		</Button>
	);
};
