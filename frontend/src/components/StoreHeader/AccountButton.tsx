import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

export const AccountButton = () => {
	const { user, isAuthenticated, logout } = useAuthStore();

	const handleLogout = () => {
		logout();
		window.location.href = "/"; // Redirect to home after logout
	};

	return (
		<>
			{isAuthenticated ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className="cursor-pointer relative p-2 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							aria-label="View account menu"
						>
							<Avatar className="lg:size-6 size-5">
								<AvatarFallback className="text-xs">
									{user?.first_name?.[0]?.toUpperCase() ||
										user?.email?.[0]?.toUpperCase() ||
										"U"}
								</AvatarFallback>
							</Avatar>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<div className="px-2 py-1.5">
							<p className="text-sm font-medium">
								{user?.first_name && user?.last_name
									? `${user.first_name} ${user.last_name}`
									: user?.email}
							</p>
							<p className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap">
								{user?.email}
							</p>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/profile" className="cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								My Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/orders" className="cursor-pointer">
								<Settings className="mr-2 h-4 w-4" />
								My Orders
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
							<LogOut className="mr-2 h-4 w-4" />
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<Link
					href="/login"
					className="cursor-pointer flex items-center gap-2 group"
				>
					<div className="border rounded-full p-1">
						<User className="lg:size-6 size-5 " />
					</div>
					<div className="hidden lg:block">
						<p className="text-xs text-muted-foreground font-semibold group-hover:text-primary">
							Account
						</p>
						<div className="text-sm font-semibold group-hover:text-primary">
							Sign in / Register
						</div>
					</div>
				</Link>
			)}
		</>
	);
};
