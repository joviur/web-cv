import { cv } from '../data/cv'

export function Hero() {
  const actual = cv.experiencia.find((e) => e.actual) ?? cv.experiencia[0]

  return (
    <section id="inicio" className="py-16">
      <p className="text-[13px] text-muted">
        <b className="font-medium text-phos">josema@dev</b>
        <span className="text-amber">:~</span>$ whoami
      </p>
      <h1 className="mt-5 text-[clamp(30px,5.4vw,46px)] font-bold leading-tight tracking-tight">
        José María Vizcaíno
        <span
          className="cursor-blink ml-1 inline-block h-[1.05em] w-[11px] bg-phos align-[-2px]"
          aria-hidden="true"
        />
      </h1>
      <p className="mt-3 text-[13px] font-medium text-phos">
        {cv.titulo} @ {actual.empresa}
      </p>
      <p className="mt-5 text-[13px] leading-relaxed text-muted">
        <b className="font-medium text-phos">josema@dev</b>
        <span className="text-amber">:~</span>$ cat cv.txt
      </p>
      <p className="mt-3 max-w-[46em] text-[13px] leading-relaxed text-muted">
        {cv.resumen}
      </p>
    </section>
  )
}
