import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

import type { AppLocale } from "@/i18n/messages";

interface LanguageSwitcherProps {
	className?: string;
}

const localeOptions: AppLocale[] = ["en", "bn"];

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
	const t = useT();
	const { locale, setLocale } = useLocale();

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1",
				className
			)}
			aria-label={t("app.language", "Language") as string}
		>
			{localeOptions.map((option) => (
				<Button
					key={option}
					type="button"
					variant={locale === option ? "default" : "ghost"}
					size="sm"
					className="h-8 rounded-full px-3 text-xs"
					onClick={() => setLocale(option)}
				>
					<T
						id={`app.language.${option}`}
						defaultMessage={option.toUpperCase()}
					/>
				</Button>
			))}
		</div>
	);
}
