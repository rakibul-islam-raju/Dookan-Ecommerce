import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
	const locale = await getLocale();
	redirect(`/${locale}/forgot-password`);
}
