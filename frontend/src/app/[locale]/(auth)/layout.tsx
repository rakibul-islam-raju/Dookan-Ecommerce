import { store } from "@/config/store";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const t = await getTranslations("auth");

	return (
		<div className="min-h-screen grid lg:grid-cols-2">
			<div className="flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 bg-background">
				<div className="w-full max-w-sm space-y-4">
					<Link href="/" className="flex justify-center lg:justify-start">
						<Image
							src="/dookan-logo.jpg"
							alt={store.title}
							width={150}
							height={150}
						/>
					</Link>
					{children}
				</div>
			</div>

			<div className="hidden lg:block relative bg-muted">
				<div className="absolute inset-0 bg-primary/10" />
				<div className="absolute inset-0 flex items-center justify-center text-primary/20">
					<svg
						className="w-full h-full opacity-20"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						<path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
					</svg>
				</div>
				<div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
					<h2 className="text-3xl font-serif font-bold text-foreground mb-4">
						{t("marketingTitle")}
					</h2>
					<p className="text-muted-foreground max-w-md">
						{t("marketingDescription")}
					</p>
				</div>
			</div>
		</div>
	);
}
