"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo, MiniLogo } from "../AppLogo";
import { Input } from "../ui/input";
import { AccountButton } from "./AccountButton";
import { BottomNav } from "./BottomNav";
import { CartDrawerProvider } from "./CartDrawerProvider";
import { CategoryDrawer } from "./CategoryDrawer";
import { CategoryDropdownMenu } from "./CategoryDropdownMenu";
import { HeaderTop } from "./HeaderTop";
import { SearchDropdown } from "./SearchDropdown";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export const Header = () => {
	const router = useRouter();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);

	const [searchText, setSearchText] = useState("");
	const debouncedValue = useDebouncedValue(searchText, 500);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchText.trim()) {
			router.push(`/shop?search=${encodeURIComponent(searchText.trim())}`);
			setShowDropdown(false);
			setIsSearchOpen(false);
		}
	};

	const handleSearchChange = (value: string) => {
		setSearchText(value);
		setShowDropdown(value.length > 0);
	};

	const clearSearch = () => {
		setSearchText("");
		setShowDropdown(false);
	};

	return (
		<>
			<header className="relative z-40 bg-background">
				{/* <div className="hidden md:block">
					<HeaderTop />
				</div> */}

				<div className="container h-[72px] flex justify-between items-center gap-4 lg:gap-6">
					{/* Mobile Menu Trigger & Logo */}
					<div className="flex items-center gap-2 lg:gap-4">
						{/* Mobile Menu Trigger */}
						<div className="lg:hidden">
							<CategoryDrawer />
						</div>

						{/* Logo */}
						<div className="hidden lg:block">
							<AppLogo />
						</div>
						<div className="block lg:hidden">
							<MiniLogo />
						</div>

						{/* Categories - Desktop Only */}
						<div className="hidden lg:block">
							<CategoryDropdownMenu />
						</div>
					</div>

					{/* Desktop Search */}
					<div className="hidden lg:flex lg:flex-1 max-w-xl w-full mx-auto">
						<form onSubmit={handleSearchSubmit} className="relative w-full">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search products..."
								value={searchText}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="pl-10 bg-muted/50 focus-visible:bg-background transition-colors"
							/>
							{searchText && (
								<button
									type="button"
									onClick={clearSearch}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
								>
									<X className="size-4 text-muted-foreground" />
								</button>
							)}
							<SearchDropdown
								searchQuery={debouncedValue}
								isOpen={showDropdown}
								onClose={() => setShowDropdown(false)}
								onNavigate={clearSearch}
							/>
						</form>
					</div>

					{/* Right Actions */}
					<div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
						{/* Mobile Search Toggle */}
						<button
							className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
							onClick={() => setIsSearchOpen(!isSearchOpen)}
							aria-label="Toggle search"
						>
							{isSearchOpen ? (
								<X className="size-5" />
							) : (
								<Search className="size-5" />
							)}
						</button>

						{/* Cart */}
						<CartDrawerProvider />

						{/* Account */}
						<div className="">
							<AccountButton />
						</div>
					</div>
				</div>

				{/* Mobile Search Bar - Expandable */}
				<div
					className={cn(
						"lg:hidden transition-all duration-300 ease-in-out border-b bg-background",
						isSearchOpen
							? "max-h-20 opacity-100"
							: "max-h-0 opacity-0 overflow-hidden",
					)}
				>
					<div className="container py-4">
						<form onSubmit={handleSearchSubmit} className="relative w-full">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search products..."
								value={searchText}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="pl-10 w-full"
								autoFocus={isSearchOpen}
							/>
							{searchText && (
								<button
									type="button"
									onClick={clearSearch}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
								>
									<X className="size-4 text-muted-foreground" />
								</button>
							)}
							<SearchDropdown
								searchQuery={debouncedValue}
								isOpen={showDropdown && isSearchOpen}
								onClose={() => setShowDropdown(false)}
								onNavigate={clearSearch}
							/>
						</form>
					</div>
				</div>
			</header>

			{/* Bottom Navigation for Mobile */}
			<BottomNav />
		</>
	);
};
