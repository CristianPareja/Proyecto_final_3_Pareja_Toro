// src/components/EditProductModal.jsx
import { useEffect, useState } from "react";
import Loader from "./Loader";

export default function EditProductModal({ open, onClose, product, onSave, loading }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      quantity: product.quantity ?? 0,
      price: product.price ?? 0,
    });
  }, [product]);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();

    // validaciones
    if (!String(form.name).trim()) return alert("Nombre obligatorio");
    if (!String(form.description).trim()) return alert("Descripción obligatoria");
    const q = Number(form.quantity);
    const pr = Number(form.price);
    if (Number.isNaN(q) || q < 0) return alert("Cantidad inválida");
    if (Number.isNaN(pr) || pr < 0) return alert("Precio inválido");

    await onSave({
      name: String(form.name).trim(),
      description: String(form.description).trim(),
      quantity: q,
      price: pr,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-eco-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-eco-900">Editar producto</h3>
            <p className="text-sm text-eco-900/70">
              Solo el dueño del producto puede editarlo.
            </p>
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
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 text-sm outline-none focus:border-eco-500"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Botellas plásticas"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-eco-900">Descripción</label>
            <input
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 text-sm outline-none focus:border-eco-500"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ej: Limpias y clasificadas"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-eco-900">Cantidad (stock)</label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 text-sm outline-none focus:border-eco-500"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-eco-900">Precio</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 text-sm outline-none focus:border-eco-500"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 disabled:bg-eco-200 disabled:text-eco-500"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {loading && <Loader label="Actualizando..." />}
      </div>
    </div>
  );
}
