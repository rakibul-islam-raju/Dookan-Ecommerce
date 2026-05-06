import { QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./components/@app/AppProvider";
import { AppIntlProvider } from "./components/providers/intl-provider";
import { queryClient } from "./lib/react-query";

export default function App() {
	return (
		<AppIntlProvider>
			<QueryClientProvider client={queryClient}>
				<AppProvider />
			</QueryClientProvider>
		</AppIntlProvider>
	);
}
