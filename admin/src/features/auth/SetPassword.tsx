import { Navigate } from "react-router-dom";

export function SetPassword() {
	return <Navigate to="/forgot-password" replace />;
}
