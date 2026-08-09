import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../../services/auth.service";

interface Props {
  children: ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
}
