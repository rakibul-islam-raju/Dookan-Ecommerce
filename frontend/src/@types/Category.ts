import { BaseModel } from "./Common";

export interface ICategoryChild {
	id: string;
	name: string;
	slug: string;
	image: string;
	display_order: number;
	is_active: boolean;
}

export interface ICategory extends BaseModel {
	name: string;
	slug: string;
	image: string;
	display_order: number;
	parent?: string | null;
	parent_name?: string | null;
	children?: ICategoryChild[];
}
