import { Header } from "./Header";

export function FixedStoreHeader() {
	return (
		<div className="sticky top-0 z-50 bg-background shadow-sm">
			<Header />
		</div>
	);
}
