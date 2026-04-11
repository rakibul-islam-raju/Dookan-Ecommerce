import { Suspense } from "react";
import { store } from "@/config/store";
import { MetaPixelTracker } from "@/components/integrations/MetaPixelTracker";
import { QueryProvider } from "@/lib/providers/query-provider";
import { SiteConfigProvider } from "@/lib/providers/site-config-provider";
import { storeServerApi } from "@/lib/api";
import ToastProvider from "@/lib/providers/toast-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: store.title,
	description: store.description,
};

// ISR: Revalidate site config every hour
export const revalidate = 3600;

async function getSiteConfig() {
	try {
		return await storeServerApi.getSiteConfig();
	} catch {
		// Return default config if API fails
		return {
			id: "default",
			name: store.title,
			tagline: "",
			description: store.description,
			logo: "",
			favicon: "",
		};
	}
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const siteConfig = await getSiteConfig();

	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<QueryProvider>
					<SiteConfigProvider initialConfig={siteConfig}>
						<Suspense fallback={null}>
							<MetaPixelTracker />
						</Suspense>
						<ToastProvider>{children}</ToastProvider>
					</SiteConfigProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
