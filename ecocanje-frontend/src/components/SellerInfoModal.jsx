// src/components/SellerInfoModal.jsx
export default function SellerInfoModal({ open, onClose, seller, requestStatus }) {
  if (!open) return null;

  const field = (label, value) => (
    <div className="flex items-start justify-between gap-4 border-b border-eco-100 py-2">
      <div className="text-sm font-medium text-eco-900">{label}</div>
      <div className="text-sm text-eco-900/80 text-right break-all">
        {value || "No registrado"}
      </div>
    </div>
  );

  const statusPill = () => {
    if (!requestStatus) return null;
    const isAccepted = requestStatus === "ACCEPTED";
    const isRejected = requestStatus === "REJECTED";

    const cls = isAccepted
      ? "bg-eco-100 text-eco-800"
      : isRejected
      ? "bg-red-50 text-red-700"
      : "bg-yellow-50 text-yellow-700";

    const text = isAccepted ? "ACEPTADA" : isRejected ? "RECHAZADA" : "PENDIENTE";
    return <div className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{text}</div>;
  };

  const bankUnlocked = requestStatus === "ACCEPTED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-eco-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-eco-900">Información del vendedor</h3>
              {statusPill()}
            </div>

            <p className="text-sm text-eco-900/70">
              Primero el vendedor debe aceptar. La transferencia se habilita solo si acepta.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-eco-200 px-3 py-1.5 text-sm font-semibold text-eco-900 hover:bg-eco-50"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-eco-100 p-3">
          {field("Usuario", seller?.username)}
          {field("Nombre", seller?.full_name || seller?.username)}
          {field("Teléfono", seller?.phone)}
        </div>

        <div className="mt-4 rounded-xl border border-eco-100 p-3">
          <div className="text-sm font-semibold text-eco-900 mb-2">Transferencia</div>

          {!bankUnlocked ? (
            <div className="text-sm text-eco-900/70">
              Datos bancarios bloqueados:{" "}
              <span className="font-semibold">pendiente de aprobación del vendedor.</span>
            </div>
          ) : (
            <>
              {/* para mostrar informacion bancaria */}
              {field("Banco", seller?.bank_name)}
              {field("Tipo de cuenta", seller?.account_type)}
              {field("Número de cuenta", seller?.account_number)}
              <div className="mt-2 text-xs text-eco-900/60">
                ✅ Solicitud aceptada. Ahora puedes coordinar pago y entrega.
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-xs text-eco-900/60">
          * App académica. El pago/entrega se coordinan fuera de la plataforma.
        </div>
      </div>
    </div>
  );
}
