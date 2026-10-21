import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../companint/Loading";
import { getUser, updateUser } from "../../Services/UserServices";
import { useLocale } from "../../hooks/UseLocale";

const EditUser = () => {
  const { id } = useParams();
  const { language } = useLocale();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUser(id)
      .then((user) => setForm({ name: user.name, email: user.email, password: "" }))
      .catch((e) => setError(e.response?.data?.message || "Could not load user."));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name: form.name, email: form.email };
      if (form.password) data.password = form.password;
      await updateUser(id, data);
      navigate(`/users/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update user.");
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return error ? (
      <main className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
      </main>
    ) : (
      <Loading message={ar ? "جارٍ التحميل…" : "Loading…"} />
    );
  }

  return (
    <main className="container py-5 flex-grow-1" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 className="h2 mb-4">{ar ? "تعديل المستخدم" : "Edit user"}</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={submit} className="vstack gap-3 card p-4 p-lg-5 shadow-soft border-0">
        <div className="mb-3">
          <label className="form-label">{ar ? "الاسم الكامل" : "Full name"}</label>
          <input
            className="form-control"
            value={form.name}
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="form-label">{ar ? "البريد الإلكتروني" : "Email address"}</label>
          <input
            className="form-control"
            type="email"
            value={form.email}
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="form-label">{ar ? "كلمة مرور جديدة (اختياري)" : "New password (optional)"}</label>
          <input
            className="form-control"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn btn-dark w-100" disabled={saving}>
          {saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ التعديلات" : "Save changes")}
        </button>
      </form>
    </main>
  );
};

export default EditUser;
