import { useEffect, useState, type ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { LocaleContext } from "@/i18n/locale-context";
import {
	defaultLocale,
	localeStorageKey,
	messages,
	supportedLocales,
	type AppLocale,
} from "@/i18n/messages";

function getInitialLocale(): AppLocale {
	if (typeof window === "undefined") {
		return defaultLocale;
	}

	const savedLocale = window.localStorage.getItem(localeStorageKey);
	if (savedLocale && supportedLocales.includes(savedLocale as AppLocale)) {
		return savedLocale as AppLocale;
	}

	return defaultLocale;
}

interface AppIntlProviderProps {
	children: ReactNode;
}

interface LocaleContextProviderProps {
	children: ReactNode;
	locale: AppLocale;
	setLocale: (locale: AppLocale) => void;
}

export function AppIntlProvider({ children }: AppIntlProviderProps) {
	const [locale, setLocale] = useState<AppLocale>(getInitialLocale);

	useEffect(() => {
		document.documentElement.lang = locale;
		window.localStorage.setItem(localeStorageKey, locale);
	}, [locale]);

	return (
		<IntlProvider
			locale={locale}
			messages={messages[locale]}
			defaultLocale={defaultLocale}
		>
			<LocaleContextProvider locale={locale} setLocale={setLocale}>
				{children}
			</LocaleContextProvider>
		</IntlProvider>
	);
}

function LocaleContextProvider({
	children,
	locale,
	setLocale,
}: LocaleContextProviderProps) {
	return (
		<LocaleContext.Provider value={{ locale, setLocale }}>
			{children}
		</LocaleContext.Provider>
	);
}
