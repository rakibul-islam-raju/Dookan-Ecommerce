import type { AppLocale } from "./routing";

type MetadataCopy = {
	title: string;
	description: string;
	keywords?: string[];
};

type MetadataKey =
	| "home"
	| "shop"
	| "login"
	| "register"
	| "forgotPassword"
	| "verifyEmail"
	| "trackOrder"
	| "maintenance";

const metadataCopy: Record<MetadataKey, Record<AppLocale, MetadataCopy>> = {
	home: {
		en: {
			title: "Dookan",
			description:
				"Dookan is an organic food brand in Bangladesh with premium groceries delivered to your door.",
			keywords: [
				"organic groceries",
				"online shopping Bangladesh",
				"fresh food delivery",
			],
		},
		bn: {
			title: "দোকান",
			description:
				"দোকান বাংলাদেশের একটি অর্গানিক ফুড ব্র্যান্ড, যেখানে প্রিমিয়াম গ্রোসারি আপনার দোরগোড়ায় পৌঁছে যায়।",
			keywords: [
				"অর্গানিক গ্রোসারি",
				"বাংলাদেশ অনলাইন শপিং",
				"ফ্রেশ ফুড ডেলিভারি",
			],
		},
	},
	shop: {
		en: {
			title: "Shop",
			description: "Browse our curated collection of organic products.",
			keywords: ["shop organic products", "buy groceries online"],
		},
		bn: {
			title: "শপ",
			description: "আমাদের বাছাইকৃত অর্গানিক পণ্যের সংগ্রহ দেখুন।",
			keywords: ["অর্গানিক পণ্য কিনুন", "অনলাইনে গ্রোসারি"],
		},
	},
	login: {
		en: {
			title: "Login",
			description: "Sign in to your Dookan account.",
		},
		bn: {
			title: "লগইন",
			description: "আপনার দোকান অ্যাকাউন্টে সাইন ইন করুন।",
		},
	},
	register: {
		en: {
			title: "Register",
			description: "Create a new Dookan account.",
		},
		bn: {
			title: "রেজিস্টার",
			description: "দোকানে নতুন একটি অ্যাকাউন্ট তৈরি করুন।",
		},
	},
	forgotPassword: {
		en: {
			title: "Forgot Password",
			description: "Reset your Dookan account password.",
		},
		bn: {
			title: "পাসওয়ার্ড ভুলে গেছেন",
			description: "আপনার দোকান অ্যাকাউন্টের পাসওয়ার্ড রিসেট করুন।",
		},
	},
	verifyEmail: {
		en: {
			title: "Verify Email",
			description: "Verify your email address to continue.",
		},
		bn: {
			title: "ইমেইল যাচাই",
			description: "এগিয়ে যেতে আপনার ইমেইল ঠিকানা যাচাই করুন।",
		},
	},
	trackOrder: {
		en: {
			title: "Track Order",
			description: "Track your guest orders with email verification.",
		},
		bn: {
			title: "অর্ডার ট্র্যাক করুন",
			description: "ইমেইল যাচাইয়ের মাধ্যমে আপনার গেস্ট অর্ডার ট্র্যাক করুন।",
		},
	},
	maintenance: {
		en: {
			title: "Maintenance",
			description: "The storefront is temporarily under maintenance.",
		},
		bn: {
			title: "রক্ষণাবেক্ষণ",
			description: "স্টোরফ্রন্ট সাময়িকভাবে রক্ষণাবেক্ষণে রয়েছে।",
		},
	},
};

export function getPageMetadataCopy(locale: AppLocale, key: MetadataKey) {
	return metadataCopy[key][locale];
}
