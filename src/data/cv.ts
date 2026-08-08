import type { CvData } from '../types/cv'

export const cv: CvData = {
  nombre: 'José María Vizcaíno',
  titulo: 'Software Developer — Backend, Automation & DevOps-oriented',
  ubicacion: 'Alicante, España',
  resumen:
    'Software Developer con perfil híbrido de backend, automatización e infraestructura ' +
    'en entornos corporativos. Python, .NET, SQL Server, Docker/Podman, APIs REST ' +
    'y procesos batch.',
  experiencia: [
    {
      empresa: 'NTT DATA',
      puesto: 'Software Developer',
      desde: '07/2024',
      hasta: 'Actualidad',
      actual: true,
      logros: [
        'Desarrollo y mantenimiento de aplicaciones corporativas: .NET, ASP.NET Web Forms, .NET Core, Python y JavaScript',
        'APIs REST en .NET Core con autenticación y autorización JWT',
        'Automatizaciones en Python: procesos batch, ETL, validaciones, informes e integración entre sistemas (FastAPI, pandas, SQLAlchemy, Playwright)',
        'Administración de infraestructura: Windows Server, IIS, máquinas virtuales, Docker/Podman y Compose',
        'Gestión de bases de datos SQL Server: consultas, diseño y mantenimiento de estructuras, usuarios y backups',
        'Logging rotativo, trazabilidad de procesos y notificaciones automáticas por correo y Microsoft Teams',
        'Análisis funcional y técnico con cliente y usuarios de negocio — proyecto de telecomunicaciones para Orange',
      ],
    },
    {
      empresa: 'Nunsys - Sothis',
      puesto: 'Software Engineer',
      desde: '07/2023',
      hasta: '06/2024',
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
    { nombre: 'C# / .NET', categoria: 'Desarrollo' },
    { nombre: 'ASP.NET (Core / Web Forms)', categoria: 'Desarrollo' },
    { nombre: 'REST APIs / JWT', categoria: 'Desarrollo' },
    { nombre: 'FastAPI', categoria: 'Desarrollo' },
    { nombre: 'SQL Server', categoria: 'Desarrollo' },
    { nombre: 'pandas / SQLAlchemy', categoria: 'Desarrollo' },
    { nombre: 'Playwright', categoria: 'Desarrollo' },
    { nombre: 'React (básico)', categoria: 'Desarrollo' },
    { nombre: 'Git / GitLab', categoria: 'Desarrollo' },
    // Sistemas
    { nombre: 'Linux', categoria: 'Sistemas' },
    { nombre: 'Windows Server', categoria: 'Sistemas' },
    { nombre: 'IIS', categoria: 'Sistemas' },
    { nombre: 'Docker / Podman / Compose', categoria: 'Sistemas' },
    { nombre: 'Active Directory', categoria: 'Sistemas' },
    { nombre: 'Redes', categoria: 'Sistemas' },
    { nombre: 'Copias de seguridad', categoria: 'Sistemas' },
    // Automatización
    { nombre: 'Control-M', categoria: 'Automatización' },
    { nombre: 'RPA (Python)', categoria: 'Automatización' },
    { nombre: 'Procesos batch / ETL', categoria: 'Automatización' },
    { nombre: 'CI/CD (Jenkins)', categoria: 'Automatización' },
    // Soft skills — reformuladas como evidencia (anti-copy genérico)
    { nombre: 'Soporte a usuarios y operaciones en equipo', categoria: 'Soft skills' },
    { nombre: 'Análisis funcional y trato con cliente', categoria: 'Soft skills' },
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
  proyectos: [], // ⭐ Sección oculta hasta que haya proyectos que mostrar
}
