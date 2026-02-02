import { useEffect, useState } from "react";
import api from "../api/client";
import Loader from "../components/Loader";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductFormModal from "../components/ProductFormModal";

export default function ProductsPage({ username, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sellOpen, setSellOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/api/products");
      setProducts(res.data.products || []);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (payload) => {
    setCreating(true);
    setError("");
    try {
      await api.post("/api/products", payload);
      setSellOpen(false);
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Error creando producto");
    } finally {
      setCreating(false);
    }
  };

  const handleBuy = async (product) => {
    setBuyingId(product.id);
    setError("");
    try {
      await api.post(`/api/products/${product.id}/buy`, { quantity: 1 });
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Error al comprar");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-eco-50">
      <Header username={username} onLogout={onLogout} onOpenSell={() => setSellOpen(true)} />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-eco-900">Productos disponibles</h2>
          <button
            onClick={loadProducts}
            className="rounded-xl border border-eco-200 px-4 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
          >
            Refrescar
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Cargando productos..." />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                buying={buyingId === p.id}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </main>

      <ProductFormModal
        open={sellOpen}
        onClose={() => setSellOpen(false)}
        onCreate={handleCreate}
        creating={creating}
      />
    </div>
  );
}
