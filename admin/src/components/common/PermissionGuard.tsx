import type { Permission } from "@/@types/User.type";
import { useAuthStore } from "@/store/useAuthStore";
import { Navigate } from "react-router-dom";

interface PermissionGuardProps {
	permission: Permission;
	children: React.ReactNode;
}

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
	const { hasPermission } = useAuthStore();

	if (!hasPermission(permission)) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}
