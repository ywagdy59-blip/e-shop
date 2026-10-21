import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../Services/AuthServices";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message);
      setResetUrl(data.resetUrl || "");
    } catch (err) {
      setError(err.response?.data?.message || "Could not prepare the reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5 flex-grow-1" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="card border-0 shadow-soft fade-in">
        <div className="card-body p-4 p-lg-5">
          <div className="text-center mb-4">
            <span className="brand-mark d-inline-block mb-3">✦</span>
            <h1 className="h3 mb-0">Reset your password</h1>
            <p className="text-muted small">Enter your email to receive a reset link</p>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {message && <div className="alert alert-success" role="alert">{message}</div>}
          {resetUrl && (
            <div className="alert alert-info" role="alert">
              Test reset link:{""}
              <a href={resetUrl} className="fw-bold text-decoration-underline" target="_blank" rel="noopener noreferrer">
                Open reset link
              </a>
            </div>
          )}

          <form onSubmit={submit} className="vstack gap-3">
            <div className="mb-3">
              <label className="form-label" htmlFor="recovery-email">Email address</label>
              <input
                id="recovery-email"
                className="form-control"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <button className="btn btn-dark w-100" disabled={loading}>
              {loading ? "Preparing…" : "Get reset link"}
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

export default ForgotPassword;
