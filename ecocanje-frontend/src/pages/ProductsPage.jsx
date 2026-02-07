import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import Loader from "../components/Loader";
import SellerInfoModal from "../components/SellerInfoModal";
import AddProductModal from "../components/AddProductModal";
import PurchaseRequestsModal from "../components/PurchaseRequestsModal";

function safeDecodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function getUserIdFromToken(token) {
  const p = safeDecodeJwt(token);
  if (!p) return null;
  return p.id || p.userId || p.sub || null;
}

export default function ProductsPage({ onLogout }) {
  const token = localStorage.getItem("token") || "";
  const usernameLS = localStorage.getItem("username") || "Usuario";

  // trae el usuario real del backend
  const [me, setMe] = useState({
    id: getUserIdFromToken(token),
    username: usernameLS,
  });

  const currentUserId = me?.id || null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // compra individual (solo 1 producto)
  const [selected, setSelected] = useState(null); // { product, qty }
  const [qtyInput, setQtyInput] = useState({});

  // modals
  const [openSeller, setOpenSeller] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // seller modal info
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // PENDING | ACCEPTED | REJECTED
  const [createdRequestId, setCreatedRequestId] = useState(null);

  // vendedor: solicitudes
  const [openRequests, setOpenRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // mini toast para buyer al cambiar estado
  const [buyerNotice, setBuyerNotice] = useState("");

  
  // Cargar usuario real 
  
  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get("/api/auth/me");
        // esperado: { id, username, ... }
        if (res?.data?.id) {
          setMe({ id: res.data.id, username: res.data.username || usernameLS });
        }
      } catch {
        // si no existe endpoint, quedamos con JWT/localStorage
      }
    };
    if (token) loadMe();
    
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/products");
      setProducts(res.data.products || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);


  // Polling: solicitudes pendientes del vendedor (cada 5s)

  useEffect(() => {
  let timer = null;

  const fetchPending = async () => {
    try {
      const res = await api.get(
        "/api/purchase-requests/seller/pending"
      );
      setPendingRequests(res.data.requests || []);
    } catch (e) {
      console.error("Error cargando notificaciones", e);
    }
  };

  fetchPending();
  timer = setInterval(fetchPending, 5000);

  return () => clearInterval(timer);
}, []);



  // Polling: estado de la solicitud creada por Buyer (cada 3s)
  
  useEffect(() => {
    if (!createdRequestId || !currentUserId) return;

    let timer = null;

    const pollStatus = async () => {
      try {
        const res = await api.get(
          `/api/purchase-requests/${createdRequestId}/buyer/${currentUserId}/can-see-bank`
        );

        const newStatus = res.data.status;
        setRequestStatus(newStatus);

        // aviso si cambia a accepted/rejected
        if (newStatus && newStatus !== "PENDING") {
          setBuyerNotice(
            newStatus === "ACCEPTED"
              ? "✅ Tu solicitud fue ACEPTADA. Ya puedes ver los datos del vendedor."
              : "❌ Tu solicitud fue RECHAZADA por el vendedor."
          );
          clearInterval(timer);
        }
      } catch {

      }
    };

    pollStatus();
    timer = setInterval(pollStatus, 3000);

    return () => clearInterval(timer);
  }, [createdRequestId, currentUserId]);

  const total = useMemo(() => {
    if (!selected) return 0;
    return Number(selected.product.price) * Number(selected.qty);
  }, [selected]);

  const addSingle = (p) => {
    setError("");
    const qty = parseInt(qtyInput[p.id] ?? 1, 10);
    if (isNaN(qty) || qty <= 0) return alert("Cantidad inválida");
    if (qty > p.quantity) return alert("No hay stock suficiente");
    setSelected({ product: p, qty });
  };

  const clearSelection = () => setSelected(null);


  //Buyer: crear solicitud PENDING (NO baja stock)
  
  const solicitarCompra = async () => {
    if (!selected) return alert("Primero añade un producto al detalle.");
    if (!currentUserId) return alert("No se pudo identificar al usuario (ID).");

    setActionLoading(true);
    setError("");
    setBuyerNotice("");

    try {
      const payload = {
        productId: selected.product.id,
        buyerId: currentUserId,
        quantity: selected.qty,
      };

      const res = await api.post("/api/purchase-requests", payload);

      setCreatedRequestId(res.data.id);
      setRequestStatus("PENDING");

      setSelectedSeller(selected.product.seller || null);
      setOpenSeller(true);

      setSelected(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Error solicitando compra");
    } finally {
      setActionLoading(false);
    }
  };

  
  //Vendedor: aceptar/rechazar solicitud (stock baja SOLO si acepta)
  
  const acceptRequest = async (req) => {
    if (!currentUserId) return alert("No se pudo identificar al vendedor (ID).");

    setActionLoading(true);
    setError("");

    try {
      await api.post(`/api/purchase-requests/${req.id}/accept`, {
        sellerId: currentUserId,
      });

      // refresca productos y pendientes
      await loadProducts();

      const res = await api.get(
        `/api/purchase-requests/seller/${currentUserId}/pending`
      );
      setPendingRequests(res.data.requests || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Error aceptando solicitud");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRequest = async (req) => {
    if (!currentUserId) return alert("No se pudo identificar al vendedor (ID).");

    setActionLoading(true);
    setError("");

    try {
      await api.post(`/api/purchase-requests/${req.id}/reject`, {
        sellerId: currentUserId,
      });

      const res = await api.get(
        `/api/purchase-requests/seller/pending`
      );
      setPendingRequests(res.data.requests || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Error rechazando solicitud");
    } finally {
      setActionLoading(false);
    }
  };

  
  // Update/Delete producto (solo dueño)
 
  const isOwner = (p) => {
    const sellerId = p.seller_id || p.seller?.id || p.seller?.user_id;
    return sellerId && currentUserId && Number(sellerId) === Number(currentUserId);
  };

  const updateProduct = async (p) => {
    if (!isOwner(p)) return alert("Solo el dueño puede editar este producto.");

    const name = prompt("Nuevo nombre:", p.name);
    if (name === null) return;

    const description = prompt("Nueva descripción:", p.description);
    if (description === null) return;

    const priceStr = prompt("Nuevo precio:", String(p.price));
    if (priceStr === null) return;
    const price = Number(priceStr);

    const qtyStr = prompt("Nuevo stock (cantidad):", String(p.quantity));
    if (qtyStr === null) return;
    const quantity = Number(qtyStr);

    if (!name.trim()) return alert("Nombre inválido");
    if (!description.trim()) return alert("Descripción inválida");
    if (isNaN(price) || price < 0) return alert("Precio inválido");
    if (isNaN(quantity) || quantity < 0) return alert("Cantidad inválida");

    setActionLoading(true);
    setError("");

    try {
      await api.put(`/api/products/${p.id}`, {
        name: name.trim(),
        description: description.trim(),
        price,
        quantity,
      });
      await loadProducts();
    } catch (e) {
      setError(e?.response?.data?.message || "Error actualizando producto");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProduct = async (p) => {
    if (!isOwner(p)) return alert("Solo el dueño puede eliminar este producto.");
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;

    setActionLoading(true);
    setError("");

    try {
      await api.delete(`/api/products/${p.id}`);
      await loadProducts();
    } catch (e) {
      setError(e?.response?.data?.message || "Error eliminando producto");
    } finally {
      setActionLoading(false);
    }
  };

  const displayUsername = me?.username || usernameLS;

  return (
    <div className="min-h-screen bg-white">
      {/* top bar */}
      <div className="sticky top-0 z-10 border-b border-eco-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-eco-100 flex items-center justify-center font-bold text-eco-800">
              ♻
            </div>
            <div>
              <div className="font-semibold text-eco-900">EcoCanje</div>
              <div className="text-xs text-eco-900/60">Marketplace reciclaje</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-eco-900">{displayUsername}</div>
              <div className="text-xs text-eco-900/60">Sesión activa</div>
            </div>

            {/* 🔔 Solicitudes del vendedor */}
            <button
              onClick={() => setOpenRequests(true)}
              className="rounded-xl border border-eco-200 px-4 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
              title="Solicitudes pendientes"
            >
              🔔 Solicitudes ({pendingRequests.length})
            </button>

            <button
              onClick={() => setOpenAdd(true)}
              className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700"
            >
              Vender / Publicar
            </button>

            <button
              onClick={onLogout}
              className="rounded-xl border border-eco-200 px-4 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-eco-900">Productos disponibles</h1>

          <button
            onClick={loadProducts}
            className="rounded-xl border border-eco-200 px-4 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
          >
            Refrescar
          </button>
        </div>

        {buyerNotice && (
          <div className="mt-4 rounded-xl bg-eco-50 border border-eco-200 p-3 text-sm text-eco-900">
            {buyerNotice}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {(loading || actionLoading) && (
          <div className="mt-6">
            <Loader label={loading ? "Cargando productos..." : "Procesando..."} />
          </div>
        )}

        {!loading && products.length === 0 ? (
          <div className="mt-6 rounded-xl border border-eco-100 p-4 text-sm text-eco-900/70">
            No hay productos con stock disponible.
          </div>
        ) : !loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {products.map((p) => {
              const sellerName =
                p.seller?.full_name?.trim() || p.seller?.username || "Vendedor";

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-eco-100 bg-white p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-eco-900">{p.name}</div>
                      <div className="text-sm text-eco-900/70">{p.description}</div>

                      <div className="mt-2 text-xs text-eco-900/60">
                        Vendedor:{" "}
                        <span className="font-semibold text-eco-900">{sellerName}</span>
                      </div>
                    </div>

                    <div className="rounded-full bg-eco-100 px-3 py-1 text-sm font-semibold text-eco-800">
                      ${Number(p.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-eco-900/80">
                    Stock: <span className="font-semibold text-eco-900">{p.quantity}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      className="w-28 rounded-xl border border-eco-200 px-3 py-2 text-sm outline-none focus:border-eco-500"
                      type="number"
                      min={1}
                      max={p.quantity}
                      value={qtyInput[p.id] ?? 1}
                      onChange={(e) =>
                        setQtyInput((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                    />

                    <button
                      onClick={() => addSingle(p)}
                      className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700"
                    >
                      Añadir
                    </button>

                    {/*SOLO DUEÑO: Update/Delete */}
                    {isOwner(p) && (
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => updateProduct(p)}
                          className="rounded-xl border border-eco-200 px-3 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteProduct(p)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Detalle compra */}
        <div className="mt-8 rounded-2xl border border-eco-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-eco-900">Detalle</div>
              <div className="text-sm text-eco-900/60">
                Puedes solicitar compra de 1 producto a la vez.
              </div>
            </div>

            {selected && (
              <button
                onClick={clearSelection}
                className="rounded-xl border border-eco-200 px-3 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
              >
                Quitar
              </button>
            )}
          </div>

          {!selected ? (
            <div className="mt-4 text-sm text-eco-900/70">
              No has añadido ningún producto todavía.
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-eco-100 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-eco-900">{selected.product.name}</div>
                  <div className="text-sm text-eco-900/70">{selected.product.description}</div>
                  <div className="mt-2 text-sm text-eco-900/80">
                    Cantidad: <span className="font-semibold">{selected.qty}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-eco-900/70">Total</div>
                  <div className="text-lg font-bold text-eco-900">${total.toFixed(2)}</div>
                </div>
              </div>

              <button
                onClick={solicitarCompra}
                disabled={actionLoading}
                className="mt-4 w-full rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 disabled:bg-eco-200 disabled:text-eco-500"
              >
                {actionLoading ? "Procesando..." : "Solicitar compra"}
              </button>

              {createdRequestId && (
                <div className="mt-3 text-xs text-eco-900/60">
                  Solicitud creada: <span className="font-semibold">#{createdRequestId}</span> ·
                  Estado: <span className="font-semibold">{requestStatus || "PENDING"}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal info vendedor + estado */}
      <SellerInfoModal
        open={openSeller}
        onClose={() => setOpenSeller(false)}
        seller={selectedSeller}
        requestStatus={requestStatus}
      />

      {/* Modal solicitudes vendedor */}
      <PurchaseRequestsModal
        open={openRequests}
        onClose={() => setOpenRequests(false)}
        requests={pendingRequests}
        onAccept={acceptRequest}
        onReject={rejectRequest}
        loading={actionLoading}
      />

      {/* modal publicar producto */}
      <AddProductModal open={openAdd} onClose={() => setOpenAdd(false)} onCreated={loadProducts} />
    </div>
  );
}
