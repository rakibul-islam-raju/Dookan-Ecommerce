import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import { store } from "@/config/store";
import { MetaPixelTracker } from "@/components/integrations/MetaPixelTracker";
import { storeServerApi } from "@/lib/api";
import { QueryProvider } from "@/lib/providers/query-provider";
import { SiteConfigProvider } from "@/lib/providers/site-config-provider";
import ToastProvider from "@/lib/providers/toast-provider";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const notoSansBengali = Noto_Sans_Bengali({
	variable: "--font-noto-sans-bengali",
	subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
	title: store.title,
	description: store.description,
};

// ISR: Revalidate site config every hour
export const revalidate = 3600;

async function getSiteConfig() {
	try {
		return await storeServerApi.getSiteConfigCached();
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
	const locale = await getLocale();
	const messages = await getMessages();
	const siteConfig = await getSiteConfig();

	return (
		<html lang={locale}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${notoSansBengali.variable} antialiased`}
				style={{
					fontFamily:
						locale === "bn"
							? "var(--font-noto-sans-bengali), var(--font-geist-sans), sans-serif"
							: "var(--font-geist-sans), sans-serif",
				}}
			>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<QueryProvider>
						<SiteConfigProvider initialConfig={siteConfig}>
							<Suspense fallback={null}>
								<MetaPixelTracker />
							</Suspense>
							<ToastProvider>{children}</ToastProvider>
						</SiteConfigProvider>
					</QueryProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
