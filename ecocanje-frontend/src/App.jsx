import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";

export default function App() {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem("token") || "",
    username: localStorage.getItem("username") || "",
  }));

  const isLogged = !!session.token;

  const handleLogin = ({ token, username }) => {
    setSession({ token, username });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setSession({ token: "", username: "" });
  };

  // Si el token es inválido, backend responderá 401; en ese caso puedes mejorar luego con interceptors.
  useEffect(() => {}, []);

  if (!isLogged) return <LoginPage onLogin={handleLogin} />;

  return <ProductsPage username={session.username} onLogout={handleLogout} />;
}
