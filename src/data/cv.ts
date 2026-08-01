import type { CvData } from '../types/cv'

export const cv: CvData = {
  nombre: 'José María Vizcaíno',
  titulo: 'Software Engineer',
  ubicacion: 'Alicante, España',
  email: '[email-eliminado]',
  telefono: '[telefono eliminado]',
  resumen:
    'Titulado en Administración de Sistemas Informáticos en Red (ASIR). ' +
    'Software Engineer con experiencia en automatización y orquestación de ' +
    'procesos (Control-M), desarrollo RPA con Python y administración de ' +
    'sistemas Linux y Windows.',
  experiencia: [
    {
      empresa: 'NTT DATA',
      puesto: 'Software Engineer',
      desde: '07/2023',
      hasta: 'Actualidad',
      actual: true,
      // TODO: el usuario debe confirmar/actualizar estos logros
      logros: [
        'Gestión y desarrollo de orquestador de procesos automatizados mediante Control-M',
        'Transferencias de ficheros automatizadas',
        'Resolución de problemas y soporte a usuarios',
        'Administración de sistemas Linux y Windows',
        'Gestión de bases de datos SQL',
      ],
    },
    {
      empresa: 'Redarquia Digital',
      puesto: 'Desarrollador RPA y Administrador de Sistemas',
      desde: '10/2022',
      hasta: '07/2023',
      logros: [
        'Desarrollos de automatizaciones RPA usando Python',
        'Desarrollo en plataformas LowCode/NoCode',
        'Diseño de bases de datos',
        'CI/CD con Jenkins',
      ],
    },
    {
      empresa: 'Azaconsa S.L',
      puesto: 'Responsable de Informática y parte del equipo de compras',
      desde: '09/2021',
      hasta: '10/2022',
      logros: [
        'Soporte técnico a usuarios',
        'Control de procesos y planificación de producción',
        'Gestión de Windows Server y aplicaciones SGA/ERP',
        'Gestión de compras y aprovisionamiento',
        'Configuración y administración de copias de seguridad',
      ],
    },
    {
      empresa: 'Ayuntamiento de Aspe',
      puesto: 'Prácticas FCT — Ayudante de Administrador de Sistemas',
      desde: '03/2018',
      hasta: '06/2018',
      logros: [
        'Soporte microinformático y redes',
        'Administración de Windows Server y Active Directory',
        'Planificación de redes informáticas',
        'Gestión de copias de seguridad',
      ],
    },
  ],
  skills: [
    // Desarrollo
    { nombre: 'Python', categoria: 'Desarrollo' },
    { nombre: 'RPA (Python)', categoria: 'Desarrollo' },
    { nombre: 'SQL', categoria: 'Desarrollo' },
    { nombre: 'CI/CD (Jenkins)', categoria: 'Desarrollo' },
    { nombre: 'LowCode / NoCode', categoria: 'Desarrollo' },
    // Sistemas
    { nombre: 'Linux', categoria: 'Sistemas' },
    { nombre: 'Windows Server', categoria: 'Sistemas' },
    { nombre: 'SysAdmin', categoria: 'Sistemas' },
    { nombre: 'Active Directory', categoria: 'Sistemas' },
    { nombre: 'Redes', categoria: 'Sistemas' },
    { nombre: 'Copias de seguridad', categoria: 'Sistemas' },
    // Automatización
    { nombre: 'Control-M', categoria: 'Automatización' },
    { nombre: 'Orquestación de procesos', categoria: 'Automatización' },
    { nombre: 'Transferencia de ficheros', categoria: 'Automatización' },
    // Soft skills
    { nombre: 'Trabajo en equipo', categoria: 'Soft skills' },
    { nombre: 'Aprendizaje rápido', categoria: 'Soft skills' },
    { nombre: 'Autogestión', categoria: 'Soft skills' },
    { nombre: 'Autodidacta', categoria: 'Soft skills' },
  ],
  educacion: [
    {
      titulo:
        'Ciclo Formativo de Grado Superior en Administración de Sistemas Informáticos en Red (ASIR)',
      centro: 'I.E.S. Severo Ochoa, Elche (Alicante)',
      anio: '2020',
    },
    {
      titulo:
        'Ciclo Formativo de Grado Medio en Sistemas Microinformáticos y Redes (SMR)',
      centro: 'I.E.S. Villa de Aspe, Aspe (Alicante)',
      anio: '2018',
    },
  ],
  idiomas: [
    { nombre: 'Español', nivel: 'Nativo' },
    { nombre: 'Valenciano', nivel: 'Nativo' },
    { nombre: 'Inglés', nivel: 'A2' },
  ],
  proyectos: [], // ⭐ Sección oculta hasta que haya proyectos que mostrar
}
