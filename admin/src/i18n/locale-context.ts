import { createContext, useContext } from "react";

import type { AppLocale } from "@/i18n/messages";

interface LocaleContextValue {
	locale: AppLocale;
	setLocale: (locale: AppLocale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
	const context = useContext(LocaleContext);

	if (!context) {
		throw new Error("useLocale must be used within AppIntlProvider");
	}

	return context;
}
