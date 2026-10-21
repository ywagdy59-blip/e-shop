import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useLocale } from "../../hooks/UseLocale";
import Loading from "../../companint/Loading";
import ProductCard from "../../companint/ProductCard";
import { deleteProduct, getCategories, getProducts } from "../../Services/ClothesServices";

const Products = () => {
  const { isAdmin } = useAuth();
  const { language } = useLocale();
  const ar = language === "ar";
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    return Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message ||
            (ar ? "تعذر تحميل المنتجات." : "Could not load products."),
        );
      })
      .finally(() => setLoading(false));
  }, [ar]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCategory = searchParams.get("category") || "";
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const categoryId = typeof product.category === "string"
        ? product.category
        : product.category?._id;
      const matchesCategory = !activeCategory || categoryId === activeCategory;
      const matchesSearch = !query || [product.name, product.brand, product.category?.name]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, search]);

  const remove = async (product) => {
    if (!window.confirm(ar ? `حذف ${product.name}؟` : `Delete ${product.name}?`)) return;

    try {
      await deleteProduct(product._id);
      setError("");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (ar ? "تعذر حذف المنتج." : "Could not delete product."),
      );
    }
  };

  return (
    <main className="catalog-page flex-grow-1">
      <header className="catalog-banner">
        <div className="container">
          <p className="section-kicker">{ar ? "اختيارات NOVA" : "THE NOVA EDIT"}</p>
          <h1>{ar ? "قطع تناسب يومك." : "Good things, well worn."}</h1>
          <p>{ar ? "اكتشف قطعك المفضلة الجديدة، مختارة بعناية." : "The pieces you'll keep reaching for, thoughtfully picked for you."}</p>
        </div>
      </header>
      <div className="container py-4 py-lg-5">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4 fade-in">
        <div>
          <p className="section-kicker mb-1">{ar ? "اكتشف التشكيلة" : "MADE FOR YOUR EVERYDAY"}</p>
          <h2 className="h2 mb-0">{ar ? "اختار اللي يعجبك" : "Find your next favourite."}</h2>
        </div>
        {isAdmin && (
          <Link className="btn btn-dark" to="/products/new">
            {ar ? "إضافة منتج" : "Add product"}
          </Link>
        )}
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="catalog-toolbar">
        <div className="catalog-filters" aria-label={ar ? "تصفية حسب التصنيف" : "Filter by category"}>
          <button className={`filter-chip ${!activeCategory ? "active" : ""}`} onClick={() => setSearchParams({})} type="button">{ar ? "الكل" : "Everything"}</button>
          {categories.map((category) => (
            <button
              className={`filter-chip ${activeCategory === category._id ? "active" : ""}`}
              key={category._id}
              onClick={() => setSearchParams({ category: category._id })}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
        <label className="catalog-search">
          <span aria-hidden="true">⌕</span>
          <input aria-label={ar ? "ابحث عن منتج" : "Search products"} onChange={(event) => setSearch(event.target.value)} placeholder={ar ? "ابحث عن قطعة..." : "Search the collection..."} value={search} />
        </label>
      </div>
      {loading ? (
        <div className="text-center py-5"><Loading message={ar ? "جارٍ تحميل المنتجات…" : "Loading products…"} /></div>
      ) : visibleProducts.length ? (
        <>
          <p className="catalog-count">{ar ? `${visibleProducts.length} منتج` : `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`}</p>
          <div className="row g-4">
            {visibleProducts.map((product) => (
              <div className="col-sm-6 col-lg-4 col-xl-3" key={product._id}>
                <ProductCard product={product} onDelete={isAdmin ? remove : undefined} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="catalog-empty">
          <span>✳</span>
          <h2>{ar ? "مفيش منتجات مطابقة" : "Nothing in this edit just yet."}</h2>
          <p>{ar ? "جرّب البحث بكلمة مختلفة أو اعرض كل المنتجات." : "Try a different search or take a look at everything."}</p>
          <button className="btn btn-dark" onClick={() => { setSearch(""); setSearchParams({}); }} type="button">{ar ? "عرض كل المنتجات" : "Show all products"}</button>
        </div>
      )}
      </div>
    </main>
  );
};

export default Products;
