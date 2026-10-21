import { Link } from "react-router-dom";
import { useLocale } from "../hooks/UseLocale";

const ProductCard = ({ product, onDelete }) => {
  const { language } = useLocale();
  const ar = language === "ar";
  const outOfStock = product.stock <= 0;
  const price = new Intl.NumberFormat(ar ? "ar-EG" : "en-EG", { style: "currency", currency: "EGP" }).format(Number(product.price) || 0);
  return (
    <article className="card h-100 product-card border-0 fade-in">
      <Link className="product-image-link" to={`/products/${product._id}`} aria-label={`${ar ? "عرض" : "View"} ${product.name}`}>
        <img
          src={product.image}
          alt={product.name}
          className="card-img-top product-img"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/product-placeholder.svg";
          }}
        />
        <span className={`product-stock-flag ${outOfStock ? "sold-out" : ""}`}>
          {outOfStock ? (ar ? "نفد المخزون" : "Sold out") : (ar ? "وصل حديثًا" : "JUST IN")}
        </span>
      </Link>
      <div className="card-body d-flex flex-column">
        <small className="product-category-label">
          {product.category?.name || (ar ? "التشكيلة" : "Collection")} · {product.brand}
        </small>
        <h5 className="card-title mt-2">{product.name}</h5>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="product-price">{price}</span>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="small text-muted">{ar ? "كمية محدودة" : "Low stock"}</span>
          )}
        </div>
        {onDelete && (
          <button type="button" className="btn btn-outline-danger w-100 mt-2" onClick={() => onDelete(product)}>
            {ar ? "حذف" : "Delete"}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
