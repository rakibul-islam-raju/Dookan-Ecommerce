"use client";

import { useAnnouncements } from "@/lib/hooks/useStore";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DISMISS_KEY = "dookan_announcement_dismissed";
const ROTATE_MS = 4500;

export function AnnouncementBar() {
	const { data: announcements } = useAnnouncements();
	const [dismissed, setDismissed] = useState(
		() => typeof window !== "undefined" && !!sessionStorage.getItem(DISMISS_KEY)
	);
	const [index, setIndex] = useState(0);
	const [fading, setFading] = useState(false);
	const [paused, setPaused] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const items = announcements ?? [];
	const count = items.length;

	const goTo = (next: number) => {
		if (fading || count <= 1) return;
		setFading(true);
		setTimeout(() => {
			setIndex(next);
			setFading(false);
		}, 250);
	};

	const prev = () => goTo((index - 1 + count) % count);
	const next = () => goTo((index + 1) % count);

	useEffect(() => {
		if (count <= 1 || paused || dismissed) return;
		intervalRef.current = setInterval(() => {
			setFading(true);
			setTimeout(() => {
				setIndex((i) => (i + 1) % count);
				setFading(false);
			}, 250);
		}, ROTATE_MS);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [count, paused, dismissed, index]);

	const handleDismiss = () => {
		sessionStorage.setItem(DISMISS_KEY, "1");
		setDismissed(true);
	};

	if (dismissed || count === 0) return null;

	const current = items[index];

	return (
		<div
			className="relative overflow-hidden bg-primary text-primary-foreground"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			{/* Animated shimmer line */}
			<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

			<div className="container relative flex items-center justify-center h-9 px-10">
				{/* Prev */}
				{count > 1 && (
					<button
						onClick={prev}
						aria-label="Previous announcement"
						className="absolute left-3 flex items-center justify-center size-5 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition-all duration-200"
					>
						<ChevronLeft className="size-3.5" />
					</button>
				)}

				{/* Message */}
				<div
					className={cn(
						"flex items-center gap-2 text-[13px] leading-none transition-all duration-250",
						fading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
					)}
				>
					{/* Accent pill */}
					{current.description && (
						<span className="hidden sm:inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
							New
						</span>
					)}
					<span className="font-medium tracking-wide">{current.title}</span>
					{current.description && (
						<>
							<span className="hidden sm:block w-px h-3 bg-white/30 rounded-full" />
							<span className="hidden sm:block text-white/75 font-normal">
								{current.description}
							</span>
						</>
					)}
				</div>

				{/* Next */}
				{count > 1 && (
					<button
						onClick={next}
						aria-label="Next announcement"
						className="absolute right-9 flex items-center justify-center size-5 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition-all duration-200"
					>
						<ChevronRight className="size-3.5" />
					</button>
				)}

				{/* Dot indicators */}
				{count > 1 && (
					<div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-[5px] items-center">
						{items.map((_, i) => (
							<button
								key={i}
								aria-label={`Go to announcement ${i + 1}`}
								onClick={() => goTo(i)}
								className={cn(
									"rounded-full bg-white transition-all duration-300",
									i === index ? "w-3 h-1" : "w-1 h-1 opacity-35"
								)}
							/>
						))}
					</div>
				)}

				{/* Dismiss */}
				<button
					onClick={handleDismiss}
					aria-label="Dismiss"
					className="absolute right-2.5 flex items-center justify-center size-5 rounded-full text-white/50 hover:text-white hover:bg-white/15 transition-all duration-200"
				>
					<X className="size-3" />
				</button>
			</div>
		</div>
	);
}
