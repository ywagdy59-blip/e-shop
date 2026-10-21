import { useEffect, useState } from "react";
import { createCategory, getCategories } from "../Services/ClothesServices";
import { useLocale } from "../hooks/UseLocale";

const sampleImages = [
  { label: "Classic tee", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85" },
  { label: "Denim", url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85" },
  { label: "Summer look", url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85" },
  { label: "Outerwear", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85" },
  { label: "Sneakers", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85" },
  { label: "Accessories", url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85" },
];

const emptyForm = {
  name: "",
  category: "",
  price: "",
  size: "",
  color: "",
  brand: "",
  stock: "",
  description: "",
  image: ""
};

const toFormValues = (product) => ({
  name: product.name || "",
  category: product.category?._id || product.category || "",
  price: product.price ?? "",
  size: (product.size || []).join(", "),
  color: product.color || "",
  brand: product.brand || "",
  stock: product.stock ?? "",
  description: product.description || "",
  image: product.image || ""
});

const ProductForm = ({
  initialProduct,
  onSubmit,
  submitLabel = "Save",
  loading = false,
  error = "",
}) => {
  const { language } = useLocale();
  const ar = language === "ar";
  const [formData, setFormData] = useState(
    initialProduct ? toFormValues(initialProduct) : emptyForm,
  );
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categorySaveError, setCategorySaveError] = useState("");
  const [categorySaveNotice, setCategorySaveNotice] = useState("");

  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((requestError) => {
        if (active) {
          setCategoriesError(
            requestError.response?.data?.message || "Could not load categories.",
          );
        }
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setCategorySaving(true);
    setCategorySaveError("");
    setCategorySaveNotice("");

    try {
      const category = await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
      });
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData((current) => ({ ...current, category: category._id }));
      setNewCategoryName("");
      setNewCategoryDescription("");
      setCategoryFormOpen(false);
      setCategorySaveNotice(ar ? "تمت إضافة التصنيف واختياره للمنتج." : "Category added and selected for this product.");
    } catch (requestError) {
      setCategorySaveError(
        requestError.response?.data?.errors?.join(" ") ||
          requestError.response?.data?.message ||
          (ar ? "تعذرت إضافة التصنيف." : "Could not add the category."),
      );
    } finally {
      setCategorySaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoriesLoading || categories.length === 0) return;
    onSubmit({
      ...formData,
      category: formData.category || null,
      price: Number(formData.price),
      stock: Number(formData.stock),
      size: formData.size
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="vstack gap-3 card p-4 p-lg-5 shadow-soft border-0">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {categoriesError && <div className="alert alert-danger" role="alert">{categoriesError}</div>}
      <div className="row g-4">
        <div className="col-md-8">
          <label className="form-label mb-2" htmlFor="product-name">{ar ? "اسم المنتج" : "Product name"}</label>
          <input id="product-name" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
            <label className="form-label mb-0" htmlFor="product-category">{ar ? "التصنيف" : "Category"}</label>
            <button
              className="btn btn-link btn-sm"
              onClick={() => {
                setCategoryFormOpen((open) => !open);
                setCategorySaveError("");
                setCategorySaveNotice("");
              }}
              type="button"
            >
              {categoryFormOpen
                ? (ar ? "إلغاء" : "Cancel")
                : (ar ? "+ تصنيف جديد" : "+ Add category")}
            </button>
          </div>
          <select
            id="product-category"
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            disabled={categoriesLoading || categories.length === 0}
            required
          >
            <option value="" disabled>
              {categoriesLoading
                ? (ar ? "جارٍ تحميل التصنيفات…" : "Loading categories…")
                : categories.length === 0
                  ? (ar ? "أضف تصنيفًا أولًا من تبويب التصنيفات" : "Add a category first from the Categories tab")
                  : (ar ? "-- اختر تصنيفًا --" : "-- Select a category --")}
            </option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {categorySaveNotice && <div className="form-text text-success" role="status">{categorySaveNotice}</div>}
          {categories.length === 0 && !categoriesLoading && !categoriesError && (
            <div className="form-text">
              {ar
                ? "افتح تبويب التصنيفات في لوحة الأدمن وأضف تصنيفًا، ثم ارجع لإضافة المنتج."
                : "Open the Categories tab in the admin dashboard, add a category, then return to add your product."}
            </div>
          )}
          {categoryFormOpen && (
            <div className="product-inline-category">
                <p className="small fw-bold mb-2">{ar ? "إضافة تصنيف للمتجر" : "Create a store category"}</p>
                {categorySaveError && <div className="alert alert-danger py-2 small" role="alert">{categorySaveError}</div>}
                <label className="visually-hidden" htmlFor="product-new-category-name">{ar ? "اسم التصنيف" : "Category name"}</label>
                <input
                  autoFocus
                  className="form-control mb-2"
                  id="product-new-category-name"
                  maxLength="50"
                  minLength="2"
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder={ar ? "اسم التصنيف" : "Category name"}
                  required
                  value={newCategoryName}
                />
                <label className="visually-hidden" htmlFor="product-new-category-description">{ar ? "وصف التصنيف" : "Category description"}</label>
                <input
                  className="form-control mb-2"
                  id="product-new-category-description"
                  maxLength="500"
                  onChange={(event) => setNewCategoryDescription(event.target.value)}
                  placeholder={ar ? "وصف مختصر (اختياري)" : "Short description (optional)"}
                  value={newCategoryDescription}
                />
                <button
                  className="btn btn-outline-dark btn-sm w-100"
                  disabled={categorySaving || newCategoryName.trim().length < 2}
                  onClick={handleCreateCategory}
                  type="button"
                >
                  {categorySaving ? (ar ? "جارٍ إضافة التصنيف…" : "Adding category…") : (ar ? "إضافة واختيار التصنيف" : "Add and select category")}
                </button>
            </div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label mb-2" htmlFor="product-price">{ar ? "السعر (جنيه)" : "Price (EGP)"}</label>
          <input id="product-price" type="number" step="0.01" min="0.01" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label mb-2" htmlFor="product-stock">{ar ? "المخزون" : "Stock"}</label>
          <input id="product-stock" type="number" min="0" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label mb-2" htmlFor="product-sizes">{ar ? "المقاسات (افصل بينها بفواصل)" : "Sizes (comma separated)"}</label>
          <input id="product-sizes" name="size" className="form-control" placeholder="S, M, L" value={formData.size} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label mb-2" htmlFor="product-color">{ar ? "اللون" : "Color"}</label>
          <input id="product-color" name="color" className="form-control" value={formData.color} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label mb-2" htmlFor="product-brand">{ar ? "العلامة التجارية" : "Brand"}</label>
          <input id="product-brand" name="brand" className="form-control" value={formData.brand} onChange={handleChange} required />
        </div>

        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end gap-2 mb-2">
            <label className="form-label mb-0" htmlFor="product-image">{ar ? "صورة المنتج" : "Product photo"}</label>
            <span className="text-muted small">{ar ? "اختر صورة تجريبية أو أضف رابطك" : "Choose a sample or paste your own URL"}</span>
          </div>
          <div className="sample-image-grid mb-3" role="group" aria-label={ar ? "صور تجريبية" : "Sample product photos"}>
            {sampleImages.map((image) => (
              <button
                type="button"
                className={`sample-image-option ${formData.image === image.url ? "selected" : ""}`}
                key={image.url}
                onClick={() => setFormData((current) => ({ ...current, image: image.url }))}
                aria-label={`${ar ? "اختيار صورة" : "Choose image"}: ${image.label}`}
                aria-pressed={formData.image === image.url}
              >
                <img src={image.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <input id="product-image" type="url" name="image" className="form-control" placeholder="https://..." value={formData.image} onChange={handleChange} required />
          {formData.image && (
            <img
              src={formData.image}
              alt={ar ? "معاينة صورة المنتج" : "Product image preview"}
              className="product-form-preview mt-3 rounded border"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/product-placeholder.svg";
              }}
            />
          )}
        </div>

        <div className="col-12">
          <label className="form-label mb-2" htmlFor="product-description">{ar ? "الوصف" : "Description"}</label>
          <textarea id="product-description" name="description" rows="4" className="form-control" value={formData.description} onChange={handleChange} required />
        </div>

        <div className="col-12">
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading || categoriesLoading || categories.length === 0}
          >
          {loading ? (ar ? "جارٍ الحفظ…" : "Saving…") : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
