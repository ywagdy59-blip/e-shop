import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/CartContext";
import { LocaleProvider } from "./Context/LocaleContext";
import AdminRoute from "./companint/AdminRoute";
import ProtectedRoute from "./companint/ProductRoute";
import NavBar from "./companint/NavBar";
import Footer from "./companint/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Regiester";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ForgotEmail from "./pages/auth/ForgotEmail";
import Products from "./pages/Product/Products";
import ProductDetail from "./pages/Product/ProductsDetalis";
import AddProduct from "./pages/Product/AddProudct";
import EditProduct from "./pages/Product/EditProduct";
import Users from "./pages/users/Users";
import UserDetails from "./pages/users/UserDetailes";
import EditUsers from "./pages/users/EditUser";
import AdminOrders from "./pages/adminorder";
import Cart from "./pages/cart";
import CheckoutSuccess from "./pages/checkoutsucess";
import CheckoutCancel from "./pages/checkoutcancel";
import AdminDashboard from "./pages/AdminDashboard";
import MyOrders from "./pages/myorder";
import { useLocale } from "./hooks/UseLocale";

const StoreLayout = () => {
  const { dir } = useLocale();
  return (
    <div className="min-vh-100 d-flex flex-column" dir={dir}>
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <LocaleProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/forgot-email" element={<ForgotEmail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
              <Route path="/users/:id/edit" element={<ProtectedRoute><EditUsers /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/products/new" element={<AdminRoute><AddProduct /></AdminRoute>} />
              <Route path="/products/:id/edit" element={<AdminRoute><EditProduct /></AdminRoute>} />
              <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </LocaleProvider>
  </BrowserRouter>
);

export default App;
