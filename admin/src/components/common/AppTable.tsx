/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HTMLAttributes, Key } from "react";

type PaginationItem = number | "ellipsis";

function getPaginationItems(
	currentPage: number,
	totalPages: number,
	siblingCount = 1,
): PaginationItem[] {
	const pages: number[] = [];
	for (let i = 1; i <= totalPages; i++) {
		if (
			i === 1 ||
			i === totalPages ||
			(i >= currentPage - siblingCount && i <= currentPage + siblingCount)
		) {
			pages.push(i);
		}
	}

	const items: PaginationItem[] = [];
	let prev: number | undefined;
	for (const page of pages) {
		if (prev !== undefined) {
			if (page - prev === 2) {
				items.push(prev + 1);
			} else if (page - prev > 2) {
				items.push("ellipsis");
			}
		}
		items.push(page);
		prev = page;
	}
	return items;
}

export interface Column<T> {
	key: string;
	header: string;
	render?: (item: T) => React.ReactNode;
	className?: string;
}

interface AppTableProps<T> {
	data: T[];
	columns: Column<T>[];
	isLoading?: boolean;
	emptyMessage?: string;
	pagination?: {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		pageSize?: number;
	};
	onRowClick?: (item: T) => void;
	rowClassName?: (item: T) => string;
	rowKey?: (item: T, index: number) => Key;
	getRowProps?: (
		item: T,
		index: number,
	) => HTMLAttributes<HTMLTableRowElement>;
}

export function AppTable<T extends Record<string, any>>({
	data,
	columns,
	isLoading = false,
	emptyMessage = "No data available",
	pagination,
	onRowClick,
	rowClassName,
	rowKey,
	getRowProps,
}: AppTableProps<T>) {
	const renderCellContent = (item: T, column: Column<T>) => {
		if (column.render) {
			return column.render(item);
		}
		return item[column.key];
	};

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.key} className={column.className}>
									{column.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(5)].map((_, index) => (
							<TableRow key={index}>
								{columns.map((column) => (
									<TableCell key={column.key} className={column.className}>
										<div className="h-4 bg-muted animate-pulse rounded" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.key} className={column.className}>
									{column.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center text-muted-foreground"
							>
								{emptyMessage}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.key} className={column.className}>
									{column.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item, index) => (
							(() => {
								const extraRowProps = getRowProps?.(item, index) ?? {};
								const {
									className: extraClassName,
									onClick: extraOnClick,
									...restRowProps
								} = extraRowProps;

								return (
									<TableRow
										key={rowKey ? rowKey(item, index) : index}
										onClick={(event) => {
											extraOnClick?.(event);
											onRowClick?.(item);
										}}
										className={cn(
											onRowClick ? "cursor-pointer hover:bg-muted/50" : "",
											rowClassName ? rowClassName(item) : "",
											extraClassName,
										)}
										{...restRowProps}
									>
								{columns.map((column) => (
									<TableCell key={column.key} className={column.className}>
										{renderCellContent(item, column)}
									</TableCell>
								))}
									</TableRow>
								);
							})()
						))}
					</TableBody>
				</Table>
			</div>

			{pagination && pagination.totalPages > 1 && (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-muted-foreground">
						Page {pagination.currentPage} of {pagination.totalPages}
					</p>
					<div className="flex flex-wrap items-center justify-end gap-1">
						<Button
							variant="outline"
							size="icon-sm"
							aria-label="Previous page"
							onClick={() =>
								pagination.onPageChange(pagination.currentPage - 1)
							}
							disabled={pagination.currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						{getPaginationItems(
							pagination.currentPage,
							pagination.totalPages,
						).map((item, index) =>
							item === "ellipsis" ? (
								<span
									key={`e-${index}`}
									className="flex h-8 min-w-8 items-center justify-center px-1 text-sm text-muted-foreground"
									aria-hidden
								>
									…
								</span>
							) : item === pagination.currentPage ? (
								<span
									key={item}
									className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2 text-sm font-medium text-primary-foreground"
									aria-current="page"
									aria-label={`Page ${item}`}
								>
									{item}
								</span>
							) : (
								<Button
									key={item}
									variant="ghost"
									size="sm"
									className="min-w-8 px-2"
									aria-label={`Page ${item}`}
									onClick={() => pagination.onPageChange(item)}
								>
									{item}
								</Button>
							),
						)}
						<Button
							variant="outline"
							size="icon-sm"
							aria-label="Next page"
							onClick={() =>
								pagination.onPageChange(pagination.currentPage + 1)
							}
							disabled={pagination.currentPage === pagination.totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
