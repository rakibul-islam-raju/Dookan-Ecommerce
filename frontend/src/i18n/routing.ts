import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "bn"],
	defaultLocale: "bn",
	localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const localeLabels: Record<AppLocale, string> = {
	en: "English",
	bn: "বাংলা",
};

export const localePrefixStrategy = routing.localePrefix;
