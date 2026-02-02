import { useState } from "react";

export default function ProductFormModal({ open, onClose, onCreate, creating }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: "",
    price: "",
  });

  if (!open) return null;

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      name: form.name,
      description: form.description,
      quantity: Number(form.quantity),
      price: Number(form.price),
    });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-eco-900">Vender producto</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-eco-900/70 hover:bg-eco-50">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-eco-900">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
              placeholder="Ej: Vidrio reciclado"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-eco-900">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
              placeholder="Ej: Vidrio limpio y separado por color"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-eco-900">Cantidad</label>
              <input
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
                type="number"
                min="0"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-eco-900">Precio</label>
              <input
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-2 outline-none focus:border-eco-500"
                type="number"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-eco-200 px-4 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
            >
              Cancelar
            </button>
            <button
              disabled={creating}
              type="submit"
              className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 disabled:bg-eco-200 disabled:text-eco-500"
            >
              {creating ? "Guardando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
