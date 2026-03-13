export interface ISiteConfig {
	id: string;
	name: string;
	tagline?: string;
	description?: string;
	logo?: string;
	favicon?: string;
	address?: string;
	phone?: string;
	email?: string;
	whatsapp?: string;
	facebook?: string;
	instagram?: string;
	twitter?: string;
	youtube?: string;
	linkedin?: string;
}

export interface IBanner {
	id: string;
	title: string;
	description?: string;
	image: string;
	link?: string;
	is_active: boolean;
	display_order: number;
}
