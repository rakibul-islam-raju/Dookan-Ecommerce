import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import {
	useCompleteMetaOAuth,
	useSelectMetaPixel,
	type MetaPixelOption,
} from "@/lib/api/store";
import { AlertTriangle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export function MetaOAuthCallback() {
	const t = useT();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const hasSubmitted = useRef(false);
	const [pixels, setPixels] = useState<MetaPixelOption[]>([]);
	const [callbackError, setCallbackError] = useState<string | null>(null);

	const { mutate: completeMetaOAuth, isPending: isCompleting } =
		useCompleteMetaOAuth();
	const { mutate: selectMetaPixel, isPending: isSelecting } =
		useSelectMetaPixel();

	const initialError = useMemo(() => {
		const error = searchParams.get("error");
		if (error) {
			return (
				searchParams.get("error_description") ||
				t("store.metaOAuth.error.cancelled", "Facebook connection was cancelled.")
			);
		}

		if (!searchParams.get("code") || !searchParams.get("state")) {
			return t(
				"store.metaOAuth.error.missingParams",
				"Missing Facebook authorization details.",
			);
		}

		return null;
	}, [searchParams, t]);

	useEffect(() => {
		if (initialError) return;
		if (hasSubmitted.current) return;
		hasSubmitted.current = true;

		const code = searchParams.get("code") as string;
		const state = searchParams.get("state") as string;

		completeMetaOAuth(
			{ code, state },
			{
				onSuccess: (data) => {
					setPixels(data.pixels);
				},
				onError: () => {
					setCallbackError(
						t(
							"store.metaOAuth.error.loadFailed",
							"Could not load Pixels from Facebook.",
						),
					);
				},
			},
		);
	}, [completeMetaOAuth, initialError, searchParams, t]);

	const handleSelectPixel = (pixel: MetaPixelOption) => {
		selectMetaPixel(pixel.pixel_id, {
			onSuccess: () => {
				toast.success(
					t("store.metaOAuth.selectSuccess", "Meta Pixel connected successfully."),
				);
				navigate("/store/settings?tab=meta");
			},
			onError: () => {
				toast.error(
					t("store.metaOAuth.selectFailed", "Failed to save Meta Pixel."),
				);
			},
		});
	};

	const handleBack = () => {
		navigate("/store/settings?tab=meta");
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={handleBack}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="store.metaOAuth.title" defaultMessage="Connect Meta Pixel" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="store.metaOAuth.description"
							defaultMessage="Choose an existing Facebook Pixel to connect to your storefront."
						/>
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						<T id="store.metaOAuth.cardTitle" defaultMessage="Available Pixels" />
					</CardTitle>
					<CardDescription>
						<T
							id="store.metaOAuth.cardDescription"
							defaultMessage="The CAPI access token is still configured manually in Site Settings."
						/>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isCompleting ? (
						<div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin" />
							<T
								id="store.metaOAuth.loading"
								defaultMessage="Loading Pixels from Facebook..."
							/>
						</div>
					) : initialError || callbackError ? (
						<div className="flex flex-col items-center gap-4 py-12 text-center">
							<AlertTriangle className="h-10 w-10 text-destructive" />
							<div>
								<p className="font-medium">
									<T
										id="store.metaOAuth.errorTitle"
										defaultMessage="Connection failed"
									/>
								</p>
								<p className="text-sm text-muted-foreground">
									{initialError || callbackError}
								</p>
							</div>
							<Button onClick={handleBack}>
								<T
									id="store.metaOAuth.backToSettings"
									defaultMessage="Back to Site Settings"
								/>
							</Button>
						</div>
					) : pixels.length === 0 ? (
						<div className="flex flex-col items-center gap-4 py-12 text-center">
							<p className="font-medium">
								<T
									id="store.metaOAuth.emptyTitle"
									defaultMessage="No Pixels found"
								/>
							</p>
							<p className="max-w-md text-sm text-muted-foreground">
								<T
									id="store.metaOAuth.emptyDescription"
									defaultMessage="No existing Pixels were available for this Facebook account. Create a Pixel in Meta Events Manager, then try again."
								/>
							</p>
							<Button onClick={handleBack}>
								<T
									id="store.metaOAuth.backToSettings"
									defaultMessage="Back to Site Settings"
								/>
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<T id="store.metaOAuth.table.pixel" defaultMessage="Pixel" />
									</TableHead>
									<TableHead>
										<T
											id="store.metaOAuth.table.adAccount"
											defaultMessage="Ad Account"
										/>
									</TableHead>
									<TableHead>
										<T
											id="store.metaOAuth.table.business"
											defaultMessage="Business"
										/>
									</TableHead>
									<TableHead className="text-right">
										<T id="store.common.actions" defaultMessage="Actions" />
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pixels.map((pixel) => (
									<TableRow key={`${pixel.ad_account_id}-${pixel.pixel_id}`}>
										<TableCell>
											<div className="font-medium">{pixel.pixel_name}</div>
											<div className="font-mono text-xs text-muted-foreground">
												{pixel.pixel_id}
											</div>
										</TableCell>
										<TableCell>
											<div>{pixel.ad_account_name}</div>
											<div className="font-mono text-xs text-muted-foreground">
												{pixel.ad_account_id}
											</div>
										</TableCell>
										<TableCell>
											{pixel.business_name || (
												<span className="text-muted-foreground">
													<T id="store.common.empty" defaultMessage="-" />
												</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Button
												type="button"
												onClick={() => handleSelectPixel(pixel)}
												disabled={isSelecting}
											>
												{isSelecting ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Check className="h-4 w-4" />
												)}
												<T
													id="store.metaOAuth.usePixel"
													defaultMessage="Use this Pixel"
												/>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
