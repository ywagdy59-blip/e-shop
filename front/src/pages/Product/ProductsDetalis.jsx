import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useCart } from "../../hooks/UseCart";
import { useLocale } from "../../hooks/UseLocale";
import Loading from "../../companint/Loading";
import { getProduct } from "../../Services/ClothesServices";

const ProductDetails = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { addItem } = useCart();
  const { language } = useLocale();
  const ar = language === "ar";
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setSize(data.size?.[0] || "");
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load product."));
  }, [id]);

  if (!product && !error) return <Loading message={ar ? "جارٍ تحميل المنتج…" : "Loading product…"} />;
  if (error)
    return (
      <main className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <Link to="/products" className="btn btn-dark mt-3">{ar ? "العودة إلى المنتجات" : "Back to collection"}</Link>
      </main>
    );

  const addToBag = () => {
    addItem(product, size);
    setAdded(true);
  };

  const price = new Intl.NumberFormat(ar ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
  }).format(Number(product.price) || 0);

  return (
    <main className="container py-5 flex-grow-1">
      <Link className="text-muted small" to="/products">
        {ar ? "العودة إلى المنتجات ←" : "← Back to collection"}
      </Link>
      <article className="row g-5 mt-4 fade-in">
        <div className="col-md-6">
          <img
            className="product-detail-image"
            src={product.image}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/product-placeholder.svg";
            }}
          />
        </div>
        <div className="col-md-6">
          <p className="section-kicker">{product.category?.name || (ar ? "التشكيلة" : "Collection")} · {product.brand}</p>
          <h1 className="h2 mb-2">{product.name}</h1>
          <p className="fs-4 fw-bold text-forest mb-3">{price}</p>
          <p className="text-muted mb-4">{product.description}</p>
          <p className="small mb-4">
            <strong>{product.brand}</strong> · {product.color} · {ar ? "رمز المنتج:" : "SKU:"} {product._id}
          </p>
          {product.stock > 0 ? (
            <>
              <label className="form-label fw-bold" htmlFor="product-size">
                {ar ? "اختر المقاس" : "Choose size"}
              </label>
              <select
                id="product-size"
                className="form-select mb-4"
                value={size}
                onChange={(event) => setSize(event.target.value)}
              >
                {product.size?.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <button className="btn btn-dark w-100 mb-3" onClick={addToBag}>
                {ar ? "أضف إلى السلة" : "Add to bag"}
              </button>
              {added && (
                <p className="text-success small mt-2 mb-0 fw-bold">
                  {ar ? "تمت الإضافة إلى سلتك." : "Added to your bag."}{" "}
                  <Link className="text-decoration-underline" to="/cart">
                    {ar ? "عرض السلة" : "View bag"}
                  </Link>
                </p>
              )}
            </>
          ) : (
            <p className="text-danger fw-bold">{ar ? "غير متوفر حاليًا" : "Currently out of stock"}</p>
          )}
          {isAdmin && (
            <Link
              className="btn btn-outline-dark mt-3"
              to={`/products/${product._id}/edit`}
            >
              {ar ? "تعديل المنتج" : "Edit product"}
            </Link>
          )}
        </div>
      </article>
    </main>
  );
};

export default ProductDetails;
