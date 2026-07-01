"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCategories } from "@/lib/hooks/useCategories";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

export const CategorySlider = () => {
	const t = useTranslations("homeCategories");
	const { data: categoriesResponse, isLoading, error } = useCategories();

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: true, align: "start", slidesToScroll: 1 },
		[Autoplay({ delay: 4000, stopOnInteraction: false })]
	);

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	// Filter active top-level categories and sort by display_order
	const filteredCategories = useMemo(() => {
		if (!categoriesResponse?.results) return [];
		return categoriesResponse.results
			.filter((category) => category.is_active && !category.parent)
			.sort((a, b) => a.display_order - b.display_order);
	}, [categoriesResponse]);

	if (isLoading) {
		return (
			<section className="py-16 bg-muted/30">
				<div className="container">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl font-bold font-serif text-foreground">
								{t("title")}
							</h2>
							<p className="text-muted-foreground mt-2">
								{t("description")}
							</p>
						</div>
					</div>
					<div className="text-center py-12">
						<p className="text-muted-foreground">{t("loading")}</p>
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="py-16 bg-muted/30">
				<div className="container">
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							{t("error")}
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 bg-muted/30">
			<div className="container">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h2 className="text-3xl font-bold font-serif text-foreground">
							{t("title")}
						</h2>
						<p className="text-muted-foreground mt-2">
							{t("description")}
						</p>
					</div>
					<div className="hidden md:flex gap-2">
						<Button
							onClick={scrollPrev}
							variant="outline"
							size="icon"
							className="rounded-full"
							aria-label={t("previousSlide")}
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							onClick={scrollNext}
							variant="outline"
							size="icon"
							className="rounded-full"
							aria-label={t("nextSlide")}
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>

				{filteredCategories.length > 0 ? (
					<div className="overflow-hidden" ref={emblaRef}>
						<div className="flex -ml-4 touch-pan-y">
							{filteredCategories.map((category) => (
								<div
									key={category.id}
									className="pl-4 flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_16.66%] xl:flex-[0_0_14.28%] min-w-0"
								>
									<Link
										href={`/shop?category=${category.id}`}
										className="group flex flex-col items-center gap-4"
									>
										<div className="relative w-full aspect-square rounded-2xl bg-card border transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg overflow-hidden">
											<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
											<div className="relative w-full h-full p-6 flex items-center justify-center">
												{category.image ? (
													<Image
														src={category.image}
														alt={category.name}
														className="object-contain transition-transform duration-300 group-hover:scale-110"
														fill
														unoptimized
														sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
													/>
												) : (
													<span className="text-4xl font-bold text-muted-foreground/50">
														{category.name.charAt(0)}
													</span>
												)}
											</div>
										</div>

										<h3 className="text-sm font-medium text-foreground text-center truncate w-full group-hover:text-primary transition-colors">
											{category.name}
										</h3>
									</Link>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							{t("empty")}
						</p>
					</div>
				)}
			</div>
		</section>
	);
};
