export default function Header({ username, onLogout, onOpenSell }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-eco-100 text-eco-800 font-bold">
            ♻
          </div>
          <div>
            <h1 className="text-lg font-semibold text-eco-900">EcoCanje</h1>
            <p className="text-xs text-eco-900/70">Marketplace reciclaje</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-eco-900">{username}</p>
            <p className="text-xs text-eco-700">Sesión activa</p>
          </div>

          <button
            onClick={onOpenSell}
            className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 active:scale-[0.99]"
          >
            Vender
          </button>

          <button
            onClick={onLogout}
            className="rounded-xl border border-eco-200 px-4 py-2 text-sm font-semibold text-eco-900 hover:bg-eco-50"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
