"use client";

import type { IBanner } from "@/@types/Store";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

interface BannerCarouselProps {
	banners: IBanner[];
	className?: string;
	autoPlayInterval?: number;
}

export const BannerCarousel = ({
	banners,
	className,
	autoPlayInterval = 5000,
}: BannerCarouselProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const totalBanners = banners.length;

	const goToNext = useCallback(() => {
		if (totalBanners === 0) return;
		setCurrentIndex((prev) => (prev + 1) % totalBanners);
	}, [totalBanners]);

	const goToPrevious = useCallback(() => {
		if (totalBanners === 0) return;
		setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
	}, [totalBanners]);

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	useEffect(() => {
		if (totalBanners <= 1) return;

		const interval = setInterval(goToNext, autoPlayInterval);
		return () => clearInterval(interval);
	}, [goToNext, autoPlayInterval, totalBanners]);

	if (totalBanners === 0) {
		return null;
	}

	return (
		<div className={cn("relative w-full overflow-hidden", className)}>
			{/* Slides Container */}
			<div
				className="flex transition-transform duration-500 ease-in-out"
				style={{ transform: `translateX(-${currentIndex * 100}%)` }}
			>
				{banners.map((banner) => (
					<BannerSlide key={banner.id} banner={banner} />
				))}
			</div>

			{/* Navigation Arrows */}
			{totalBanners > 1 && (
				<>
					<Button
						variant="outline"
						size="icon"
						className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm"
						onClick={goToPrevious}
						aria-label="Previous banner"
					>
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm"
						onClick={goToNext}
						aria-label="Next banner"
					>
						<ChevronRight className="h-5 w-5" />
					</Button>
				</>
			)}

			{/* Dot Indicators */}
			{totalBanners > 1 && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
					{banners.map((_, index) => (
						<button
							key={index}
							className={cn(
								"w-3 h-3 rounded-full transition-all",
								index === currentIndex
									? "bg-primary w-6"
									: "bg-background/60 hover:bg-background/80"
							)}
							onClick={() => goToSlide(index)}
							aria-label={`Go to banner ${index + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);
};

interface BannerSlideProps {
	banner: IBanner;
}

const BannerSlide = ({ banner }: BannerSlideProps) => {
	const content = (
		<div className="relative w-full min-w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1]">
			<Image
				src={banner.image}
				alt={banner.title}
				fill
				className="object-cover"
				priority
				unoptimized 
			/>
			{/* Overlay with text */}
			{(banner.title || banner.description) && (
				<div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/20 flex items-center">
					<div className="container px-4 md:px-8">
						<div className="max-w-lg space-y-4">
							{banner.title && (
								<h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
									{banner.title}
								</h2>
							)}
							{banner.description && (
								<p className="text-sm md:text-lg text-white/90">
									{banner.description}
								</p>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);

	if (banner.link) {
		return (
			<Link href={banner.link} className="block w-full min-w-full">
				{content}
			</Link>
		);
	}

	return content;
};

export default BannerCarousel;
