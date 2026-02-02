import { useState } from "react";
import api from "../api/client";
import Loader from "../components/Loader";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | register
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await api.post("/api/auth/register", form);
      }

      const res = await api.post("/api/auth/login", form);

      const token = res.data.token;
      const username = form.username;

      if (!token) {
        throw new Error("El backend no devolvió token");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      onLogin({ token, username });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eco-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-eco-100">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-eco-100 flex items-center justify-center text-eco-800 text-xl font-bold">
            ♻
          </div>
          <div>
            <h1 className="text-xl font-semibold text-eco-900">EcoCanje</h1>
            <p className="text-sm text-eco-900/70">Ingresa para comprar o vender</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === "login"
                ? "bg-eco-600 text-white"
                : "border border-eco-200 text-eco-900"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>

          <button
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === "register"
                ? "bg-eco-600 text-white"
                : "border border-eco-200 text-eco-900"
            }`}
            onClick={() => setMode("register")}
            type="button"
          >
            Registro
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-medium text-eco-900">Usuario</label>
            <input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
              placeholder="Ej: userA"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-eco-900">Contraseña</label>
            <input
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
              type="password"
              placeholder="******"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 disabled:bg-eco-200 disabled:text-eco-500"
          >
            {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>

        {loading && <Loader label="Conectando..." />}
      </div>
    </div>
  );
}
