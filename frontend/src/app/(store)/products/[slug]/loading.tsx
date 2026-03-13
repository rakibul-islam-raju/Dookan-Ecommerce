export default function ProductDetailsLoading() {
	return (
		<div className="container py-8 md:py-12">
			{/* Breadcrumb Skeleton */}
			<div className="flex items-center gap-2 mb-8">
				<div className="h-4 w-16 bg-muted animate-pulse rounded" />
				<span className="text-muted-foreground">/</span>
				<div className="h-4 w-24 bg-muted animate-pulse rounded" />
				<span className="text-muted-foreground">/</span>
				<div className="h-4 w-48 bg-muted animate-pulse rounded" />
			</div>

			<div className="grid md:grid-cols-2 gap-8 lg:gap-12">
				{/* Image Skeleton */}
				<div className="space-y-4">
					<div className="aspect-square bg-muted animate-pulse rounded-xl" />
					<div className="grid grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="aspect-square bg-muted animate-pulse rounded-lg"
							/>
						))}
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="flex flex-col space-y-6">
					<div className="space-y-4">
						<div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
						<div className="flex gap-4">
							<div className="h-6 w-24 bg-muted animate-pulse rounded" />
							<div className="h-6 w-20 bg-muted animate-pulse rounded" />
						</div>
						<div className="h-8 w-32 bg-muted animate-pulse rounded" />
						<div className="space-y-2">
							<div className="h-4 w-full bg-muted animate-pulse rounded" />
							<div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
						</div>
					</div>

					<div className="h-px bg-border" />

					<div className="space-y-6">
						<div className="flex items-center gap-4">
							<div className="h-12 w-32 bg-muted animate-pulse rounded-md" />
							<div className="h-4 w-24 bg-muted animate-pulse rounded" />
						</div>
						<div className="flex gap-4">
							<div className="h-12 flex-1 bg-muted animate-pulse rounded" />
							<div className="h-12 w-12 bg-muted animate-pulse rounded" />
							<div className="h-12 w-12 bg-muted animate-pulse rounded" />
						</div>
					</div>

					<div className="pt-8">
						<div className="bg-muted/30 rounded-xl p-6 space-y-4">
							<div className="h-6 w-32 bg-muted animate-pulse rounded" />
							<div className="space-y-2">
								<div className="h-4 w-full bg-muted animate-pulse rounded" />
								<div className="h-4 w-full bg-muted animate-pulse rounded" />
								<div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

