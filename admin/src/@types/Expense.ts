import type { BaseModel } from "./Common.type";

export interface IExpenseCategory extends BaseModel {
	name: string;
	slug: string;
	description: string;
	is_global: boolean;
}

export interface IExpense extends BaseModel {
	category: string;
	category_name: string;
	amount: string;
	incurred_on: string;
	reference: string;
	notes: string;
	production_batch: string | null;
	batch_code: string | null;
	product_variant: string | null;
	product_name: string | null;
	variant_name: string | null;
}

export interface IExpenseSummary {
	total_expense: string;
	batch_linked_total: string;
	general_total: string;
	by_category: {
		category_id: string;
		category_name: string;
		total: string;
	}[];
}

export interface IExpenseFilter {
	page?: number;
	limit?: number;
	search?: string;
	category?: string;
	start_date?: string;
	end_date?: string;
}

export interface IExpenseCategoryCreateData {
	name: string;
	description?: string;
}

export interface IExpenseCategoryUpdateData extends Partial<IExpenseCategoryCreateData> {}

export interface IExpenseCreateData {
	category: string;
	amount: number;
	incurred_on: string;
	reference?: string;
	notes?: string;
	production_batch?: string | null;
	product_variant?: string | null;
}

export interface IExpenseUpdateData extends Partial<IExpenseCreateData> {}
