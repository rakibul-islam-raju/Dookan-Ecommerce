"use client";

import { useSiteConfigContext } from "@/lib/providers/site-config-provider";
import { initMetaPixel, trackPageView } from "@/lib/meta";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function MetaPixelTracker() {
	const { config } = useSiteConfigContext();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const search = searchParams.toString();
	const metaPixelEnabled = config?.meta_pixel_enabled;
	const metaPixelId = config?.meta_pixel_id;

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
