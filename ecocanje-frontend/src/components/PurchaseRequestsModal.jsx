// src/components/PurchaseRequestsModal.jsx
export default function PurchaseRequestsModal({
  open,
  onClose,
  requests,
  onAccept,
  onReject,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl border border-eco-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-eco-900">Solicitudes de compra</h3>
            <p className="text-sm text-eco-900/70">
              Acepta o rechaza solicitudes. El stock solo baja si aceptas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-eco-200 px-3 py-1.5 text-sm font-semibold text-eco-900 hover:bg-eco-50"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4">
          {requests.length === 0 ? (
            <div className="rounded-xl border border-eco-100 p-4 text-sm text-eco-900/70">
              No tienes solicitudes pendientes.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-eco-100 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-eco-900">
                        Producto: {r.product?.name || `#${r.product_id}`}
                      </div>
                      <div className="text-sm text-eco-900/70">
                        Cantidad solicitada: <span className="font-semibold">{r.quantity}</span>
                      </div>
                      <div className="mt-2 text-xs text-eco-900/60">
                        Comprador:{" "}
                        <span className="font-semibold text-eco-900">
                          {r.buyer?.username || `#${r.buyer_id}`}
                        </span>{" "}
                        · Tel:{" "}
                        <span className="font-semibold text-eco-900">
                          {r.buyer?.phone || "No registrado"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-semibold rounded-full bg-eco-100 text-eco-800 px-3 py-1">
                      {r.status}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      disabled={loading}
                      onClick={() => onReject(r)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Rechazar
                    </button>

                    <button
                      disabled={loading}
                      onClick={() => onAccept(r)}
                      className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 disabled:bg-eco-200 disabled:text-eco-500"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {requests.length > 0 && (
          <div className="mt-4 text-xs text-eco-900/60">
            * Al aceptar, el stock se reduce en el backend. Al rechazar, no cambia el stock.
          </div>
        )}
      </div>
    </div>
  );
}
