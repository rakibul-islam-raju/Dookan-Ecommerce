/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

type useParamsType = {
	initialParams: {
		[key: string]: any;
	};
};

export const useFilterParams = ({ initialParams }: useParamsType) => {
	const [params, setParams] = useState<{ [key: string]: any }>(initialParams);

	const handleChangeParams = (newParams: { [key: string]: any }) => {
		// Functional update avoids stale state when multiple updates fire quickly
		setParams((prev) => ({ ...prev, ...newParams }));
	};

	const resetParams = () => {
		setParams(initialParams);
	};

	return {
		params,
		handleChangeParams,
		resetParams,
	};
};
