"use client";

import { useAnnouncements } from "@/lib/hooks/useStore";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Megaphone, X } from "lucide-react";
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
	const [visibleOnScroll, setVisibleOnScroll] = useState(true);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastScrollYRef = useRef(0);
	const frameRef = useRef<number | null>(null);

	const items = announcements ?? [];
	const count = items.length;
	const activeIndex = count > 0 ? Math.min(index, count - 1) : 0;

	const goTo = (next: number) => {
		if (fading || count <= 1 || next === activeIndex) return;
		setFading(true);
		timeoutRef.current = setTimeout(() => {
			setIndex(next);
			setFading(false);
		}, 220);
	};

	const prev = () => goTo((activeIndex - 1 + count) % count);
	const next = () => goTo((activeIndex + 1) % count);

	useEffect(() => {
		if (count <= 1 || paused || dismissed) return;
		const interval = setInterval(() => {
			setFading(true);
			timeoutRef.current = setTimeout(() => {
				setIndex((current) => (current + 1) % count);
				setFading(false);
			}, 220);
		}, ROTATE_MS);
		return () => {
			clearInterval(interval);
		};
	}, [count, paused, dismissed]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		lastScrollYRef.current = window.scrollY;

		const handleScroll = () => {
			if (frameRef.current !== null) return;

			frameRef.current = window.requestAnimationFrame(() => {
				const currentScrollY = window.scrollY;
				const scrollingDown = currentScrollY > lastScrollYRef.current;
				const scrolledPastBar = currentScrollY > 24;

				setVisibleOnScroll(!scrollingDown || !scrolledPastBar);
				lastScrollYRef.current = Math.max(currentScrollY, 0);
				frameRef.current = null;
			});
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (frameRef.current !== null) {
				window.cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	const handleDismiss = () => {
		if (typeof window !== "undefined") {
			sessionStorage.setItem(DISMISS_KEY, "1");
		}
		setDismissed(true);
	};

	if (dismissed || count === 0) return null;

	const current = items[activeIndex];

	return (
		<div
			className={cn(
				"relative overflow-hidden border-b bg-foreground text-background transition-[max-height,opacity,transform,border-color] duration-300 ease-out",
				visibleOnScroll
					? "max-h-14 translate-y-0 border-white/10 opacity-100"
					: "max-h-0 -translate-y-full border-transparent opacity-0"
			)}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,63,94,.32),transparent_38%,rgba(255,255,255,.08))]" />
			<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent" />

			<div className="container relative flex min-h-11 items-center justify-center gap-3 px-12 py-2 sm:min-h-10">
				{count > 1 && (
					<button
						onClick={prev}
						aria-label="Previous announcement"
						className="absolute left-3 flex size-7 items-center justify-center rounded-[8px] text-background/65 transition-all duration-200 hover:bg-background/10 hover:text-background"
					>
						<ChevronLeft className="size-4" />
					</button>
				)}

				<div
					aria-live="polite"
					className={cn(
						"flex min-w-0 items-center justify-center gap-2 text-center text-[13px] leading-5 transition-all duration-200",
						fading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
					)}
				>
					<span className="hidden size-6 shrink-0 items-center justify-center rounded-[8px] bg-background/12 text-background sm:flex">
						<Megaphone className="size-3.5" />
					</span>
					{current.description && (
						<span className="hidden rounded-[8px] bg-background px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground sm:inline-flex">
							New
						</span>
					)}
					<span className="truncate font-semibold tracking-normal">
						{current.title}
					</span>
					{current.description && (
						<>
							<span className="hidden h-3 w-px rounded-full bg-background/30 sm:block" />
							<span className="hidden max-w-xl truncate text-background/75 sm:block">
								{current.description}
							</span>
						</>
					)}
				</div>

				{count > 1 && (
					<button
						onClick={next}
						aria-label="Next announcement"
						className="absolute right-10 flex size-7 items-center justify-center rounded-[8px] text-background/65 transition-all duration-200 hover:bg-background/10 hover:text-background"
					>
						<ChevronRight className="size-4" />
					</button>
				)}

				{count > 1 && (
					<div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 sm:hidden">
						{items.map((_, i) => (
							<button
								key={i}
								aria-label={`Go to announcement ${i + 1}`}
								onClick={() => goTo(i)}
								className={cn(
									"h-1 rounded-full bg-background transition-all duration-300",
									i === activeIndex ? "w-3" : "w-1 opacity-35"
								)}
							/>
						))}
					</div>
				)}

				<button
					onClick={handleDismiss}
					aria-label="Dismiss"
					className="absolute right-2 flex size-7 items-center justify-center rounded-[8px] text-background/55 transition-all duration-200 hover:bg-background/10 hover:text-background"
				>
					<X className="size-3.5" />
				</button>
			</div>
		</div>
	);
}
