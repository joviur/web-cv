export type CategoriaSkill =
  | 'Desarrollo'
  | 'Sistemas'
  | 'Automatización'
  | 'Soft skills'

export interface Experiencia {
  empresa: string
  puesto: string
  desde: string // '07/2023'
  hasta: string // 'Actualidad' o '07/2023'
  actual?: boolean
  logros: string[]
}

export interface Skill {
  nombre: string
  categoria: CategoriaSkill
}

export interface Educacion {
  titulo: string
  centro: string
  anio: string
}

export interface Proyecto {
  nombre: string
  descripcion: string
  tecnologias: string[]
  url?: string
  repo?: string
}

export interface CvData {
  nombre: string
  titulo: string
  ubicacion: string
  resumen: string
  experiencia: Experiencia[]
  skills: Skill[]
  educacion: Educacion[]
  proyectos: Proyecto[]
}
