import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="container py-5 flex-grow-1 text-center">
      <div className="empty-state">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="lead">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-dark mt-3">Back to Home</Link>
      </div>
    </main>
  );
};

export default NotFound;
