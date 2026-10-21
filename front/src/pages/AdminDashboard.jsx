import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductForm from "../companint/ProductForm";
import Loading from "../companint/Loading";
import { useLocale } from "../hooks/UseLocale";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getProducts,
  updateCategory,
  updateProduct,
} from "../Services/ClothesServices";

const AdminDashboard = () => {
  const { language } = useLocale();
  const ar = language === "ar";
  const [section, setSection] = useState("overview");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [productForm, setProductForm] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState("");
  const [categoryForm, setCategoryForm] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [search, setSearch] = useState("");

  const loadStore = useCallback(async () => {
    try {
      const [productData, categoryData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productData);
      setCategories(categoryData);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (ar ? "تعذر تحميل بيانات المتجر." : "Could not load store data."),
      );
    } finally {
      setLoading(false);
    }
  }, [ar]);

  useEffect(() => {
    let active = true;

    Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        if (active) {
          setProducts(productData);
          setCategories(categoryData);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              (ar ? "تعذر تحميل بيانات المتجر." : "Could not load store data."),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ar]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.brand, product.category?.name]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase().includes(query)),
    );
  }, [products, search]);

  const openNewProduct = () => {
    setProductForm({ mode: "create", product: null });
    setProductError("");
    setNotice("");
    setSection("products");
  };

  const openNewCategory = () => {
    setCategoryForm({ mode: "create", category: null });
    setCategoryName("");
    setCategoryDescription("");
    setCategoryError("");
    setNotice("");
    setSection("categories");
  };

  const submitProduct = async (data) => {
    setProductSaving(true);
    setProductError("");
    setError("");
    try {
      if (productForm.mode === "edit") {
        await updateProduct(productForm.product._id, data);
        setNotice(ar ? "تم حفظ تعديلات المنتج." : "Product changes saved.");
      } else {
        await createProduct(data);
        setNotice(ar ? "تمت إضافة المنتج إلى المتجر." : "Product added to your store.");
      }
      setProductForm(null);
      await loadStore();
    } catch (requestError) {
      setProductError(
        requestError.response?.data?.errors?.join(" ") ||
          requestError.response?.data?.message ||
          (ar ? "تعذر حفظ المنتج." : "Could not save the product."),
      );
    } finally {
      setProductSaving(false);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(ar ? `هل تريد حذف "${product.name}"؟` : `Delete "${product.name}"?`)) return;
    setError("");
    setNotice("");
    try {
      await deleteProduct(product._id);
      setProducts((current) => current.filter((item) => item._id !== product._id));
      setNotice(ar ? "تم حذف المنتج." : "Product deleted.");
      if (productForm?.product?._id === product._id) setProductForm(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (ar ? "تعذر حذف المنتج." : "Could not delete the product."),
      );
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    setCategorySaving(true);
    setCategoryError("");
    setError("");
    setNotice("");
    const data = { name: categoryName.trim(), description: categoryDescription.trim() };
    try {
      if (categoryForm.mode === "edit") {
        await updateCategory(categoryForm.category._id, data);
        setNotice(ar ? "تم حفظ تعديلات التصنيف." : "Category changes saved.");
      } else {
        await createCategory(data);
        setNotice(ar ? "تمت إضافة التصنيف." : "Category added.");
      }
      setCategoryForm(null);
      await loadStore();
    } catch (requestError) {
      setCategoryError(
        requestError.response?.data?.errors?.join(" ") ||
          requestError.response?.data?.message ||
          (ar ? "تعذر حفظ التصنيف." : "Could not save the category."),
      );
    } finally {
      setCategorySaving(false);
    }
  };

  const removeCategory = async (category) => {
    const hasProducts = products.some(
      (product) =>
        (typeof product.category === "string" ? product.category : product.category?._id) ===
        category._id,
    );
    if (hasProducts) {
      setError(
        ar
          ? "لا يمكن حذف تصنيف يحتوي على منتجات. انقل المنتجات إلى تصنيف آخر أولًا."
          : "This category contains products. Move them to another category before deleting it.",
      );
      return;
    }
    if (!window.confirm(ar ? `حذف تصنيف "${category.name}"؟` : `Delete "${category.name}"?`)) return;
    setError("");
    setNotice("");
    try {
      await deleteCategory(category._id);
      setCategories((current) => current.filter((item) => item._id !== category._id));
      setNotice(ar ? "تم حذف التصنيف." : "Category deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (ar ? "تعذر حذف التصنيف." : "Could not delete the category."),
      );
    }
  };

  const startEditCategory = (category) => {
    setCategoryForm({ mode: "edit", category });
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryError("");
    setNotice("");
  };

  if (loading) {
    return <div className="container py-5 text-center flex-grow-1"><Loading /></div>;
  }

  return (
    <main className="admin-page flex-grow-1">
      <div className="container py-4 py-lg-5">
        <header className="admin-welcome">
          <div>
            <span className="section-kicker">{ar ? "مساحة الإدارة" : "STORE WORKSPACE"}</span>
            <h1>{ar ? "متجرك، تحت السيطرة." : "Your store, in control."}</h1>
            <p>{ar ? "أدر المنتجات والتصنيفات والطلبات من مكان واحد." : "Manage products, collections and orders from one simple workspace."}</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-light admin-top-button" onClick={openNewCategory} type="button">
              {ar ? "+ تصنيف جديد" : "+ New category"}
            </button>
            <button className="btn btn-dark admin-top-button" onClick={openNewProduct} type="button">
              {ar ? "+ منتج جديد" : "+ Add a product"}
            </button>
          </div>
        </header>

        {error && <div className="alert alert-danger mt-4" role="alert">{error}</div>}
        {notice && <div className="alert alert-success mt-4" role="status">{notice}</div>}

        <section className="admin-stat-grid" aria-label={ar ? "ملخص المتجر" : "Store overview"}>
          <article className="admin-stat-card">
            <span className="admin-stat-icon">▧</span>
            <span>{ar ? "إجمالي المنتجات" : "Products"}</span>
            <strong>{products.length}</strong>
            <small>{ar ? "منتج في كتالوجك" : "items in your catalog"}</small>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon">◫</span>
            <span>{ar ? "التصنيفات" : "Categories"}</span>
            <strong>{categories.length}</strong>
            <small>{ar ? "مجموعات المنتجات" : "product collections"}</small>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon">!</span>
            <span>{ar ? "مخزون منخفض" : "Low stock"}</span>
            <strong>{products.filter((product) => product.stock <= 5).length}</strong>
            <small>{ar ? "منتجات تحتاج متابعة" : "items need attention"}</small>
          </article>
          <Link to="/admin/orders" className="admin-stat-card admin-stat-link">
            <span className="admin-stat-icon">↗</span>
            <span>{ar ? "الطلبات" : "Orders"}</span>
            <strong>→</strong>
            <small>{ar ? "راجع الطلبات وتحديثها" : "Review and update orders"}</small>
          </Link>
        </section>

        <nav className="admin-tabs" aria-label={ar ? "أقسام لوحة التحكم" : "Dashboard sections"}>
          {[
            ["overview", ar ? "نظرة عامة" : "Overview"],
            ["products", ar ? "المنتجات" : "Products"],
            ["categories", ar ? "التصنيفات" : "Categories"],
          ].map(([key, label]) => (
            <button
              aria-pressed={section === key}
              className={`admin-tab ${section === key ? "active" : ""}`}
              key={key}
              onClick={() => {
                setSection(key);
                setNotice("");
                setError("");
              }}
              type="button"
            >
              {label}
            </button>
          ))}
          <Link className="admin-tab admin-tab-link" to="/users">{ar ? "العملاء" : "Customers"} ↗</Link>
        </nav>

        {(section === "overview" || section === "products") && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="section-kicker">{ar ? "كتالوج متجرك" : "YOUR CATALOG"}</span>
                <h2>{ar ? "إدارة المنتجات" : "Manage products"}</h2>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <label className="admin-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label={ar ? "ابحث عن منتج" : "Search products"}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={ar ? "ابحث بالاسم أو العلامة..." : "Search name or brand..."}
                    value={search}
                  />
                </label>
                <button className="btn btn-dark" onClick={openNewProduct} type="button">
                  + {ar ? "أضف منتجًا" : "Add product"}
                </button>
              </div>
            </div>

            {productForm && (
              <div className="admin-editor">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <span className="section-kicker">{productForm.mode === "edit" ? (ar ? "تعديل" : "EDIT ITEM") : (ar ? "منتج جديد" : "NEW ITEM")}</span>
                    <h3 className="h4 mb-0">{productForm.mode === "edit" ? (ar ? "تعديل المنتج" : "Edit product") : (ar ? "أضف منتجًا للمتجر" : "Add a product to your store")}</h3>
                  </div>
                  <button aria-label={ar ? "إغلاق النموذج" : "Close form"} className="btn btn-outline-dark" onClick={() => setProductForm(null)} type="button">×</button>
                </div>
                <ProductForm
                  key={productForm.product?._id || "new-product"}
                  error={productError}
                  initialProduct={productForm.product || undefined}
                  loading={productSaving}
                  onSubmit={submitProduct}
                  submitLabel={productForm.mode === "edit" ? (ar ? "حفظ التعديلات" : "Save changes") : (ar ? "إضافة المنتج" : "Create product")}
                />
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="admin-empty">
                <span>▧</span>
                <h3>{ar ? "لا توجد منتجات هنا بعد" : "No products here yet"}</h3>
                <p>{ar ? "ابدأ بإضافة أول منتج إلى متجرك." : "Add your first product to get your store started."}</p>
                <button className="btn btn-dark" onClick={openNewProduct} type="button">{ar ? "+ إضافة منتج" : "+ Add your first product"}</button>
              </div>
            ) : (
              <div className="admin-product-list">
                {filteredProducts.map((product) => (
                  <article className="admin-product-row" key={product._id}>
                    <img
                      alt=""
                      className="admin-product-thumb"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/product-placeholder.svg";
                      }}
                      src={product.image}
                    />
                    <div className="admin-product-name">
                      <strong>{product.name}</strong>
                      <span>{product.category?.name || (ar ? "بدون تصنيف" : "Uncategorized")} · {product.brand}</span>
                    </div>
                    <div className="admin-product-price">{Number(product.price).toLocaleString(ar ? "ar-EG" : "en-EG")} {ar ? "ج.م" : "EGP"}</div>
                    <span className={`admin-stock ${product.stock <= 5 ? "low" : ""}`}>
                      {product.stock <= 5 ? (ar ? `مخزون منخفض · ${product.stock}` : `Low stock · ${product.stock}`) : (ar ? `متوفر · ${product.stock}` : `${product.stock} in stock`)}
                    </span>
                    <div className="admin-product-actions">
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => {
                          setProductForm({ mode: "edit", product });
                          setProductError("");
                          setSection("products");
                        }}
                        type="button"
                      >
                        {ar ? "تعديل" : "Edit"}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeProduct(product)} type="button">
                        {ar ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {section === "categories" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="section-kicker">{ar ? "تنظيم المتجر" : "KEEP THINGS ORGANIZED"}</span>
                <h2>{ar ? "التصنيفات" : "Product categories"}</h2>
              </div>
              <button className="btn btn-dark" onClick={openNewCategory} type="button">+ {ar ? "تصنيف جديد" : "New category"}</button>
            </div>
            {categoryForm && (
              <form className="category-editor" onSubmit={submitCategory}>
                <div className="d-flex justify-content-between align-items-start">
                  <h3 className="h5">{categoryForm.mode === "edit" ? (ar ? "تعديل التصنيف" : "Edit category") : (ar ? "إنشاء تصنيف" : "Create a category")}</h3>
                  <button aria-label={ar ? "إغلاق" : "Close"} className="btn-close" onClick={() => setCategoryForm(null)} type="button" />
                </div>
                {categoryError && <div className="alert alert-danger" role="alert">{categoryError}</div>}
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="category-name">{ar ? "اسم التصنيف" : "Category name"}</label>
                    <input autoFocus className="form-control" id="category-name" maxLength="50" minLength="2" onChange={(event) => setCategoryName(event.target.value)} required value={categoryName} />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label" htmlFor="category-description">{ar ? "وصف مختصر" : "Short description"}</label>
                    <input className="form-control" id="category-description" maxLength="500" onChange={(event) => setCategoryDescription(event.target.value)} value={categoryDescription} />
                  </div>
                  <div className="col-md-3 d-flex gap-2">
                    <button className="btn btn-dark flex-grow-1" disabled={categorySaving} type="submit">{categorySaving ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ التصنيف" : "Save category")}</button>
                    <button className="btn btn-outline-dark" onClick={() => setCategoryForm(null)} type="button">{ar ? "إلغاء" : "Cancel"}</button>
                  </div>
                </div>
              </form>
            )}
            {categories.length === 0 ? (
              <div className="admin-empty">
                <span>◫</span>
                <h3>{ar ? "ابدأ بإنشاء تصنيف" : "Start with a category"}</h3>
                <p>{ar ? "التصنيفات تسهّل تنظيم منتجاتك في المتجر." : "Categories help keep your products organized."}</p>
                <button className="btn btn-dark" onClick={openNewCategory} type="button">{ar ? "+ إنشاء تصنيف" : "+ Create category"}</button>
              </div>
            ) : (
              <div className="category-grid">
                {categories.map((category) => {
                  const count = products.filter(
                    (product) =>
                      (typeof product.category === "string" ? product.category : product.category?._id) ===
                      category._id,
                  ).length;
                  return (
                    <article className="category-admin-card" key={category._id}>
                      <span className="category-card-mark">✳</span>
                      <div className="flex-grow-1">
                        <h3>{category.name}</h3>
                        <p>{category.description || (ar ? "لا يوجد وصف لهذا التصنيف." : "No description added yet.")}</p>
                        <small>{count} {ar ? "منتج" : count === 1 ? "product" : "products"}</small>
                      </div>
                      <div className="category-card-actions">
                        <button className="btn btn-sm btn-outline-dark" onClick={() => startEditCategory(category)} type="button">{ar ? "تعديل" : "Edit"}</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeCategory(category)} type="button">{ar ? "حذف" : "Delete"}</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
