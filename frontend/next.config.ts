import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "8000",
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
				port: "8000",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
			},
			{
				protocol: "http",
				hostname: "72.61.231.224",
				port: "6060",
			},

			// Add production image domain if configured
			...(process.env.NEXT_PUBLIC_IMAGE_DOMAIN
				? [
						{
							protocol: "https" as const,
							hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN,
						},
				  ]
				: []),
		],
	},
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
