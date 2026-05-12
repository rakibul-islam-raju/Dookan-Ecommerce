"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useTranslations } from "next-intl";

export const BottomNav = () => {
	const t = useTranslations("common");
	const pathname = usePathname();

	const isActive = (path: string) => pathname === path;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16 px-4 md:hidden">
			<div className="grid grid-cols-4 h-full items-center justify-items-center">
				<Link
					href="/"
					className={cn(
						"flex flex-col items-center gap-1 text-xs font-medium transition-colors",
						isActive("/")
							? "text-primary"
							: "text-muted-foreground hover:text-primary",
					)}
				>
					<Home className="size-5" />
					{t("home")}
				</Link>

				<Link
					href="/shop"
					className={cn(
						"flex flex-col items-center gap-1 text-xs font-medium transition-colors",
						isActive("/shop")
							? "text-primary"
							: "text-muted-foreground hover:text-primary",
					)}
				>
					<LayoutGrid className="size-5" />
					{t("shop")}
				</Link>

					{/* We can reuse CartDrawer trigger here but we might need to customize it to fit the bottom nav style. 
                 For now, let's just wrap it or use a custom trigger if CartDrawer supports it.
                 Looking at CartDrawer, it uses a specific button style. We might need to refactor CartDrawer to accept a custom trigger or just duplicate the logic.
                 For simplicity, I'll link to /cart for now, or I can try to use CartDrawer if I can pass a custom trigger.
                 The CartDrawer in the header uses a specific button. Let's just link to /cart for the bottom nav for now to avoid complexity, 
                 or better yet, let's make a simple Cart link.
              */}
					<Link
						href="/cart"
						className={cn(
							"flex flex-col items-center gap-1 text-xs font-medium transition-colors",
							isActive("/cart")
								? "text-primary"
								: "text-muted-foreground hover:text-primary",
						)}
						>
							<ShoppingCart className="size-5" />
							{t("cart")}
					</Link>

				<Link
					href="/profile"
					className={cn(
						"flex flex-col items-center gap-1 text-xs font-medium transition-colors",
						isActive("/profile")
							? "text-primary"
							: "text-muted-foreground hover:text-primary",
					)}
				>
					<User className="size-5" />
					{t("account")}
				</Link>
			</div>
		</div>
	);
};
