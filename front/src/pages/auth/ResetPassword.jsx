import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../Services/AuthServices";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    try {
      await resetPassword(params.get("token"), password);
      navigate("/login", { state: { message: "Password updated successfully. You can log in now." } });
    } catch (err) {
      setError(err.response?.data?.message || "This reset link is no longer valid.");
    } finally {
      setLoading(false);
    }
  };

  if (!params.get("token")) {
    return (
      <main className="container py-5 flex-grow-1 text-center">
        <h1 className="h3">Invalid reset link</h1>
        <p className="text-muted">The link you followed may have expired.</p>
        <Link to="/forgot-password" className="btn btn-dark mt-3">Request a new link</Link>
      </main>
    );
  }

  return (
    <main className="container py-5 flex-grow-1" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="card border-0 shadow-soft fade-in">
        <div className="card-body p-4 p-lg-5">
          <div className="text-center mb-4">
            <span className="brand-mark d-inline-block mb-3">✦</span>
            <h1 className="h3 mb-0">Choose a new password</h1>
            <p className="text-muted small">Enter your new password below</p>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <form onSubmit={submit} className="vstack gap-3">
            <div className="mb-3">
              <label className="form-label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                className="form-control"
                type="password"
                minLength="6"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                className="form-control"
                type="password"
                minLength="6"
                placeholder="••••••••"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
              />
            </div>

            <button className="btn btn-dark w-100" disabled={loading}>
              {loading ? "Saving…" : "Save new password"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 small">
            Remember your password? <Link to="/login" className="fw-bold">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
