/**
 * SiteConfig Provider
 * Provides site configuration data to all components via context
 * Accepts initialConfig fetched server-side for ISR, no client fetch needed
 */

"use client";

import type { ISiteConfig } from "@/@types/Store";
import { createContext, useContext, type ReactNode } from "react";

interface SiteConfigContextType {
	config: ISiteConfig | undefined;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(
	undefined
);

interface SiteConfigProviderProps {
	children: ReactNode;
	initialConfig: ISiteConfig;
}

export function SiteConfigProvider({ children, initialConfig }: SiteConfigProviderProps) {
	return (
		<SiteConfigContext.Provider value={{ config: initialConfig }}>
			{children}
		</SiteConfigContext.Provider>
	);
}

/**
 * Hook to access site configuration
 * Must be used within SiteConfigProvider
 */
export function useSiteConfigContext() {
	const context = useContext(SiteConfigContext);
	if (context === undefined) {
		throw new Error(
			"useSiteConfigContext must be used within a SiteConfigProvider"
		);
	}
	return context;
}
