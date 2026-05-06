import type { IPaginatedResponse } from "@/@types/Common.type";
import type {
	IBatchFilter,
	IFinishedGoodsReceipt,
	IFinishedGoodsReceiptCreateData,
	IMaterial,
	IMaterialCreateData,
	IMaterialFilter,
	IMaterialTransaction,
	IMaterialTransactionCreateData,
	IMaterialUpdateData,
	IProductionBatch,
	IProductionBatchCreateData,
	IProductionBatchUpdateData,
	IReceiptFilter,
	IVariantStockTransaction,
} from "@/@types/Inventory";
import { queryKeys } from "@/constants/queryKeys";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "./axios";

export type {
	IBatchFilter,
	IFinishedGoodsReceipt,
	IFinishedGoodsReceiptCreateData,
	IMaterial,
	IMaterialCreateData,
	IMaterialFilter,
	IMaterialTransaction,
	IMaterialTransactionCreateData,
	IMaterialUpdateData,
	IProductionBatch,
	IProductionBatchCreateData,
	IProductionBatchUpdateData,
	IReceiptFilter,
	IVariantStockTransaction,
} from "@/@types/Inventory";

export const materialApi = {
	async list(params: IMaterialFilter): Promise<IPaginatedResponse<IMaterial>> {
		const { data } = await clientApi.get<IPaginatedResponse<IMaterial>>(
			"/inventory/materials/",
			{ params }
		);
		return data;
	},

	async get(id: string): Promise<IMaterial> {
		const { data } = await clientApi.get<IMaterial>(`/inventory/materials/${id}/`);
		return data;
	},

	async create(payload: IMaterialCreateData): Promise<IMaterial> {
		const { data } = await clientApi.post<IMaterial>("/inventory/materials/", payload);
		return data;
	},

	async update(id: string, payload: IMaterialUpdateData): Promise<IMaterial> {
		const { data } = await clientApi.patch<IMaterial>(`/inventory/materials/${id}/`, payload);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/inventory/materials/${id}/`);
	},
};

export const materialTransactionApi = {
	async list(params?: { material?: string; limit?: number; offset?: number }): Promise<IPaginatedResponse<IMaterialTransaction>> {
		const { data } = await clientApi.get<IPaginatedResponse<IMaterialTransaction>>(
			"/inventory/material-transactions/",
			{ params }
		);
		return data;
	},

	async create(payload: IMaterialTransactionCreateData): Promise<IMaterialTransaction> {
		const { data } = await clientApi.post<IMaterialTransaction>(
			"/inventory/material-transactions/",
			payload
		);
		return data;
	},
};

export const batchApi = {
	async list(params: IBatchFilter): Promise<IPaginatedResponse<IProductionBatch>> {
		const { data } = await clientApi.get<IPaginatedResponse<IProductionBatch>>(
			"/inventory/batches/",
			{ params }
		);
		return data;
	},

	async get(id: string): Promise<IProductionBatch> {
		const { data } = await clientApi.get<IProductionBatch>(`/inventory/batches/${id}/`);
		return data;
	},

	async create(payload: IProductionBatchCreateData): Promise<IProductionBatch> {
		const { data } = await clientApi.post<IProductionBatch>("/inventory/batches/", payload);
		return data;
	},

	async update(id: string, payload: IProductionBatchUpdateData): Promise<IProductionBatch> {
		const { data } = await clientApi.patch<IProductionBatch>(
			`/inventory/batches/${id}/`,
			payload
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/inventory/batches/${id}/`);
	},

	async complete(id: string): Promise<IProductionBatch> {
		const { data } = await clientApi.post<IProductionBatch>(
			`/inventory/batches/${id}/complete/`
		);
		return data;
	},
};

export const receiptApi = {
	async list(params: IReceiptFilter): Promise<IPaginatedResponse<IFinishedGoodsReceipt>> {
		const { data } = await clientApi.get<IPaginatedResponse<IFinishedGoodsReceipt>>(
			"/inventory/receipts/",
			{ params }
		);
		return data;
	},

	async get(id: string): Promise<IFinishedGoodsReceipt> {
		const { data } = await clientApi.get<IFinishedGoodsReceipt>(`/inventory/receipts/${id}/`);
		return data;
	},

	async create(payload: IFinishedGoodsReceiptCreateData): Promise<IFinishedGoodsReceipt> {
		const { data } = await clientApi.post<IFinishedGoodsReceipt>(
			"/inventory/receipts/",
			payload
		);
		return data;
	},
};

export const variantTransactionApi = {
	async list(params?: { variant?: string; limit?: number; offset?: number }): Promise<IPaginatedResponse<IVariantStockTransaction>> {
		const { data } = await clientApi.get<IPaginatedResponse<IVariantStockTransaction>>(
			"/inventory/variant-transactions/",
			{ params }
		);
		return data;
	},
};

// Query options
export const getMaterials = (params: IMaterialFilter) =>
	queryOptions({
		queryKey: [queryKeys.materials, { params }],
		queryFn: () => materialApi.list(params),
	});

export const getMaterial = (id: string) =>
	queryOptions({
		queryKey: [queryKeys.materials, id],
		queryFn: () => materialApi.get(id),
		enabled: !!id,
	});

export const getMaterialTransactions = (materialId?: string, params?: { limit?: number; offset?: number }) =>
	queryOptions({
		queryKey: [queryKeys.materialTransactions, materialId, params],
		queryFn: () => materialTransactionApi.list({ material: materialId, ...params }),
	});

export const getBatches = (params: IBatchFilter) =>
	queryOptions({
		queryKey: [queryKeys.batches, { params }],
		queryFn: () => batchApi.list(params),
	});

export const getBatch = (id: string) =>
	queryOptions({
		queryKey: [queryKeys.batches, id],
		queryFn: () => batchApi.get(id),
		enabled: !!id,
	});

export const getReceipts = (params: IReceiptFilter) =>
	queryOptions({
		queryKey: [queryKeys.receipts, { params }],
		queryFn: () => receiptApi.list(params),
	});

export const getVariantTransactions = (variantId?: string, params?: { limit?: number; offset?: number }) =>
	queryOptions({
		queryKey: [queryKeys.variantTransactions, variantId, params],
		queryFn: () => variantTransactionApi.list({ variant: variantId, ...params }),
	});

// Mutations
export const useCreateMaterial = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IMaterialCreateData) => materialApi.create(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.materials] }),
	});
};

export const useUpdateMaterial = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: IMaterialUpdateData }) =>
			materialApi.update(id, data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.materials] }),
	});
};

export const useDeleteMaterial = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => materialApi.delete(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.materials] }),
	});
};

export const useCreateMaterialTransaction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IMaterialTransactionCreateData) => materialTransactionApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.materialTransactions] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.materials] });
		},
	});
};

export const useCreateBatch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IProductionBatchCreateData) => batchApi.create(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.batches] }),
	});
};

export const useUpdateBatch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: IProductionBatchUpdateData }) =>
			batchApi.update(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.batches] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.batches, id] });
		},
	});
};

export const useCompleteBatch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => batchApi.complete(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.batches] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.batches, id] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.variantTransactions] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.materialTransactions] });
		},
	});
};

export const useDeleteBatch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => batchApi.delete(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.batches] }),
	});
};

export const useCreateReceipt = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IFinishedGoodsReceiptCreateData) => receiptApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.receipts] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.variantTransactions] });
		},
	});
};
