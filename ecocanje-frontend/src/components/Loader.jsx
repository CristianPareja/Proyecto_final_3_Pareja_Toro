export default function Loader({ label = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-eco-200 border-t-eco-600" />
      <p className="text-sm text-eco-900/80">{label}</p>
    </div>
  );
}
