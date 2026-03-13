"use client";

import { store } from "@/config/store";
import { useSiteConfigContext } from "@/lib/providers/site-config-provider";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_LOGO = "/dookan-logo.jpg";

export const AppLogo = () => {
	const { config } = useSiteConfigContext();
	const logoSrc = config?.logo || DEFAULT_LOGO;
	const siteName = config?.name || store.title;

	return (
		<Link href={"/"}>
			<Image src={logoSrc} alt={siteName} width={72} height={72} />
		</Link>
	);
};

export const MiniLogo = () => {
	const { config } = useSiteConfigContext();
	const logoSrc = config?.logo || DEFAULT_LOGO;
	const siteName = config?.name || store.title;

	return (
		<Link href={"/"}>
			<Image src={logoSrc} alt={siteName} width={50} height={50} />
		</Link>
	);
};
