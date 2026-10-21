import { useMemo, useState } from "react";
import { clearStoredAuth, getStoredUser, storeAuth } from "../utiles/Token";
import AuthContext from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const login = (data) => {
    if (!data?.token || !data?.user) {
      throw new Error("The login response is missing user or token data.");
    }

    storeAuth(data);
    setUser(data.user);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
