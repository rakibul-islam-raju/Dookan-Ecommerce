"use client";

import heroImage from "@/assets/images/slider1.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
	ArrowRight,
	BadgeCheck,
	Clock,
	Leaf,
	ShieldCheck,
	ShoppingBag,
	Truck,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export const Hero = () => {
	const t = useTranslations("homeHero");
	const highlights = [
		{
			icon: Truck,
			label: t("fastDelivery"),
			value: t("fastDeliveryValue"),
		},
		{
			icon: ShieldCheck,
			label: t("trustedQuality"),
			value: t("trustedQualityValue"),
		},
		{
			icon: Leaf,
			label: t("freshPicks"),
			value: t("freshPicksValue"),
		},
	];

	return (
		<section className="relative isolate overflow-hidden bg-background">
			<div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,244,240,.9),transparent_42%),linear-gradient(90deg,transparent,rgba(244,63,94,.08))]" />
			<div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-border" />

			<div className="container py-6 sm:py-8 lg:py-16">
				<div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(440px,1.05fr)] lg:gap-14">
					<div className="order-2 max-w-2xl text-left lg:order-1">
						<div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/15 bg-background/80 px-3 py-2 text-xs font-semibold text-primary shadow-xs backdrop-blur sm:text-sm">
							<BadgeCheck className="size-4" />
							{t("badge")}
						</div>

						<h1 className="mt-4 text-[2.35rem] font-bold leading-[0.98] tracking-tight text-foreground sm:mt-6 sm:text-5xl lg:text-6xl">
							{t("title")}
						</h1>

						<p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-7">
							{t("description")}
						</p>

						<div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
							<Button
								size="lg"
								className="h-11 w-full px-6 text-sm sm:h-12 sm:w-auto sm:px-7 sm:text-base"
								asChild
							>
								<Link href="/shop">
									{t("shopCollection")} <ArrowRight className="size-5" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-11 w-full bg-background/80 px-6 text-sm sm:h-12 sm:w-auto sm:px-7 sm:text-base"
								asChild
							>
								<Link href="/track-order">{t("trackOrder")}</Link>
							</Button>
						</div>

						<div className="mt-6 grid gap-2.5 border-t border-border/70 pt-5 sm:mt-8 sm:grid-cols-3 sm:gap-3 sm:pt-6">
							{highlights.map((item) => (
								<div
									key={item.label}
									className="flex items-center gap-3 rounded-[8px] bg-background/70 p-3 text-left"
								>
									<div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary sm:size-10">
										<item.icon className="size-4 sm:size-5" />
									</div>
									<div className="min-w-0">
										<p className="text-sm font-semibold text-foreground">
											{item.label}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{item.value}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="order-1 relative lg:order-2">
						<div className="absolute -left-4 top-8 hidden h-24 w-24 border-l border-t border-primary/25 lg:block" />
						<div className="absolute -right-4 bottom-8 hidden h-24 w-24 border-b border-r border-primary/25 lg:block" />

						<div className="relative overflow-hidden rounded-[8px] border bg-card shadow-xl">
							<div className="relative aspect-[1/1.03] min-h-[260px] sm:aspect-[4/3] sm:min-h-[320px] lg:aspect-[1.05/1]">
								<Image
									src={heroImage}
									alt={t("imageAlt")}
									fill
									priority
									sizes="(min-width: 1024px) 52vw, 100vw"
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
							</div>

							<div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2 text-white sm:bottom-4 sm:left-4 sm:right-4 sm:gap-3">
								<div className="rounded-[8px] bg-black/35 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
									<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
										{t("todayShelf")}
									</p>
									<p className="mt-1 text-xl font-bold sm:text-2xl">
										{t("todayShelfValue")}
									</p>
								</div>
								<div className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-lg sm:text-sm">
									<Clock className="size-4 text-primary" />
									{t("readyIn")}
								</div>
							</div>
						</div>

						<div className="absolute -top-4 right-3 hidden items-center gap-3 rounded-[8px] border bg-background px-3 py-2.5 shadow-lg md:flex lg:right-5 lg:px-4 lg:py-3">
							<div className="flex size-9 items-center justify-center rounded-[8px] bg-primary text-primary-foreground lg:size-10">
								<ShoppingBag className="size-5" />
							</div>
							<div>
								<p className="text-sm font-bold text-foreground">
									{t("curatedCart")}
								</p>
								<p className="text-xs text-muted-foreground">
									{t("curatedCartValue")}
								</p>
							</div>
						</div>

						<div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-muted-foreground sm:hidden">
							<span className="rounded-[8px] bg-muted px-2 py-2">
								{t("mobileFresh")}
							</span>
							<span className="rounded-[8px] bg-muted px-2 py-2">
								{t("mobileLocal")}
							</span>
							<span className="rounded-[8px] bg-muted px-2 py-2">
								{t("mobileFast")}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
