"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

interface LocaleSwitcherProps {
	className?: string;
}

export function LocaleSwitcher({
	className,
}: LocaleSwitcherProps) {
	const locale = useLocale() as AppLocale;
	const pathname = usePathname();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const switchLocale = (nextLocale: AppLocale) => {
		if (nextLocale === locale || isPending) return;

		startTransition(() => {
			router.replace(pathname, { locale: nextLocale });
			router.refresh();
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					disabled={isPending}
					className={cn(
						"inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-100 bg-white/90 px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 shadow-sm shadow-rose-100/50 transition-colors hover:border-rose-200 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-70",
						className
					)}
					aria-label={`Current language: ${localeLabels[locale]}`}
				>
					<Languages className="size-3.5 text-rose-500" />
					<span>{locale.toUpperCase()}</span>
					<ChevronDown className="size-3 text-slate-500" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-32 rounded-2xl p-1">
				{routing.locales.map((item) => (
					<DropdownMenuItem
						key={item}
						onClick={() => switchLocale(item)}
						className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium"
					>
						<span>{localeLabels[item]}</span>
						{locale === item ? (
							<Check className="size-4 text-rose-500" />
						) : (
							<span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
								{item}
							</span>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
