import type { BaseModel } from "./Common.type";

export interface IMaterialCategory extends BaseModel {
	name: string;
	description: string;
}

export interface IMaterial extends BaseModel {
	category: string;
	category_name: string;
	name: string;
	sku: string;
	unit: string;
	reorder_level: string;
	weighted_average_cost: string;
	current_quantity: string;
	is_active: boolean;
}

export interface IMaterialTransaction extends BaseModel {
	material: string;
	material_name: string;
	transaction_type: "purchase" | "adjustment_in" | "adjustment_out" | "issue_to_batch" | "return_from_batch";
	quantity_change: string;
	unit_cost: string | null;
	balance_after: string;
	reference_type: string;
	reference_id: string | null;
	note: string;
}

export interface IBatchMaterial {
	id: string;
	material: string;
	material_name: string;
	planned_quantity: string | null;
	actual_quantity: string;
	actual_unit_cost: string | null;
	total_cost: string;
}

export interface IBatchOutput {
	id: string;
	variant: string;
	product_name: string;
	variant_name: string;
	quantity: number;
	unit_cost: string | null;
	total_cost: string;
}

export interface IProductionBatch extends BaseModel {
	code: string;
	status: "draft" | "in_progress" | "completed" | "cancelled";
	started_at: string | null;
	completed_at: string | null;
	notes: string;
	materials: IBatchMaterial[];
	outputs: IBatchOutput[];
	costing: {
		total_material_cost: string;
		total_output_cost: string;
	} | null;
}

export interface IFinishedGoodsReceipt extends BaseModel {
	variant: string;
	variant_name: string;
	product_name: string;
	supplier_name: string;
	reference: string;
	received_at: string;
	quantity: number;
	supplier_unit_cost: string;
	landed_cost: string;
	unit_cost: string;
	total_cost: string;
	note: string;
}

export interface IVariantStockTransaction extends BaseModel {
	variant: string;
	product_name: string;
	variant_name: string;
	transaction_type:
		| "purchase_receipt"
		| "production_receipt"
		| "adjustment_in"
		| "adjustment_out"
		| "order_sale"
		| "order_cancel_return";
	quantity_change: number;
	unit_cost: string | null;
	balance_after: number;
	reference_type: string;
	reference_id: string | null;
	note: string;
}

export interface IMaterialFilter {
	limit?: number;
	offset?: number;
	search?: string;
	is_active?: boolean;
	category?: string;
}

export interface IBatchFilter {
	limit?: number;
	offset?: number;
	status?: IProductionBatch["status"];
	search?: string;
}

export interface IReceiptFilter {
	limit?: number;
	offset?: number;
	search?: string;
}

export interface IMaterialCreateData {
	category?: string | null;
	name: string;
	sku: string;
	unit: string;
	reorder_level?: number;
	is_active?: boolean;
}

export interface IMaterialUpdateData extends Partial<IMaterialCreateData> {}

export interface IMaterialTransactionCreateData {
	material_id: string;
	transaction_type: "purchase" | "adjustment_in" | "adjustment_out";
	quantity_change: number;
	unit_cost?: number | null;
	note?: string;
}

export interface IProductionBatchMaterialInput {
	material: string;
	planned_quantity?: number | null;
	actual_quantity: number;
}

export interface IProductionBatchOutputInput {
	variant: string;
	quantity: number;
}

export interface IProductionBatchCreateData {
	code: string;
	status?: "draft" | "in_progress";
	started_at?: string | null;
	notes?: string;
	materials: IProductionBatchMaterialInput[];
	outputs: IProductionBatchOutputInput[];
}

export interface IProductionBatchUpdateData
	extends Partial<Omit<IProductionBatchCreateData, "status">> {
	status?: IProductionBatch["status"];
}

export interface IFinishedGoodsReceiptCreateData {
	variant: string;
	supplier_name?: string;
	reference?: string;
	received_at: string;
	quantity: number;
	supplier_unit_cost: number;
	landed_cost?: number;
	note?: string;
}
