import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { store } from "@/config/store";
import { useAuthStore } from "@/store/useAuthStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { CircleUser, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useIntl } from "react-intl";

export function Header() {
	const { open, isOpen } = useSidebarStore();
	const { logout } = useAuthStore();
	const intl = useIntl();

	return (
		<header className="sticky top-0 text-foreground flex h-[60px] w-full items-center gap-2 border-b bg-white px-5">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="flex md:hidden"
						onClick={open}
					>
						{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						<span className="sr-only">
							{intl.formatMessage({
								id: "layout.toggleNavigation",
								defaultMessage: "Toggle navigation menu",
							})}
						</span>
					</Button>
					<NavLink to="/" className="flex items-center gap-2 font-semibold">
						<img src="/images/dookan.jpg" alt="Dookan" className="h-14 w-14" />
						<span className="hidden md:block">{store.title}</span>
					</NavLink>
				</div>

				<div className="ml-auto flex items-center gap-3">
					<LanguageSwitcher />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="secondary"
								size="icon"
								className="rounded-full ml-auto"
							>
								<CircleUser className="h-5 w-5" />
								<span className="sr-only">
									{intl.formatMessage({
										id: "layout.toggleUserMenu",
										defaultMessage: "Toggle user menu",
									})}
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>
								{intl.formatMessage({
									id: "layout.account",
									defaultMessage: "My Account",
								})}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								{intl.formatMessage({
									id: "layout.settings",
									defaultMessage: "Settings",
								})}
							</DropdownMenuItem>
							<DropdownMenuItem>
								{intl.formatMessage({
									id: "layout.support",
									defaultMessage: "Support",
								})}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onClick={logout}>
								{intl.formatMessage({
									id: "layout.logout",
									defaultMessage: "Logout",
								})}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
