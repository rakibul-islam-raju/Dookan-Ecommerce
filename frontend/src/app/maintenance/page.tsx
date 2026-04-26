import type { Metadata } from "next";
import { store } from "@/config/store";

export const metadata: Metadata = {
	title: `Temporarily Unavailable — ${store.title}`,
};

export default function MaintenancePage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
			<div className="text-center max-w-md space-y-6">
				<div className="text-6xl font-bold text-muted-foreground/30 select-none">🔧</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">{store.title}</h1>
					<p className="text-muted-foreground">
						We&apos;re temporarily unavailable. Please check back soon.
					</p>
				</div>
				<p className="text-sm text-muted-foreground/60">
					If you have questions, contact us at{" "}
					<a
						href={`mailto:${store.email}`}
						className="underline underline-offset-2 hover:text-foreground transition-colors"
					>
						{store.email}
					</a>
				</p>
			</div>
		</div>
	);
}
