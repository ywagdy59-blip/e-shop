import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { useCart } from "../hooks/UseCart";
import { useLocale } from "../hooks/UseLocale";

const NavBar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { language, dir, t, toggleLanguage } = useLocale();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg site-nav sticky-top shadow-sm" dir={dir}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="brand-mark">✦</span>
          NOVA
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                {t("home")}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/products">
                {t("shop")}
              </NavLink>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link fw-bold" to="/admin">
                  {t("admin")}
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink className="nav-link position-relative" to="/cart">
                {t("bag")}
                {count > 0 && (
                  <span className="badge rounded-pill text-bg-dark ms-1 position-absolute top-0 start-100 translate-middle">
                    {count}
                  </span>
                )}
              </NavLink>
            </li>

            <li className="nav-item">
              <button
                className="btn btn-outline-dark btn-sm nav-language"
                onClick={toggleLanguage}
                type="button"
              >
                {language === "en" ? "عربي" : "EN"}
              </button>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-link nav-link dropdown-toggle p-0"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user?.name || "Account"}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-soft border-0">
                    {isAdmin && (
                      <>
                        <li>
                          <Link className="dropdown-item fw-bold" to="/admin">
                            {t("dashboard")}
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/products/new">
                            {t("addProduct")}
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                      </>
                    )}
                    <li>
                      <Link className="dropdown-item" to="/my-orders">
                        {t("myOrders")}
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to={`/users/${user.id}`}>
                        {t("profile")}
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-dark btn-sm" onClick={handleLogout} type="button">
                    {t("logout")}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    {t("login")}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-dark btn-sm ms-lg-2" to="/register">
                    {t("join")}
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
