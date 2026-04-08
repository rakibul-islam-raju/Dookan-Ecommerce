import { STORE_CACHE_TAGS } from "@/lib/api/store";
import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const secret = req.headers.get("x-revalidate-secret");
	const expectedSecret = process.env.REVALIDATE_SECRET;

	if (!expectedSecret) {
		return Response.json(
			{ ok: false, error: "REVALIDATE_SECRET is not configured" },
			{ status: 500 }
		);
	}

	if (!secret || secret !== expectedSecret) {
		return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
	}

	revalidateTag(STORE_CACHE_TAGS.banners, "default");
	revalidatePath("/", "page");

	return Response.json({ ok: true, revalidated: ["tag:store:banners", "path:/"] });
}

