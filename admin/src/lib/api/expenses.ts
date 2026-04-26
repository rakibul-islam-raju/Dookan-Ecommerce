import type { IPaginatedResponse } from "@/@types/Common.type";
import type {
	IExpense,
	IExpenseCategory,
	IExpenseCategoryCreateData,
	IExpenseCategoryUpdateData,
	IExpenseCreateData,
	IExpenseFilter,
	IExpenseSummary,
	IExpenseUpdateData,
} from "@/@types/Expense";
import { queryKeys } from "@/constants/queryKeys";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "./axios";

export const expenseCategoryApi = {
	async list(): Promise<IPaginatedResponse<IExpenseCategory>> {
		const { data } = await clientApi.get<IPaginatedResponse<IExpenseCategory>>(
			"/expenses/categories/"
		);
		return data;
	},

	async create(payload: IExpenseCategoryCreateData): Promise<IExpenseCategory> {
		const { data } = await clientApi.post<IExpenseCategory>("/expenses/categories/", payload);
		return data;
	},

	async update(id: string, payload: IExpenseCategoryUpdateData): Promise<IExpenseCategory> {
		const { data } = await clientApi.patch<IExpenseCategory>(
			`/expenses/categories/${id}/`,
			payload
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/expenses/categories/${id}/`);
	},
};

export const expenseApi = {
	async list(params: IExpenseFilter): Promise<IPaginatedResponse<IExpense>> {
		const { data } = await clientApi.get<IPaginatedResponse<IExpense>>("/expenses/entries/", {
			params,
		});
		return data;
	},

	async get(id: string): Promise<IExpense> {
		const { data } = await clientApi.get<IExpense>(`/expenses/entries/${id}/`);
		return data;
	},

	async create(payload: IExpenseCreateData): Promise<IExpense> {
		const { data } = await clientApi.post<IExpense>("/expenses/entries/", payload);
		return data;
	},

	async update(id: string, payload: IExpenseUpdateData): Promise<IExpense> {
		const { data } = await clientApi.patch<IExpense>(`/expenses/entries/${id}/`, payload);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/expenses/entries/${id}/`);
	},

	async getSummary(startDate?: string, endDate?: string): Promise<IExpenseSummary> {
		const { data } = await clientApi.get<IExpenseSummary>("/expenses/reports/summary/", {
			params: { start_date: startDate, end_date: endDate },
		});
		return data;
	},
};

export const getExpenseCategories = () =>
	queryOptions({
		queryKey: [queryKeys.expenseCategories],
		queryFn: () => expenseCategoryApi.list(),
		staleTime: 1000 * 60 * 5,
	});

export const getExpenses = (params: IExpenseFilter) =>
	queryOptions({
		queryKey: [queryKeys.expenses, { params }],
		queryFn: () => expenseApi.list(params),
	});

export const getExpenseSummary = (startDate?: string, endDate?: string) =>
	queryOptions({
		queryKey: [queryKeys.expenseSummary, { startDate, endDate }],
		queryFn: () => expenseApi.getSummary(startDate, endDate),
	});

export const useCreateExpenseCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IExpenseCategoryCreateData) => expenseCategoryApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenseCategories] });
		},
	});
};

export const useUpdateExpenseCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: IExpenseCategoryUpdateData }) =>
			expenseCategoryApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenseCategories] });
		},
	});
};

export const useDeleteExpenseCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => expenseCategoryApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenseCategories] });
		},
	});
};

export const useCreateExpense = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IExpenseCreateData) => expenseApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenses] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenseSummary] });
		},
	});
};

export const useUpdateExpense = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: IExpenseUpdateData }) =>
			expenseApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenses] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenseSummary] });
		},
	});
};

export const useDeleteExpense = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => expenseApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenses] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.expenseSummary] });
		},
	});
};
