export interface PerfilTipeo {
  /** Caracteres por segundo objetivo. */
  cps: number
  /** Variación aleatoria por carácter, en fracción (±jitter). 0 = sin variación. */
  jitter: number
}

/**
 * Planifica el tipeo de `texto`: devuelve un delay (ms) por carácter,
 * el tiempo a esperar ANTES de imprimir cada carácter.
 *
 * `aleatorio` es inyectable para tests deterministas (default Math.random).
 * SPEC-hero-typing §5.1 — la pausa entre pasos vive en el engine del hero.
 */
export function planTipeo(
  texto: string,
  perfil: PerfilTipeo,
  aleatorio: () => number = Math.random,
): number[] {
  const base = 1000 / perfil.cps
  const delays: number[] = []
  for (let i = 0; i < texto.length; i++) {
    const factor = 1 - perfil.jitter + aleatorio() * perfil.jitter * 2
    delays.push(Math.round(base * factor))
  }
  return delays
}
