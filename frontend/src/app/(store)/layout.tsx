import { AnnouncementBar } from "@/components/AnnouncementBar/AnnouncementBar";
import { Footer } from "@/components/StoreFooter/Footer";
import { Header } from "@/components/StoreHeader/Header";
import { store } from "@/config/store";
import type { Metadata } from "next";
import { AuthInitializer } from "./_components/AuthInitializer";

export const metadata: Metadata = {
	title: store.title,
	description: store.description,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<AnnouncementBar />
			<Header />
			<main className="min-h-[calc(100vh-94px)]">{children}</main>
			<Footer />
			<AuthInitializer />
		</>
	);
}
