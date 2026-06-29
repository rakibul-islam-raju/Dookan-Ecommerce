import { STORE_CACHE_TAGS } from "@/lib/api/store";
import { routing } from "@/i18n/routing";
import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
	"http://localhost:5173",
	"http://127.0.0.1:5173",
];

function getAllowedOrigins() {
	return (
		process.env.REVALIDATE_ALLOWED_ORIGINS?.split(",")
			.map((origin) => origin.trim())
			.filter(Boolean) ?? DEFAULT_ALLOWED_ORIGINS
	);
}

function getCorsHeaders(req: NextRequest) {
	const origin = req.headers.get("origin");
	const allowedOrigins = getAllowedOrigins();
	const allowedOrigin =
		origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

	return {
		"Access-Control-Allow-Origin": allowedOrigin,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "X-Revalidate-Secret, Content-Type",
		"Access-Control-Max-Age": "86400",
		Vary: "Origin",
	};
}

export async function OPTIONS(req: NextRequest) {
	return new Response(null, {
		status: 204,
		headers: getCorsHeaders(req),
	});
}

export async function POST(req: NextRequest) {
	const corsHeaders = getCorsHeaders(req);
	const secret = req.headers.get("x-revalidate-secret");
	const expectedSecret = process.env.REVALIDATE_SECRET;

	if (!expectedSecret) {
		return Response.json(
			{ ok: false, error: "REVALIDATE_SECRET is not configured" },
			{ status: 500, headers: corsHeaders }
		);
	}

	if (!secret || secret !== expectedSecret) {
		return Response.json(
			{ ok: false, error: "Unauthorized" },
			{ status: 401, headers: corsHeaders }
		);
	}

	revalidateTag(STORE_CACHE_TAGS.banners, "default");
	revalidateTag(STORE_CACHE_TAGS.siteConfig, "default");
	revalidatePath("/", "layout");
	revalidatePath("/", "page");

	for (const locale of routing.locales) {
		revalidatePath(`/${locale}`, "layout");
		revalidatePath(`/${locale}`, "page");
	}

	return Response.json({
		ok: true,
		revalidated: [
			`tag:${STORE_CACHE_TAGS.banners}`,
			`tag:${STORE_CACHE_TAGS.siteConfig}`,
			"layout:/",
			"page:/",
			...routing.locales.flatMap((locale) => [
				`layout:/${locale}`,
				`page:/${locale}`,
			]),
		],
	}, {
		headers: corsHeaders,
	});
}
