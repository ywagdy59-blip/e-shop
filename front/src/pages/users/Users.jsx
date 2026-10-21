import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../companint/Loading";
import { deleteUser, getUsers } from "../../Services/UserServices";
import { useLocale } from "../../hooks/UseLocale";

const Users = () => {
  const { language } = useLocale();
  const ar = language === "ar";
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = () =>
    getUsers()
      .then(setUsers)
      .catch((e) => setError(e.response?.data?.message || "Could not load users."));

  useEffect(() => {
    load();
  }, []);

  const remove = async (user) => {
    if (!window.confirm(ar ? `حذف ${user.name}؟` : `Delete ${user.name}?`)) return;
    try {
      await deleteUser(user._id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete user.");
    }
  };

  if (!users && !error) {
    return <div className="text-center py-5"><Loading message={ar ? "جارٍ تحميل المستخدمين…" : "Loading users…"} /></div>;
  }

  return (
    <main className="container py-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <div>
          <p className="section-kicker mb-1">{ar ? "إدارة العملاء" : "Customer management"}</p>
          <h1 className="h2 mb-0">{ar ? "جميع العملاء" : "All users"}</h1>
        </div>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="table-responsive">
        <table className="table align-middle bg-white shadow-soft">
          <thead className="table-dark">
            <tr>
              <th>{ar ? "الاسم" : "Name"}</th>
              <th>{ar ? "البريد الإلكتروني" : "Email"}</th>
              <th>{ar ? "الدور" : "Role"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge bg-${user.role === "admin" ? "dark" : "primary"}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <Link className="btn btn-sm btn-outline-primary me-2" to={`/users/${user._id}`}>
                    {ar ? "عرض" : "View"}
                  </Link>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(user)}>
                    {ar ? "حذف" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Users;
