export interface BaseModel {
	id: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface IPagination {
	limit?: number;
	offset?: number;
	search?: string;
	ordering?: string;
}

/**
 * Django REST Framework Paginated Response
 */
export interface IPaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export interface CreatedBy {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
}
