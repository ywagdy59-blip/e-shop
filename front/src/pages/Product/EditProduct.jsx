import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../../companint/Loading";
import ProductForm from "../../companint/ProductForm";
import { getProduct, updateProduct } from "../../Services/ClothesServices";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch((e) => setError(e.response?.data?.message || "Could not load product."));
  }, [id]);

  const submit = async (data) => {
    setSaving(true);
    setError("");
    try {
      await updateProduct(id, data);
      navigate(`/products/${id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Could not update product.");
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return error ? (
      <main className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <Link to="/products" className="btn btn-dark mt-3">Back to products</Link>
      </main>
    ) : (
      <Loading message="Loading product..." />
    );
  }

  return (
    <main className="container py-5 flex-grow-1" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 className="h2 mb-4">Edit product</h1>
      <ProductForm
        key={product._id}
        initialProduct={product}
        onSubmit={submit}
        submitLabel="Save changes"
        error={error}
        loading={saving}
      />
    </main>
  );
};

export default EditProduct;
