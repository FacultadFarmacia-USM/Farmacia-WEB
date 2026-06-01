import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Header from '../components/header';

export default function RegistroEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState('Todas');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  // --- NUEVOS ESTADOS PARA EDICIÓN ---
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({});

  const obtenerDirectorio = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('estudiantes')
        .select(`
          *,
          pasantia_farmatodo (
            *,
            farmatodo_sucursales (*)
          )
        `)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setEstudiantes(data || []);
    } catch (error) {
      console.error('Error al cargar directorio:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDirectorio();
  }, []);

  // --- FUNCIÓN PARA INICIAR EDICIÓN ---
  const iniciarEdicion = () => {
    setDatosEdicion({
      nombres: estudianteSeleccionado.nombres,
      apellidos: estudianteSeleccionado.apellidos,
      cedula: estudianteSeleccionado.cedula,
      correo: estudianteSeleccionado.correo,
      telefono: estudianteSeleccionado.telefono,
      fecha_nacimiento: estudianteSeleccionado.fecha_nacimiento,
      etapa: estudianteSeleccionado.etapa || 'Pasantía 1',
      estado: estudianteSeleccionado.estado || 'Activo'
    });
    setModoEdicion(true);
  };

  // --- FUNCIÓN PARA MANEJAR INPUTS DE EDICIÓN ---
  const manejarCambioEdicion = (e) => {
    setDatosEdicion({ ...datosEdicion, [e.target.name]: e.target.value });
  };

  // --- FUNCIÓN PARA GUARDAR CAMBIOS EN BD ---
  const guardarCambios = async () => {
    try {
      setCargando(true);
      const { error } = await supabase
        .from('estudiantes')
        .update(datosEdicion)
        .eq('id_estudiante', estudianteSeleccionado.id_estudiante);

      if (error) throw error;

      alert('✅ Datos del estudiante actualizados correctamente.');
      
      // Actualizamos la vista actual del perfil sin tener que recargar
      setEstudianteSeleccionado({ ...estudianteSeleccionado, ...datosEdicion });
      setModoEdicion(false);
      obtenerDirectorio(); // Refresca la lista de fondo

    } catch (error) {
      console.error('Error al actualizar:', error);
      alert(`❌ Hubo un error al actualizar: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // --- FUNCIÓN PARA ELIMINAR ESTUDIANTE ---
  const eliminarEstudiante = async () => {
    const confirmacion = window.confirm(`⚠️ ADVERTENCIA CRÍTICA:\n¿Estás absolutamente seguro de que deseas ELIMINAR a ${estudianteSeleccionado.nombres} ${estudianteSeleccionado.apellidos}?\n\nEsto borrará permanentemente sus datos y todas sus planillas de Farmatodo. Esta acción NO se puede deshacer.`);
    
    if (!confirmacion) return;

    try {
      setCargando(true);
      const { error } = await supabase
        .from('estudiantes')
        .delete()
        .eq('id_estudiante', estudianteSeleccionado.id_estudiante);

      if (error) throw error;

      alert('🗑️ Estudiante eliminado con éxito del sistema.');
      setEstudianteSeleccionado(null); // Regresa al directorio general
      obtenerDirectorio(); // Refresca la lista

    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(`❌ Error al eliminar. Revisa que hayas activado el Borrado en Cascada en SQL: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const estudiantesFiltrados = estudiantes.filter((estudiante) => {
    const coincideBusqueda = 
      (estudiante.nombres || '').toLowerCase().includes(busqueda.toLowerCase()) || 
      (estudiante.apellidos || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (estudiante.cedula || '').includes(busqueda);
    const coincideEtapa = filtroEtapa === 'Todas' || estudiante.etapa === filtroEtapa;
    return coincideBusqueda && coincideEtapa;
  });

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-VE', { 
      timeZone: 'UTC', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // --- VISTA 2: PERFIL DE UN ESTUDIANTE ---
  if (estudianteSeleccionado) {
    const dataCrudaFarmatodo = estudianteSeleccionado.pasantia_farmatodo;
    const infoFarmatodo = Array.isArray(dataCrudaFarmatodo) ? dataCrudaFarmatodo[0] : (dataCrudaFarmatodo || null);
    
    const sucursal1 = infoFarmatodo?.farmatodo_sucursales?.find(s => s.prioridad === 1)?.sucursal;
    const sucursal2 = infoFarmatodo?.farmatodo_sucursales?.find(s => s.prioridad === 2)?.sucursal;

    const historialReal = [{ fecha: formatearFecha(estudianteSeleccionado.creado_en), evento: "Perfil creado e ingresado al sistema de la Facultad." }];
    if (infoFarmatodo) {
      historialReal.unshift({ fecha: formatearFecha(infoFarmatodo.creado_en), evento: "Formulario Inicial de Pasantías Farmatodo completado y enviado." });
    }

    return (
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <button onClick={() => { setEstudianteSeleccionado(null); setModoEdicion(false); }} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined text-base">arrow_back</span> Volver al Directorio
          </button>

          {/* BOTONERA DE ACCIÓN DEL PROFESOR */}
          {!modoEdicion && (
            <div className="flex gap-2">
              <button onClick={iniciarEdicion} className="flex items-center gap-1 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">edit</span> Editar Perfil
              </button>
              <button onClick={eliminarEstudiante} className="flex items-center gap-1 bg-error-container text-on-error-container px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-error hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">delete</span> Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Encabezado del Perfil */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm relative">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex shrink-0 items-center justify-center text-3xl font-bold">
            {(estudianteSeleccionado.nombres || 'E').charAt(0)}{(estudianteSeleccionado.apellidos || 'S').charAt(0)}
          </div>
          
          <div className="flex-1 w-full">
            {modoEdicion ? (
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombres</label>
                    <input type="text" name="nombres" value={datosEdicion.nombres} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Apellidos</label>
                    <input type="text" name="apellidos" value={datosEdicion.apellidos} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Cédula</label>
                    <input type="text" name="cedula" value={datosEdicion.cedula} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Fecha de Nacimiento</label>
                    <input type="date" name="fecha_nacimiento" value={datosEdicion.fecha_nacimiento} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-primary">{estudianteSeleccionado.nombres} {estudianteSeleccionado.apellidos}</h1>
                <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm">badge</span> Cédula: {estudianteSeleccionado.cedula}
                </p>
              </div>
            )}
          </div>

          <div className="md:ml-auto md:text-right w-full md:w-auto">
            {modoEdicion ? (
              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                <label className="block text-xs font-bold text-on-surface-variant text-left md:text-right">Estado</label>
                <select name="estado" value={datosEdicion.estado} onChange={manejarCambioEdicion} className="px-3 py-2 text-sm border border-outline-variant rounded-lg">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
                <label className="block text-xs font-bold text-on-surface-variant text-left md:text-right mt-2">Etapa</label>
                <select name="etapa" value={datosEdicion.etapa} onChange={manejarCambioEdicion} className="px-3 py-2 text-sm border border-outline-variant rounded-lg">
                  <option value="Pasantía 1">Pasantía 1</option>
                  <option value="Pasantía 2">Pasantía 2</option>
                  <option value="En espera">En espera</option>
                </select>
              </div>
            ) : (
              <>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${estudianteSeleccionado.estado === 'Activo' ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>
                  {estudianteSeleccionado.estado || 'Activo'}
                </span>
                <p className="text-xs text-on-surface-variant mt-2 font-medium">Etapa: {estudianteSeleccionado.etapa || 'Pasantía 1'}</p>
              </>
            )}
          </div>
        </div>

        {/* Cajas de Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">contact_page</span><h2>Datos de Contacto</h2>
            </div>
            {modoEdicion ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Correo Electrónico</label>
                  <input type="email" name="correo" value={datosEdicion.correo} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Teléfono</label>
                  <input type="text" name="telefono" value={datosEdicion.telefono} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <p><strong className="text-on-surface">Correo:</strong> {estudianteSeleccionado.correo}</p>
                <p><strong className="text-on-surface">Teléfono:</strong> {estudianteSeleccionado.telefono || 'No registrado'}</p>
                <p><strong className="text-on-surface">F. Nacimiento:</strong> {formatearFecha(estudianteSeleccionado.fecha_nacimiento)}</p>
              </div>
            )}
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-secondary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">storefront</span><h2>Formulario Pasantía 1 (Farmatodo)</h2>
            </div>
            {infoFarmatodo ? (
              <div className="space-y-3 text-sm">
                <p><strong className="text-on-surface">RIF:</strong> {estudianteSeleccionado.rif || 'No registrado'}</p>
                <p><strong className="text-on-surface">Ciudad asignada:</strong> {infoFarmatodo.ciudad}</p>
                <p><strong className="text-on-surface">Opción 1:</strong> {sucursal1 || 'N/A'}</p>
                <p><strong className="text-on-surface">Opción 2:</strong> {sucursal2 || 'N/A'}</p>
                <p><strong className="text-on-surface">Cuenta Mercantil:</strong> {infoFarmatodo.cuenta_mercantil || 'No posee / No registrada'}</p>
                {/* LÍNEA NUEVA AGREGADA AQUÍ ABAJO */}
                <p><strong className="text-on-surface">Trabajador Activo:</strong> {infoFarmatodo.empleado_activo || 'No especificado'}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-on-surface-variant/70 text-center">
                <span className="material-symbols-outlined mb-1">pending_actions</span>
                <p className="text-xs">Este estudiante aún no ha llenado la planilla de Farmatodo.</p>
              </div>
            )}
          </div>

          {!modoEdicion && (
            <div className="md:col-span-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold border-b border-outline-variant pb-2">
                <span className="material-symbols-outlined">history</span><h2>Historial Académico y Formularios</h2>
              </div>
              <ul className="space-y-3 mt-2 relative border-l-2 border-outline-variant ml-3 pl-4">
                {historialReal.map((item, index) => (
                  <li key={index} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-primary rounded-full"></div>
                    <p className="text-xs font-bold text-primary capitalize">{item.fecha}</p>
                    <p className="text-sm text-on-surface">{item.evento}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* BARRA FLOTANTE DE GUARDADO (Aparece solo en modo edición) */}
        {modoEdicion && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-lowest border border-outline-variant shadow-xl p-4 rounded-2xl flex items-center gap-4 z-50">
            <p className="text-sm font-bold text-primary mr-4">¿Guardar cambios?</p>
            <button onClick={() => setModoEdicion(false)} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors text-on-surface-variant">
              Cancelar
            </button>
            <button onClick={guardarCambios} disabled={cargando} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50">
              <span className={`material-symbols-outlined text-[18px] ${cargando ? 'animate-spin' : ''}`}>{cargando ? 'sync' : 'save'}</span>
              Guardar
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA 1: DIRECTORIO DE ESTUDIANTES ---
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Directorio de Estudiantes</h1>
          <p className="text-sm text-on-surface-variant">Busca alumnos y revisa su progreso y datos de pasantía.</p>
        </div>
        <button onClick={obtenerDirectorio} disabled={cargando} className="text-xs bg-surface-container-high text-primary font-semibold hover:bg-primary hover:text-white px-3 py-2 rounded-xl border border-outline-variant transition-colors flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${cargando ? 'animate-spin' : ''}`}>refresh</span> Sincronizar
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input type="text" placeholder="Buscar por cédula, nombre o apellido..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm" />
        </div>
        <div className="w-full md:w-64 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">filter_list</span>
          <select value={filtroEtapa} onChange={(e) => setFiltroEtapa(e.target.value)} className="w-full pl-10 pr-8 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm appearance-none cursor-pointer">
            <option value="Todas">Todas las etapas</option>
            <option value="En espera">En espera</option>
            <option value="Pasantía 1">Pasantía 1</option>
            <option value="Pasantía 2">Pasantía 2</option>
          </select>
        </div>
      </div>

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
              {cargando ? (
                <tr><td colSpan="5" className="p-12 text-center text-on-surface-variant"><span className="material-symbols-outlined text-3xl animate-spin">sync</span></td></tr>
              ) : estudiantesFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-on-surface-variant">No se encontraron estudiantes registrados.</td></tr>
              ) : (
                estudiantesFiltrados.map((estudiante) => (
                  <tr key={estudiante.id_estudiante} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-mono text-sm font-bold text-on-surface">{estudiante.cedula}</td>
                    <td className="p-4"><p className="font-bold text-primary">{estudiante.nombres} {estudiante.apellidos}</p><p className="text-xs text-on-surface-variant">{estudiante.correo}</p></td>
                    <td className="p-4 text-sm font-medium text-on-surface-variant">{estudiante.etapa || 'Pasantía 1'}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${estudiante.estado === 'Activo' || !estudiante.estado ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>{estudiante.estado || 'Activo'}</span></td>
                    <td className="p-4 text-center"><button onClick={() => setEstudianteSeleccionado(estudiante)} className="text-sm bg-surface-container-high text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors border border-outline-variant/30">Ver Perfil</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}