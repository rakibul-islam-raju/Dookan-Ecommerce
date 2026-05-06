export const supportedLocales = ["en", "bn"] as const;

export type AppLocale = (typeof supportedLocales)[number];

type MessageDictionary = Record<string, string>;

export const defaultLocale: AppLocale = "en";
export const localeStorageKey = "admin-locale";

export const messages: Record<AppLocale, MessageDictionary> = {
	en: {
		"app.language": "Language",
		"app.language.en": "EN",
		"app.language.bn": "BN",
		"app.brand.adminDashboard": "Admin Dashboard",
		"app.loading": "Loading",
		"auth.logoAlt": "Dookan logo",
		"auth.login.title": "Login",
		"auth.login.description": "Enter your email below to log in to your account",
		"auth.login.email": "Email",
		"auth.login.password": "Password",
		"auth.login.submit": "Sign in",
		"auth.login.forgotPassword": "Forgot Password?",
		"auth.login.success": "Login successful!",
		"auth.validation.email": "Please enter a valid email address",
		"auth.validation.passwordMin": "Password must be at least 6 characters long",
		"auth.forgotPassword.title": "Forgot Password",
		"auth.forgotPassword.description":
			"Enter your email to receive a password reset OTP",
		"auth.forgotPassword.sendOtp": "Send OTP",
		"auth.forgotPassword.rememberPassword": "Remember your password? Login",
		"auth.forgotPassword.resetTitle": "Reset Password",
		"auth.forgotPassword.resetDescription":
			"Enter the OTP sent to {email} and your new password.",
		"auth.forgotPassword.verificationCode": "Verification Code",
		"auth.forgotPassword.verificationPlaceholder": "Enter 6-digit OTP",
		"auth.forgotPassword.verificationHelp":
			"Check your email for the verification code",
		"auth.forgotPassword.newPassword": "New Password",
		"auth.forgotPassword.newPasswordPlaceholder": "Enter new password",
		"auth.forgotPassword.confirmPassword": "Confirm Password",
		"auth.forgotPassword.confirmPasswordPlaceholder":
			"Confirm new password",
		"auth.forgotPassword.submit": "Reset Password",
		"auth.forgotPassword.changeEmail": "Change email",
		"auth.forgotPassword.resendOtp": "Resend OTP",
		"auth.forgotPassword.otpSent": "OTP sent to your email address.",
		"auth.forgotPassword.otpResent": "OTP resent to your email.",
		"auth.forgotPassword.resetSuccess":
			"Password reset successfully! Please login.",
		"auth.forgotPassword.otpLength": "OTP must be 6 digits",
		"auth.forgotPassword.otpNumbers": "OTP must contain only numbers",
		"auth.forgotPassword.passwordMin":
			"Password must be at least 8 characters",
		"auth.forgotPassword.passwordsMismatch": "Passwords do not match",
		"auth.setPassword.title": "Set Your Password",
		"auth.setPassword.description.invite":
			"Choose a password to finish setting up your admin account.",
		"auth.setPassword.description.manual":
			"Enter the email and code from your invitation, then choose a password.",
		"auth.setPassword.emailDescription":
			"This invite is linked to the email address below.",
		"auth.setPassword.invitationCode": "Invitation Code",
		"auth.setPassword.invitationPlaceholder": "Enter 6-digit code",
		"auth.setPassword.invitationHelp":
			"Use the code from your email if the invite link was not opened directly.",
		"auth.setPassword.newPassword": "New Password",
		"auth.setPassword.newPasswordPlaceholder": "Enter your password",
		"auth.setPassword.confirmPassword": "Confirm Password",
		"auth.setPassword.confirmPasswordPlaceholder": "Confirm your password",
		"auth.setPassword.submit": "Set Password",
		"auth.setPassword.backToLogin": "Back to login",
		"auth.setPassword.requestNewCode": "Request new code",
		"auth.setPassword.success":
			"Password set successfully. You can now log in.",
		"auth.setPassword.resent":
			"A fresh password setup code has been sent to your email.",
		"auth.setPassword.invalidEmail":
			"Enter a valid email before requesting a new code",
		"layout.toggleNavigation": "Toggle navigation menu",
		"layout.toggleUserMenu": "Toggle user menu",
		"layout.account": "My Account",
		"layout.settings": "Settings",
		"layout.support": "Support",
		"layout.logout": "Logout",
		"layout.sidebar.store": "Store",
		"layout.sidebar.operations": "Operations",
		"layout.sidebar.administration": "Administration",
		"layout.nav.dashboard": "Dashboard",
		"layout.nav.products": "Products",
		"layout.nav.orders": "Orders",
		"layout.nav.customers": "Customers",
		"layout.nav.categories": "Categories",
		"layout.nav.variantTypes": "Variant Types",
		"layout.nav.coupons": "Coupons",
		"layout.nav.sales": "Sales",
		"layout.nav.banners": "Banners",
		"layout.nav.announcements": "Announcements",
		"layout.nav.reviews": "Reviews",
		"layout.nav.wishlists": "Wishlists",
		"layout.nav.siteSettings": "Site Settings",
		"layout.nav.staff": "Staff",
		"layout.nav.roles": "Roles",
		"layout.nav.inventory": "Inventory",
		"layout.nav.expenses": "Expenses",
		"passwordField.forgotPassword": "Forgot Password?",
		"passwordField.hidePassword": "Hide password",
		"passwordField.showPassword": "Show password",
	},
	bn: {
		"app.language": "ভাষা",
		"app.language.en": "ইং",
		"app.language.bn": "বাং",
		"app.brand.adminDashboard": "অ্যাডমিন ড্যাশবোর্ড",
		"app.loading": "লোড হচ্ছে",
		"auth.logoAlt": "দোকান লোগো",
		"auth.login.title": "লগইন",
		"auth.login.description":
			"আপনার অ্যাকাউন্টে প্রবেশ করতে নিচে ইমেইল দিন",
		"auth.login.email": "ইমেইল",
		"auth.login.password": "পাসওয়ার্ড",
		"auth.login.submit": "সাইন ইন",
		"auth.login.forgotPassword": "পাসওয়ার্ড ভুলে গেছেন?",
		"auth.login.success": "লগইন সফল হয়েছে!",
		"auth.validation.email": "একটি সঠিক ইমেইল ঠিকানা লিখুন",
		"auth.validation.passwordMin": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
		"auth.forgotPassword.title": "পাসওয়ার্ড ভুলে গেছেন",
		"auth.forgotPassword.description":
			"পাসওয়ার্ড রিসেট OTP পেতে আপনার ইমেইল দিন",
		"auth.forgotPassword.sendOtp": "OTP পাঠান",
		"auth.forgotPassword.rememberPassword":
			"পাসওয়ার্ড মনে আছে? লগইন করুন",
		"auth.forgotPassword.resetTitle": "পাসওয়ার্ড রিসেট করুন",
		"auth.forgotPassword.resetDescription":
			"{email} এ পাঠানো OTP এবং আপনার নতুন পাসওয়ার্ড লিখুন।",
		"auth.forgotPassword.verificationCode": "যাচাইকরণ কোড",
		"auth.forgotPassword.verificationPlaceholder": "৬ সংখ্যার OTP লিখুন",
		"auth.forgotPassword.verificationHelp":
			"যাচাইকরণ কোডের জন্য আপনার ইমেইল দেখুন",
		"auth.forgotPassword.newPassword": "নতুন পাসওয়ার্ড",
		"auth.forgotPassword.newPasswordPlaceholder": "নতুন পাসওয়ার্ড লিখুন",
		"auth.forgotPassword.confirmPassword": "পাসওয়ার্ড নিশ্চিত করুন",
		"auth.forgotPassword.confirmPasswordPlaceholder":
			"নতুন পাসওয়ার্ড নিশ্চিত করুন",
		"auth.forgotPassword.submit": "পাসওয়ার্ড রিসেট করুন",
		"auth.forgotPassword.changeEmail": "ইমেইল পরিবর্তন করুন",
		"auth.forgotPassword.resendOtp": "আবার OTP পাঠান",
		"auth.forgotPassword.otpSent": "আপনার ইমেইল ঠিকানায় OTP পাঠানো হয়েছে।",
		"auth.forgotPassword.otpResent": "আপনার ইমেইলে OTP আবার পাঠানো হয়েছে।",
		"auth.forgotPassword.resetSuccess":
			"পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এখন লগইন করুন।",
		"auth.forgotPassword.otpLength": "OTP অবশ্যই ৬ সংখ্যার হতে হবে",
		"auth.forgotPassword.otpNumbers": "OTP-তে শুধু সংখ্যা থাকতে হবে",
		"auth.forgotPassword.passwordMin":
			"পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
		"auth.forgotPassword.passwordsMismatch": "পাসওয়ার্ড দুটো মেলেনি",
		"auth.setPassword.title": "আপনার পাসওয়ার্ড সেট করুন",
		"auth.setPassword.description.invite":
			"আপনার অ্যাডমিন অ্যাকাউন্ট সেটআপ শেষ করতে একটি পাসওয়ার্ড বেছে নিন।",
		"auth.setPassword.description.manual":
			"আমন্ত্রণের ইমেইল ও কোড লিখে একটি পাসওয়ার্ড বেছে নিন।",
		"auth.setPassword.emailDescription":
			"এই আমন্ত্রণটি নিচের ইমেইল ঠিকানার সঙ্গে যুক্ত।",
		"auth.setPassword.invitationCode": "আমন্ত্রণ কোড",
		"auth.setPassword.invitationPlaceholder": "৬ সংখ্যার কোড লিখুন",
		"auth.setPassword.invitationHelp":
			"আমন্ত্রণ লিংক সরাসরি খোলা না হলে ইমেইলে পাওয়া কোড ব্যবহার করুন।",
		"auth.setPassword.newPassword": "নতুন পাসওয়ার্ড",
		"auth.setPassword.newPasswordPlaceholder": "আপনার পাসওয়ার্ড লিখুন",
		"auth.setPassword.confirmPassword": "পাসওয়ার্ড নিশ্চিত করুন",
		"auth.setPassword.confirmPasswordPlaceholder":
			"আপনার পাসওয়ার্ড নিশ্চিত করুন",
		"auth.setPassword.submit": "পাসওয়ার্ড সেট করুন",
		"auth.setPassword.backToLogin": "লগইনে ফিরে যান",
		"auth.setPassword.requestNewCode": "নতুন কোড চাইুন",
		"auth.setPassword.success":
			"পাসওয়ার্ড সফলভাবে সেট হয়েছে। এখন আপনি লগইন করতে পারবেন।",
		"auth.setPassword.resent":
			"আপনার ইমেইলে নতুন পাসওয়ার্ড সেটআপ কোড পাঠানো হয়েছে।",
		"auth.setPassword.invalidEmail":
			"নতুন কোড চাওয়ার আগে একটি সঠিক ইমেইল দিন",
		"layout.toggleNavigation": "নেভিগেশন মেনু টগল করুন",
		"layout.toggleUserMenu": "ইউজার মেনু টগল করুন",
		"layout.account": "আমার অ্যাকাউন্ট",
		"layout.settings": "সেটিংস",
		"layout.support": "সাপোর্ট",
		"layout.logout": "লগআউট",
		"layout.sidebar.store": "স্টোর",
		"layout.sidebar.operations": "অপারেশনস",
		"layout.sidebar.administration": "অ্যাডমিনিস্ট্রেশন",
		"layout.nav.dashboard": "ড্যাশবোর্ড",
		"layout.nav.products": "পণ্য",
		"layout.nav.orders": "অর্ডার",
		"layout.nav.customers": "গ্রাহক",
		"layout.nav.categories": "ক্যাটাগরি",
		"layout.nav.variantTypes": "ভ্যারিয়েন্ট টাইপ",
		"layout.nav.coupons": "কুপন",
		"layout.nav.sales": "সেলস",
		"layout.nav.banners": "ব্যানার",
		"layout.nav.announcements": "ঘোষণা",
		"layout.nav.reviews": "রিভিউ",
		"layout.nav.wishlists": "উইশলিস্ট",
		"layout.nav.siteSettings": "সাইট সেটিংস",
		"layout.nav.staff": "স্টাফ",
		"layout.nav.roles": "রোল",
		"layout.nav.inventory": "ইনভেন্টরি",
		"layout.nav.expenses": "খরচ",
		"passwordField.forgotPassword": "পাসওয়ার্ড ভুলে গেছেন?",
		"passwordField.hidePassword": "পাসওয়ার্ড লুকান",
		"passwordField.showPassword": "পাসওয়ার্ড দেখান",
	},
};
