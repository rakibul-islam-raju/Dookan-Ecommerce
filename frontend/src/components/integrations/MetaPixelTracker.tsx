"use client";

import { useSiteConfigContext } from "@/lib/providers/site-config-provider";
import { useSiteConfig } from "@/lib/hooks/useStore";
import { initMetaPixel, trackPageView } from "@/lib/meta";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function MetaPixelTracker() {
	const { config } = useSiteConfigContext();
	const { data: latestConfig } = useSiteConfig();
	const resolvedConfig = latestConfig ?? config;
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const search = searchParams.toString();
	const metaPixelEnabled = resolvedConfig?.meta_pixel_enabled;
	const metaPixelId = resolvedConfig?.meta_pixel_id;

	useEffect(() => {
		if (!metaPixelEnabled || !metaPixelId) return;
		initMetaPixel(metaPixelId);
	}, [metaPixelEnabled, metaPixelId]);

	useEffect(() => {
		if (!metaPixelEnabled || !metaPixelId) return;
		trackPageView();
	}, [metaPixelEnabled, metaPixelId, pathname, search]);

	return null;
}
