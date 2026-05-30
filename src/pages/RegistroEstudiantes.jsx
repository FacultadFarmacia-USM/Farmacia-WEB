import React, { useState } from 'react';

// --- DATOS SIMULADOS (MOCK) ---
// Cuando conectes tu base de datos, esta información vendrá de tu servidor.
const mockEstudiantes = [
  {
    id: "V-30136503",
    nombres: "Luis Andrés",
    apellidos: "Garrido Macuarisma",
    correo: "luisgarrido1806@email.com",
    telefono: "0412-5066735",
    etapa: "Pasantía 1",
    estado: "Activo",
    farmatodo: {
      rif: "V-30136503-5",
      ciudad: "San Antonio de los Altos",
      sucursal1: "San Antonio",
      sucursal2: "La cascada"
    },
    historial: [
      { fecha: "15 May 2026", evento: "Formulario Inicial Farmatodo completado." },
      { fecha: "20 May 2026", evento: "Aprobada solicitud de pasantía." }
    ]
  },
  {
    id: "V-26987654",
    nombres: "Carlos Luis",
    apellidos: "Mendoza",
    correo: "carlos.m@email.com",
    telefono: "0412-9876543",
    etapa: "Registro",
    estado: "Pendiente",
    farmatodo: null, // Aún no ha llenado el formulario
    historial: [
      { fecha: "28 May 2026", evento: "Creado perfil en el sistema." }
    ]
  },
  {
    id: "V-24555777",
    nombres: "Ana Sofía",
    apellidos: "Rojas",
    correo: "ana.rojas@email.com",
    telefono: "0424-5557777",
    etapa: "Pasantía 2",
    estado: "Completado P1",
    farmatodo: {
      rif: "V-24555777-0",
      ciudad: "San Antonio",
      sucursal1: "Los Salias",
      sucursal2: "Recta de las Minas"
    },
    historial: [
      { fecha: "10 Feb 2026", evento: "Formulario Inicial Farmatodo completado." },
      { fecha: "30 Mar 2026", evento: "Finaliza Pasantía 1 con éxito." },
      { fecha: "05 Abr 2026", evento: "Apertura de expediente Pasantía 2." }
    ]
  }
];

export default function RegistroEstudiantes() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState('Todas');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null); // Controla si vemos la lista o un perfil

  // Lógica de filtrado y búsqueda
  const estudiantesFiltrados = mockEstudiantes.filter((estudiante) => {
    const coincideBusqueda = 
      estudiante.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
      estudiante.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      estudiante.id.includes(busqueda);
    
    const coincideEtapa = filtroEtapa === 'Todas' || estudiante.etapa === filtroEtapa;

    return coincideBusqueda && coincideEtapa;
  });

  // --- VISTA 2: PERFIL DEL ESTUDIANTE ---
  if (estudianteSeleccionado) {
    return (
      <div className="space-y-6 pb-20">
        {/* Botón de regreso */}
        <button 
          onClick={() => setEstudianteSeleccionado(null)}
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver al Directorio
        </button>

        {/* Encabezado del Perfil */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex items-center gap-6 shadow-sm">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold">
            {estudianteSeleccionado.nombres.charAt(0)}{estudianteSeleccionado.apellidos.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">{estudianteSeleccionado.nombres} {estudianteSeleccionado.apellidos}</h1>
            <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-sm">badge</span> {estudianteSeleccionado.id}
            </p>
          </div>
          <div className="ml-auto text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              estudianteSeleccionado.estado === 'Activo' ? 'bg-secondary-container text-on-secondary-container' : 
              estudianteSeleccionado.estado === 'Pendiente' ? 'bg-tertiary-container text-on-tertiary-container' : 
              'bg-primary-container text-on-primary-container'
            }`}>
              {estudianteSeleccionado.estado}
            </span>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">Etapa: {estudianteSeleccionado.etapa}</p>
          </div>
        </div>

        {/* Cajas de Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Datos Personales y de Contacto */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">contact_page</span>
              <h2>Datos de Contacto</h2>
            </div>
            <div className="space-y-3 text-sm">
              <p><strong className="text-on-surface">Correo:</strong> {estudianteSeleccionado.correo}</p>
              <p><strong className="text-on-surface">Teléfono:</strong> {estudianteSeleccionado.telefono}</p>
            </div>
          </div>

          {/* Datos Farmatodo (Si existen) */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-secondary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">storefront</span>
              <h2>Formulario Pasantía 1 (Farmatodo)</h2>
            </div>
            {estudianteSeleccionado.farmatodo ? (
              <div className="space-y-3 text-sm">
                <p><strong className="text-on-surface">RIF:</strong> {estudianteSeleccionado.farmatodo.rif}</p>
                <p><strong className="text-on-surface">Ciudad:</strong> {estudianteSeleccionado.farmatodo.ciudad}</p>
                <p><strong className="text-on-surface">Opción 1:</strong> {estudianteSeleccionado.farmatodo.sucursal1}</p>
                <p><strong className="text-on-surface">Opción 2:</strong> {estudianteSeleccionado.farmatodo.sucursal2}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-on-surface-variant/70 text-center">
                <span className="material-symbols-outlined mb-1">pending_actions</span>
                <p className="text-xs">Aún no ha llenado la planilla inicial.</p>
              </div>
            )}
          </div>

          {/* Historial de Actividades */}
          <div className="md:col-span-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">history</span>
              <h2>Historial Académico y Formularios</h2>
            </div>
            <ul className="space-y-3 mt-2 relative border-l-2 border-outline-variant ml-3 pl-4">
              {estudianteSeleccionado.historial.map((item, index) => (
                <li key={index} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 bg-primary rounded-full"></div>
                  <p className="text-xs font-bold text-primary">{item.fecha}</p>
                  <p className="text-sm text-on-surface">{item.evento}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 1: DIRECTORIO DE ESTUDIANTES ---
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Directorio de Estudiantes</h1>
        <p className="text-sm text-on-surface-variant">Busca alumnos y revisa su progreso y datos de pasantía.</p>
      </div>

      {/* Controles: Buscador y Filtro */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Buscador */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Buscar por cédula, nombre o apellido..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>
        
        {/* Filtro Dropdown */}
        <div className="w-full md:w-64 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">filter_list</span>
          <select 
            value={filtroEtapa}
            onChange={(e) => setFiltroEtapa(e.target.value)}
            className="w-full pl-10 pr-8 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="Todas">Todas las etapas</option>
            <option value="Registro">Solo Registro</option>
            <option value="Pasantía 1">Pasantía 1 (Galénica)</option>
            <option value="Pasantía 2">Pasantía 2 (Hospitalaria)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="p-4">Cédula</th>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Etapa Actual</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {estudiantesFiltrados.length > 0 ? (
                estudiantesFiltrados.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-mono text-sm">{estudiante.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-primary">{estudiante.nombres} {estudiante.apellidos}</p>
                      <p className="text-xs text-on-surface-variant">{estudiante.correo}</p>
                    </td>
                    <td className="p-4 text-sm">{estudiante.etapa}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        estudiante.estado === 'Activo' ? 'bg-secondary-container text-on-secondary-container' : 
                        estudiante.estado === 'Pendiente' ? 'bg-tertiary-container text-on-tertiary-container' : 
                        'bg-primary-container text-on-primary-container'
                      }`}>
                        {estudiante.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setEstudianteSeleccionado(estudiante)}
                        className="text-sm bg-surface-container-high text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors"
                      >
                        Ver Perfil
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">
                    No se encontraron estudiantes con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}