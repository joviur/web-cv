export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 border border-line px-2 py-0.5 text-[11px] text-muted transition-colors hover:border-phos hover:text-phos"
      aria-label="Descargar CV en PDF"
    >
      <svg
        viewBox="0 0 16 16"
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        <path d="M8 2v8M4.5 7.5 8 11l3.5-3.5M2.5 13.5h11" />
      </svg>
      [PDF]
    </button>
  )
}
