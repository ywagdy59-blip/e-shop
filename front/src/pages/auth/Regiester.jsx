import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useLocale } from "../../hooks/UseLocale";
import { registerUser } from "../../Services/AuthServices";
import "../../css/login.css";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language } = useLocale();
  const ar = language === "ar";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      errors.name = ar ? "اكتب اسمك." : "Enter your name.";
    } else if (name.length < 2 || name.length > 50) {
      errors.name = ar ? "الاسم لازم يكون من حرفين إلى 50 حرفًا." : "Your name must be between 2 and 50 characters.";
    }

    if (!email) {
      errors.email = ar ? "اكتب بريدك الإلكتروني." : "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ar ? "البريد الإلكتروني غير صحيح. مثال: name@example.com" : "Enter a valid email, for example name@example.com.";
    }

    if (!form.password) {
      errors.password = ar ? "اكتب كلمة مرور." : "Enter a password.";
    } else if (form.password.length < 6) {
      errors.password = ar ? "كلمة المرور لازم تكون 6 أحرف على الأقل." : "Your password must be at least 6 characters.";
    } else if (form.password.length > 128) {
      errors.password = ar ? "كلمة المرور لا يمكن أن تتجاوز 128 حرفًا." : "Your password must be no longer than 128 characters.";
    }

    return errors;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const data = await registerUser(payload);
      login(data);
      navigate("/products", { replace: true });
    } catch (requestError) {
      const message =
        requestError.response?.data?.errors?.join(" ") ||
        requestError.response?.data?.message ||
        (requestError.response
          ? (ar ? "تعذر إنشاء الحساب. راجع البيانات وحاول مرة أخرى." : "Could not create your account. Check your details and try again.")
          : (ar ? "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى." : "Could not reach the server. Check your connection and try again."));
      setError(message);

      if (requestError.response?.status === 409 || /email|بريد/i.test(message)) {
        setFieldErrors((current) => ({
          ...current,
          email: message,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setError("");
  };

  return (
    <main className="login-page register-page">
      <section className="login-box register-box fade-in">
        <div className="text-center mb-4">
          <span className="brand-mark d-inline-block mb-3">✦</span>
          <p className="section-kicker mb-1">{ar ? "انضم إلى NOVA" : "A GOOD PLACE TO START"}</p>
          <h1 className="h3 mb-1">{ar ? "أنشئ حسابك" : "Make yourself at home."}</h1>
          <p className="text-muted small mb-0">{ar ? "أنشئ حسابًا لمتابعة طلباتك وحفظ اختياراتك." : "Create an account to keep your orders and favourites together."}</p>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <form noValidate onSubmit={submit} className="vstack gap-3">
          <div>
            <label className="form-label" htmlFor="register-name">{ar ? "الاسم بالكامل" : "Full name"}</label>
            <input
              id="register-name"
              autoComplete="name"
              className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
              maxLength="50"
              minLength="2"
              value={form.name}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
              onChange={(event) => updateField("name", event.target.value)}
            />
            {fieldErrors.name && <div className="field-error" id="register-name-error">{fieldErrors.name}</div>}
          </div>

          <div>
            <label className="form-label" htmlFor="register-email">{ar ? "البريد الإلكتروني" : "Email address"}</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
              onChange={(event) => updateField("email", event.target.value)}
            />
            {fieldErrors.email && <div className="field-error" id="register-email-error">{fieldErrors.email}</div>}
          </div>

          <div>
            <label className="form-label" htmlFor="register-password">{ar ? "كلمة المرور" : "Password"}</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              minLength="6"
              maxLength="128"
              placeholder={ar ? "6 أحرف على الأقل" : "At least 6 characters"}
              value={form.password}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "register-password-error" : "register-password-hint"}
              onChange={(event) => updateField("password", event.target.value)}
            />
            {fieldErrors.password
              ? <div className="field-error" id="register-password-error">{fieldErrors.password}</div>
              : <small className="field-hint" id="register-password-hint">{ar ? "لازم تكون 6 أحرف على الأقل." : "Use at least 6 characters."}</small>}
          </div>

          <button className="btn btn-dark w-100 mt-2" disabled={loading} type="submit">
            {loading ? (ar ? "جارٍ إنشاء الحساب…" : "Creating your account…") : (ar ? "إنشاء الحساب" : "Create account")}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small">
          {ar ? "عندك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link to="/login" className="fw-bold">{ar ? "سجّل الدخول" : "Sign in"}</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
