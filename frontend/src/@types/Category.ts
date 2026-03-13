import { BaseModel } from "./Common";

export interface ICategory extends BaseModel {
	name: string;
	slug: string;
	image: string;
	display_order: number;
}
