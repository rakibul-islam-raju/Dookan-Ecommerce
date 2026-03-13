import { QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./components/@app/AppProvider";
import { queryClient } from "./lib/react-query";

export default function App() {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<AppProvider />
			</QueryClientProvider>
		</>
	);
}
