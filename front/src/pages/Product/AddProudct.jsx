import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductForm from "../../companint/ProductForm";
import { createProduct } from "../../Services/ClothesServices";
import { useLocale } from "../../hooks/UseLocale";

const AddProduct = () => {
  const navigate = useNavigate();
  const { language } = useLocale();
  const ar = language === "ar";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (productData) => {
    setError("");
    setLoading(true);
    try {
      const product = await createProduct(productData);
      navigate(`/products/${product._id}`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.errors?.join(" ") ||
          requestError.response?.data?.message ||
          (ar ? "تعذرت إضافة المنتج." : "Could not create product."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5 flex-grow-1" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <Link to="/admin" className="text-decoration-none text-muted small d-inline-block">
          {ar ? "العودة إلى لوحة الأدمن ←" : "← Back to admin"}
        </Link>
        <Link to="/products" className="text-decoration-none text-muted small d-inline-block">
          {ar ? "عرض المتجر" : "View store"}
        </Link>
      </div>
      <section className="card shadow-soft border-0 mt-3">
        <div className="card-body p-4 p-lg-5">
          <h1 className="h2 mb-4">{ar ? "إضافة منتج جديد" : "Add product"}</h1>
          <ProductForm
            onSubmit={handleCreate}
            submitLabel={ar ? "إضافة المنتج" : "Create product"}
            error={error}
            loading={loading}
          />
        </div>
      </section>
    </main>
  );
};

export default AddProduct;
