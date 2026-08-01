export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded border px-2 py-1 text-xs transition-colors hover:border-sky-500"
      aria-label="Descargar CV en PDF"
    >
      PDF
    </button>
  )
}
