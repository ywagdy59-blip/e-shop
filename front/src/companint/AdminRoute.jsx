import ProtectedRoute from "./ProductRoute";

const AdminRoute = ({ children }) => {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
};

export default AdminRoute;
