import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../companint/Footer";
import Loading from "../companint/Loading";
import NavBar from "../companint/NavBar";
import { getCategories, getProducts } from "../Services/ClothesServices";
import { getUsers } from "../Services/UserServices";

const fetchDashboardData = () =>
  Promise.all([getProducts(), getCategories(), getUsers()]).then(
    ([products, categories, users]) => ({ products, categories, users }),
  );

const Dashboard = () => {
  const [summary, setSummary] = useState({
    products: [],
    categories: [],
    users: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSummary(await fetchDashboardData());
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchDashboardData()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Could not load dashboard information.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stockCount = summary.products.reduce(
    (total, product) => total + (Number(product.stock) || 0),
    0,
  );
  const lowStockCount = summary.products.filter(
    (product) => Number(product.stock) <= 5,
  ).length;
  const recentProducts = [...summary.products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <NavBar />
      <main className="container py-4 py-lg-5 flex-grow-1">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 fade-in">
          <div>
            <p className="text-uppercase text-primary fw-semibold small mb-1">
              Store management
            </p>
            <h1 className="h2 mb-1">Dashboard</h1>
            <p className="text-secondary mb-0">
              A quick overview of your store.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={loadDashboard}
              disabled={loading}
            >
              Refresh
            </button>
            <Link className="btn btn-primary" to="/products/new">
              Add product
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3" role="alert">
            <span>{error}</span>
            <button className="btn btn-sm btn-outline-danger" type="button" onClick={loadDashboard}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5"><Loading message="Loading dashboard…" /></div>
        ) : (
          <>
            <section className="row g-3 mb-4" aria-label="Store statistics">
              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-soft">
                  <div className="card-body">
                    <p className="text-secondary mb-2">Products</p>
                    <p className="display-6 fw-semibold mb-2">{summary.products.length}</p>
                    <Link to="/products">Manage catalog →</Link>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-soft">
                  <div className="card-body">
                    <p className="text-secondary mb-2">Categories</p>
                    <p className="display-6 fw-semibold mb-2">{summary.categories.length}</p>
                    <span className="text-secondary small">Across the catalog</span>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-soft">
                  <div className="card-body">
                    <p className="text-secondary mb-2">Users</p>
                    <p className="display-6 fw-semibold mb-2">{summary.users.length}</p>
                    <Link to="/users">Manage users →</Link>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-soft">
                  <div className="card-body">
                    <p className="text-secondary mb-2">Units in stock</p>
                    <p className="display-6 fw-semibold mb-2">{stockCount}</p>
                    <span className={lowStockCount ? "text-warning small" : "text-success small"}>
                      {lowStockCount
                        ? `${lowStockCount} products low on stock`
                        : "Stock levels look good"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="card border-0 shadow-soft">
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h2 className="h5 mb-0">Recent products</h2>
                <Link to="/products">View all</Link>
              </div>
              {recentProducts.length === 0 ? (
                <div className="card-body text-secondary">
                  No products yet. <Link to="/products/new">Add your first product</Link>.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Category</th>
                        <th scope="col">Price</th>
                        <th scope="col">Stock</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={product.image}
                                alt=""
                                width="44"
                                height="44"
                                className="rounded object-fit-cover"
                              />
                              <span className="fw-medium">{product.name}</span>
                            </div>
                          </td>
                          <td>{product.category?.name || "Uncategorized"}</td>
                          <td>EGP {Number(product.price).toFixed(2)}</td>
                          <td>
                            <span className={Number(product.stock) <= 5 ? "badge text-bg-warning" : "badge text-bg-success"}>
                              {product.stock}
                            </span>
                          </td>
                          <td>
                            <Link to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
