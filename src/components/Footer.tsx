import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function Footer() {
  const { t } = useLang()

  return (
    <footer
      id="contacto"
      className="mt-6 border-t border-line py-8 text-xs text-muted"
    >
      <div className="mx-auto flex max-w-[780px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6">
        <a
          href={`mailto:${cv.email}`}
          className="text-phos transition-colors hover:underline"
        >
          {cv.email}
        </a>
        <span className="flex flex-wrap items-center gap-x-2">
          <a
            href={`tel:${cv.telefono.replace(/\s/g, '')}`}
            className="text-phos transition-colors hover:underline"
          >
            {cv.telefono}
          </a>
          <span aria-hidden="true">·</span>
          <span>{cv.ubicacion}</span>
        </span>
        <span>{cv.idiomas.map((i) => `${i.nombre} (${i.nivel})`).join(' · ')}</span>
      </div>
      <p className="mx-auto mt-6 max-w-[780px] px-6 text-[11px] text-line">
        [ {t('footer.fin')} ]
      </p>
    </footer>
  )
}
