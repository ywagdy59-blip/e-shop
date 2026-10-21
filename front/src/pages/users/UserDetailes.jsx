import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../companint/Loading";
import { getUser } from "../../Services/UserServices";
import { useLocale } from "../../hooks/UseLocale";

const UserDetails = () => {
  const { id } = useParams();
  const { language } = useLocale();
  const ar = language === "ar";
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getUser(id)
      .then(setUser)
      .catch((e) => setError(e.response?.data?.message || "Could not load user."));
  }, [id]);

  if (!user && !error) {
    return <Loading message={ar ? "جارٍ تحميل المستخدم…" : "Loading user…"} />;
  }

  if (error) {
    return (
      <main className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <Link to="/users" className="btn btn-dark mt-3">
          {ar ? "العودة إلى العملاء" : "Back to users"}
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-5 flex-grow-1" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="card border-0 shadow-soft fade-in">
        <div className="card-body p-4 p-lg-5 text-center">
          <h1 className="h4 mb-3">{user.name}</h1>
          <p className="text-muted mb-1">{user.email}</p>
          <span className={`badge bg-${user.role === "admin" ? "dark" : "primary"} mb-3 d-inline-block`}>
            {user.role}
          </span>
          <Link className="btn btn-primary" to={`/users/${user._id}/edit`}>
            {ar ? "تعديل المستخدم" : "Edit user"}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default UserDetails;
