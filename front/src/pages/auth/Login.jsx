import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { loginAdminWithGoogle, loginUser } from "../../Services/AuthServices";
import { useLocale } from "../../hooks/UseLocale";
import "../../css/login.css";

const Login = () => {
  const { login } = useAuth();
  const { language } = useLocale();
  const ar = language === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);
  const [googleError, setGoogleError] = useState("");
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const demoAdmin = {
    email: "demo.admin@nova.example",
    password: "NOVA-Demo-2026!",
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;
    let active = true;

    const renderGoogleButton = () => {
      if (!active || !googleButtonRef.current || !window.google?.accounts?.id) return;
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setGoogleError("");
          setError("");
          try {
            const data = await loginAdminWithGoogle(response.credential);
            login(data);
            const from = location.state?.from;
            const destination = typeof from === "string"
              ? from
              : from?.pathname
                ? `${from.pathname}${from.search || ""}${from.hash || ""}`
                : "/admin";
            navigate(destination, { replace: true });
          } catch (requestError) {
            setGoogleError(
              requestError.response?.data?.message ||
                (ar ? "تعذر تسجيل الدخول باستخدام Google." : "Google sign-in could not be completed."),
            );
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
        locale: ar ? "ar" : "en",
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      let script = document.getElementById("google-identity-script");
      if (!script) {
        script = document.createElement("script");
        script.id = "google-identity-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderGoogleButton);
      script.addEventListener("error", () => {
        if (active) {
          setGoogleError(ar ? "تعذر تحميل تسجيل الدخول من Google. حدّث الصفحة وحاول مجددًا." : "Could not load Google sign-in. Refresh the page and try again.");
        }
      });
    }

    return () => {
      active = false;
    };
  }, [ar, googleClientId, login, location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "email" ? value.trimStart() : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      };

      const data = await loginUser(payload);
      login(data);
      const from = location.state?.from;
      const destination = typeof from === "string"
        ? from
        : from?.pathname
          ? `${from.pathname}${from.search || ""}${from.hash || ""}`
          : data.user?.role === "admin"
            ? "/admin"
            : "/products";
      navigate(destination, { replace: true });
    } catch (error) {
      if (error.response?.status === 401) {
        setError(
          ar
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة. راجع البيانات أو استخدم «نسيت كلمة المرور؟»."
            : "Email or password does not match. Check your details or use “Forgot password?”.",
        );
      } else {
        setError(
          error.response?.data?.errors?.join(" ") ||
            error.response?.data?.message ||
            (error.response
              ? (ar ? "تعذر تسجيل الدخول. حاول مرة أخرى." : "Could not sign in. Please try again.")
              : (ar ? "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى." : "Could not reach the server. Check your connection and try again.")),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box fade-in">
        <div className="text-center mb-4">
          <span className="brand-mark d-inline-block mb-3">✦</span>
          <h1 className="h3 mb-0">{ar ? "أهلًا بعودتك" : "Welcome back"}</h1>
          <p className="text-muted small">{ar ? "سجّل الدخول إلى حسابك" : "Sign in to your account"}</p>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {location.state?.message && (
          <div className="alert alert-success" role="alert">{location.state.message}</div>
        )}
        {googleError && <div className="alert alert-danger" role="alert">{googleError}</div>}

        <form onSubmit={handleSubmit} className="vstack gap-3">
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">{ar ? "البريد الإلكتروني" : "Email address"}</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="login-password">{ar ? "كلمة المرور" : "Password"}</label>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? (ar ? "جارٍ تسجيل الدخول…" : "Signing in…") : (ar ? "تسجيل الدخول" : "Sign in")}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="demo-login-card">
            <p className="mb-1 fw-bold">{ar ? "حساب أدمن تجريبي" : "Demo administrator account"}</p>
            <p className="mb-2 small">
              {ar ? "البريد:" : "Email:"} <code>{demoAdmin.email}</code>
              <br />
              {ar ? "كلمة المرور:" : "Password:"} <code>{demoAdmin.password}</code>
            </p>
            <button
              className="btn btn-outline-dark btn-sm w-100"
              onClick={() => setFormData(demoAdmin)}
              type="button"
            >
              {ar ? "استخدم بيانات الأدمن التجريبية" : "Use demo admin credentials"}
            </button>
          </div>
        )}

        <div className="login-divider"><span>{ar ? "أو" : "OR"}</span></div>
        {googleClientId ? (
          <div>
            <p className="google-admin-label">{ar ? "دخول مسؤول المتجر" : "STORE ADMIN SIGN-IN"}</p>
            <div className="google-signin-button" ref={googleButtonRef} />
          </div>
        ) : (
          <p className="google-setup-note">
            {ar
              ? "دخول الأدمن عبر Google يحتاج إعداد VITE_GOOGLE_CLIENT_ID."
              : "Google admin sign-in needs VITE_GOOGLE_CLIENT_ID configured."}
          </p>
        )}

        <p className="text-center mt-3 small">
          {ar ? "ليس لديك حساب؟" : "Don't have an account?"} <Link to="/register" className="fw-bold">{ar ? "إنشاء حساب" : "Create an account"}</Link>
        </p>
        <div className="d-flex justify-content-center gap-3 small">
          <Link to="/forgot-password" className="text-muted">{ar ? "نسيت كلمة المرور؟" : "Forgot password?"}</Link>
          <Link to="/forgot-email" className="text-muted">{ar ? "نسيت البريد؟" : "Forgot email?"}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
