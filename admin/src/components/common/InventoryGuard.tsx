import { useAuthStore } from "@/store/useAuthStore";
import { Navigate } from "react-router-dom";

interface InventoryGuardProps {
	children: React.ReactNode;
}

export function InventoryGuard({ children }: InventoryGuardProps) {
	const { canAccessInventory } = useAuthStore();

	if (!canAccessInventory()) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}
