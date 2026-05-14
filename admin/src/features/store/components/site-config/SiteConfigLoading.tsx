import {
	Card,
	CardContent,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteConfigPageHeader } from "./SiteConfigPageHeader";

export const SiteConfigLoading = () => (
	<div className="space-y-6">
		<SiteConfigPageHeader />
		<Skeleton className="h-10 w-80" />
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-60" />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-10 w-full" />
			</CardContent>
		</Card>
	</div>
);
