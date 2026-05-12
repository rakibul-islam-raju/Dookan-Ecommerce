import { store } from "@/config/store";
import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";

const openGraphLocales: Record<AppLocale, string> = {
	en: "en_US",
	bn: "bn_BD",
};

export function getLocalePath(locale: AppLocale, pathname = "/") {
	if (pathname === "/") {
		return `/${locale}`;
	}

	return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function getAbsoluteLocaleUrl(locale: AppLocale, pathname = "/") {
	return new URL(getLocalePath(locale, pathname), store.url).toString();
}

export function getAlternateLanguageLinks(pathname = "/") {
	return {
		en: getLocalePath("en", pathname),
		bn: getLocalePath("bn", pathname),
		"x-default": getLocalePath("bn", pathname),
	};
}

export function buildLocalizedMetadata({
	locale,
	pathname = "/",
	title,
	description,
	keywords = [],
	images,
	type = "website",
	index = true,
}: {
	locale: AppLocale;
	pathname?: string;
	title: string;
	description: string;
	keywords?: string[];
	images?: { url: string; width?: number; height?: number; alt?: string }[];
	type?: "website" | "article";
	index?: boolean;
}): Metadata {
	const canonicalPath = getLocalePath(locale, pathname);
	const absoluteUrl = getAbsoluteLocaleUrl(locale, pathname);

	return {
		title,
		description,
		keywords,
		authors: [{ name: store.author }],
		creator: store.author,
		publisher: store.author,
		metadataBase: new URL(store.url),
		alternates: {
			canonical: canonicalPath,
			languages: getAlternateLanguageLinks(pathname),
		},
		openGraph: {
			type,
			locale: openGraphLocales[locale],
			alternateLocale: Object.values(openGraphLocales).filter(
				(value) => value !== openGraphLocales[locale],
			),
			url: absoluteUrl,
			title,
			description,
			siteName: store.title,
			images:
				images ??
				[
					{
						url: `${store.url}/og-image.jpg`,
						width: 1200,
						height: 630,
						alt: title,
					},
				],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			creator: store.twitter
				? store.twitter.includes("@")
					? store.twitter
					: `@${store.twitter.split("/").pop()}`
				: undefined,
			images: (images ?? [{ url: `${store.url}/og-image.jpg` }]).map(
				(image) => image.url,
			),
		},
		robots: {
			index,
			follow: true,
			googleBot: {
				index,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
				"max-video-preview": -1,
			},
		},
	};
}

export function getLocalizedRouteList() {
	return [
		"/",
		"/shop",
		"/cart",
		"/checkout",
		"/track-order",
		"/login",
		"/register",
		"/forgot-password",
		"/verify-email",
		"/profile",
		"/orders",
		"/wishlist",
		"/addresses",
	];
}
