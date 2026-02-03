import { useState } from "react";
import api from "../api/client";
import Loader from "./Loader";

export default function AddProductModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: 1,
    price: 0.5,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/products", form);
      onCreated?.();
      onClose?.();
      setForm({ name: "", description: "", quantity: 1, price: 0.5 });
    } catch (err) {
      setError(err?.response?.data?.message || "Error creando producto");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-eco-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-eco-900">Publicar nuevo producto</h3>
            <p className="text-sm text-eco-900/70">Completa los datos para vender.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-eco-200 px-3 py-1.5 text-sm font-semibold text-eco-900 hover:bg-eco-50"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-eco-900">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-eco-900">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-eco-900">Cantidad</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-eco-900">Precio</label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
                required
              />
            </div>
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
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>

        {loading && <Loader label="Creando producto..." />}
      </div>
    </div>
  );
}
