"use client";

import heroImage from "@/assets/images/slider1.jpg";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";

const highlights = [
	{
		icon: Truck,
		label: "Fast Delivery",
		value: "Same-day dispatch",
	},
	{
		icon: ShieldCheck,
		label: "Trusted Quality",
		value: "Carefully checked",
	},
	{
		icon: Leaf,
		label: "Fresh Picks",
		value: "Naturally sourced",
	},
];

export const Hero = () => {
	return (
		<section className="relative isolate overflow-hidden bg-background">
			<div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,244,240,.9),transparent_42%),linear-gradient(90deg,transparent,rgba(244,63,94,.08))]" />
			<div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-border" />

			<div className="container py-10 md:py-14 lg:py-16">
				<div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(440px,1.05fr)] lg:gap-14">
					<div className="max-w-2xl text-center lg:text-left">
						<div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/15 bg-background/80 px-3 py-2 text-sm font-semibold text-primary shadow-xs backdrop-blur">
							<BadgeCheck className="size-4" />
							Fresh market essentials, curated daily
						</div>

						<h1 className="mt-6 text-4xl font-bold leading-[1.02] tracking-normal text-foreground sm:text-5xl lg:text-6xl">
							Everyday groceries with a fresher point of view.
						</h1>

						<p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
							Shop crisp produce, pantry favorites, honey, spices, and home
							essentials selected for quality, seasonality, and quick local
							delivery.
						</p>

						<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
							<Button size="lg" className="h-12 px-7 text-base" asChild>
								<Link href="/shop">
									Shop Collection <ArrowRight className="size-5" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-12 px-7 bg-background/80 text-base"
								asChild
							>
								<Link href="/track-order">Track Order</Link>
							</Button>
						</div>

						<div className="mt-8 grid gap-3 border-t border-border/70 pt-6 sm:grid-cols-3">
							{highlights.map((item) => (
								<div
									key={item.label}
									className="flex items-center gap-3 rounded-[8px] bg-background/70 p-3 text-left"
								>
									<div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
										<item.icon className="size-5" />
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

					<div className="relative">
						<div className="absolute -left-4 top-8 hidden h-24 w-24 border-l border-t border-primary/25 lg:block" />
						<div className="absolute -right-4 bottom-8 hidden h-24 w-24 border-b border-r border-primary/25 lg:block" />

						<div className="relative overflow-hidden rounded-[8px] border bg-card shadow-xl">
							<div className="relative aspect-[4/3] min-h-[320px] sm:aspect-[16/10] lg:aspect-[1.05/1]">
								<Image
									src={heroImage}
									alt="Fresh groceries and organic produce"
									fill
									priority
									sizes="(min-width: 1024px) 52vw, 100vw"
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
							</div>

							<div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white">
								<div className="rounded-[8px] bg-black/35 px-4 py-3 backdrop-blur-md">
									<p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
										Today&apos;s shelf
									</p>
									<p className="mt-1 text-2xl font-bold">500+ items</p>
								</div>
								<div className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-sm font-semibold text-foreground shadow-lg">
									<Clock className="size-4 text-primary" />
									Ready in 24h
								</div>
							</div>
						</div>

						<div className="absolute -top-5 right-5 hidden items-center gap-3 rounded-[8px] border bg-background px-4 py-3 shadow-lg sm:flex">
							<div className="flex size-10 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
								<ShoppingBag className="size-5" />
							</div>
							<div>
								<p className="text-sm font-bold text-foreground">Curated cart</p>
								<p className="text-xs text-muted-foreground">
									Seasonal picks updated weekly
								</p>
							</div>
						</div>

						<div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-medium text-muted-foreground sm:hidden">
							<span className="rounded-[8px] bg-muted px-2 py-2">Fresh</span>
							<span className="rounded-[8px] bg-muted px-2 py-2">Local</span>
							<span className="rounded-[8px] bg-muted px-2 py-2">Fast</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
