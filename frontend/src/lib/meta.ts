"use client";

import type { CartItem } from "@/lib/api/cart";
import type { IOrderResponse } from "@/@types/Order";
import type { IConsumerProductDetail } from "@/@types/Product";

type FbqFunction = ((...args: unknown[]) => void) & {
	callMethod?: (...args: unknown[]) => void;
	queue: unknown[];
};

declare global {
	interface Window {
		fbq?: FbqFunction;
		_fbq?: FbqFunction;
	}
}

type MetaEventPayload = Record<string, unknown>;

let initializedPixelId: string | null = null;

function ensureBrowser() {
	return typeof window !== "undefined" && typeof document !== "undefined";
}

export function generateMetaEventId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `meta-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ensureFbqStub() {
	if (!ensureBrowser()) return null;
	if (window.fbq) return window.fbq;

	const fbq = function (...args: unknown[]) {
		(fbq.callMethod || fbq.queue.push).apply(fbq, args);
	} as FbqFunction;

	fbq.queue = [];
	window.fbq = fbq;
	window._fbq = fbq;
	return fbq;
}

export function initMetaPixel(pixelId: string) {
	if (!ensureBrowser() || !pixelId) return;
	if (initializedPixelId === pixelId && window.fbq) return;

	const fbq = ensureFbqStub();
	if (!fbq) return;

	if (!document.querySelector('script[data-meta-pixel="true"]')) {
		const script = document.createElement("script");
		script.async = true;
		script.src = "https://connect.facebook.net/en_US/fbevents.js";
		script.dataset.metaPixel = "true";
		document.head.appendChild(script);
	}

	fbq("init", pixelId);
	initializedPixelId = pixelId;
}

export function trackMetaEvent(
	eventName: string,
	payload?: MetaEventPayload,
	eventId?: string
) {
	if (!ensureBrowser() || !window.fbq) return;
	if (eventId) {
		window.fbq("track", eventName, payload ?? {}, { eventID: eventId });
		return;
	}
	window.fbq("track", eventName, payload ?? {});
}

export function trackPageView() {
	trackMetaEvent("PageView");
}

export function buildMetaContentsFromCart(items: CartItem[]) {
	return items.map((item) => ({
		id: item.product.id,
		quantity: item.quantity,
		item_price: item.variant?.price ?? item.product.price,
	}));
}

export function trackMetaAddToCart(item: {
	productId: string;
	price: number;
	quantity: number;
	currency: string;
}) {
	trackMetaEvent("AddToCart", {
		content_ids: [item.productId],
		contents: [
			{
				id: item.productId,
				quantity: item.quantity,
				item_price: item.price,
			},
		],
		content_type: "product",
		value: item.price * item.quantity,
		currency: item.currency,
		num_items: item.quantity,
	});
}

export function trackMetaViewContent(params: {
	product: IConsumerProductDetail;
	variantId?: string | null;
	price: number;
	currency: string;
}) {
	trackMetaEvent("ViewContent", {
		content_ids: [params.product.id],
		contents: [
			{
				id: params.product.id,
				quantity: 1,
				item_price: params.price,
			},
		],
		content_type: "product",
		value: params.price,
		currency: params.currency,
		num_items: 1,
		variant_id: params.variantId || undefined,
	});
}

export function trackMetaInitiateCheckout(params: {
	items: CartItem[];
	value: number;
	currency: string;
}) {
	trackMetaEvent("InitiateCheckout", {
		content_ids: params.items.map((item) => item.product.id),
		contents: buildMetaContentsFromCart(params.items),
		content_type: "product",
		value: params.value,
		currency: params.currency,
		num_items: params.items.reduce((sum, item) => sum + item.quantity, 0),
	});
}

export function trackMetaPurchase(order: IOrderResponse, currency: string, eventId: string) {
	trackMetaEvent(
		"Purchase",
		{
			content_ids: order.items.map((item) => item.product_details.id),
			contents: order.items.map((item) => ({
				id: item.product_details.id,
				quantity: item.quantity,
				item_price: Number(item.unit_price),
			})),
			content_type: "product",
			value: Number(order.total_amount),
			currency,
			num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
			order_id: order.order_number,
		},
		eventId
	);
}
