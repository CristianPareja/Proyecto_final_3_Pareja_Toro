export default function ProductCard({ product, onBuy, buying }) {
  return (
    <div className="rounded-2xl border border-eco-100 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-eco-900">{product.name}</h3>
          <p className="mt-1 text-sm text-eco-900/75">{product.description}</p>
        </div>
        <span className="rounded-full bg-eco-100 px-3 py-1 text-xs font-semibold text-eco-800">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-eco-900/80">
          Stock: <span className="font-semibold text-eco-900">{product.quantity}</span>
        </p>

        <button
          disabled={buying || product.quantity <= 0}
          onClick={() => onBuy(product)}
          className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 disabled:bg-eco-200 disabled:text-eco-500"
        >
          {buying ? "Comprando..." : product.quantity <= 0 ? "Sin stock" : "Comprar"}
        </button>
      </div>
    </div>
  );
}
