import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	onClear?: () => void;
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Search...",
	className = "",
	onClear,
}: SearchBarProps) {
	const handleClear = () => {
		onChange("");
		onClear?.();
	};

	return (
		<div className={`relative ${className}`}>
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="pl-9 pr-9"
			/>
			{value && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClear}
					className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
				>
					<X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
				</Button>
			)}
		</div>
	);
}
