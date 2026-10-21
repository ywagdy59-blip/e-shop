import { Link } from "react-router-dom";

const ForgotEmail = () => (
  <main className="container py-5 flex-grow-1" style={{ maxWidth: 640, margin: "0 auto" }}>
    <div className="card border-0 shadow-soft fade-in">
      <div className="card-body p-4 p-lg-5 text-center">
        <span className="brand-mark d-inline-block mb-3">✦</span>
        <h1 className="h3 mb-3">Forgot your email?</h1>
        <p className="text-muted">
          For privacy, NOVA never displays account email addresses. If you cannot remember it,
          you can create a new customer account with an email address you can access.
        </p>
        <Link className="btn btn-dark mt-3" to="/register">
          Create a new account
        </Link>
        <p className="mt-4 mb-0 small">
          <Link to="/login" className="fw-bold">I remembered it — sign in</Link>
        </p>
      </div>
    </div>
  </main>
);

export default ForgotEmail;
