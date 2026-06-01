import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
