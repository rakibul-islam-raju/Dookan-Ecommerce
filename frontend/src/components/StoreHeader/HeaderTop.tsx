import { store } from "@/config/store";
import { Mail, Phone } from "lucide-react";

export const HeaderTop = () => {
	return (
		<div className="bg-primary text-sm font-semibold text-white">
			<div className="container h-[30px] flex items-center justify-between">
				{/* contant number */}
				<div className="flex items-center gap-2">
					<Phone className="size-4" />
					<p>{store.phone}</p>
				</div>

				{/* tagline */}
				<div className="">
					<p>{store.tagline}</p>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Mail className="size-4" />
						<p>{store.email}</p>
					</div>
				</div>
			</div>
		</div>
	);
};
