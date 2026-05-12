import type { MetadataRoute } from "next";
import { store } from "@/config/store";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/admin/"],
		},
		sitemap: `${store.url}/sitemap.xml`,
		host: store.url,
	};
}
