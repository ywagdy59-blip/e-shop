import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";

// <ProtectedRoute>          => لازم يكون عامل لوجين
// <ProtectedRoute adminOnly> => لازم يكون أدمن
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
