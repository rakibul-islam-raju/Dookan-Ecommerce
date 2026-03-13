/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface BaseModel {
	id: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface IPagination {}

/**
 * Django REST Framework Paginated Response
 */
export interface IPaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export interface ICommonFilter {
	limit?: number;
	offset?: number;
}
