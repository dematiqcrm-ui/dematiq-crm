import { useState } from "react";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
  const savedUser = localStorage.getItem("user");

  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  // ← token se lee directo de localStorage, siempre fresco
  const getToken = () => localStorage.getItem("token");

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        token: getToken(), // ← ahora disponible con useAuth()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}