import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Practicas2() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [statsEstados, setStatsEstados] = useState({ Activo: 0, Inactivo: 0, Pendiente: 0, Total: 0 });
  const [statsEmpresas, setStatsEmpresas] = useState([]); 

  // --- ESTADOS PARA EL PERFIL Y EDICIÓN ---
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({});

  const cargarDatosPracticas2 = async () => {
    try {
      setCargando(true);
      // Usamos (*) para traer todo lo de pasantia_practicas2 sin riesgo de equivocarnos en un nombre
      const { data, error } = await supabase
        .from('estudiantes')
        .select(`
          *,
          pasantia_practicas2 (*)
        `)
        .eq('etapa', 'Pasantía 2') 
        .order('creado_en', { ascending: false });

      if (error) throw error;

      const estudiantesPracticas = data || [];
      setEstudiantes(estudiantesPracticas);

      if (estudianteSeleccionado) {
        const actualizado = estudiantesPracticas.find(e => e.id_estudiante === estudianteSeleccionado.id_estudiante);
        if (actualizado) setEstudianteSeleccionado(actualizado);
      }

      // Calcular estadísticas usando el nombre correcto: empresa_nombre
      const conteoEstados = { Activo: 0, Inactivo: 0, Pendiente: 0, Total: estudiantesPracticas.length };
      const conteoEmpresas = {};

      estudiantesPracticas.forEach(est => {
        const estadoActual = est.estado || 'Activo';
        if (conteoEstados[estadoActual] !== undefined) {
          conteoEstados[estadoActual]++;
        }

        const infoPasantia2 = Array.isArray(est.pasantia_practicas2) ? est.pasantia_practicas2[0] : est.pasantia_practicas2;
        if (infoPasantia2 && infoPasantia2.empresa_nombre) {
          const nombreEmpresa = infoPasantia2.empresa_nombre.trim();
          conteoEmpresas[nombreEmpresa] = (conteoEmpresas[nombreEmpresa] || 0) + 1;
        }
      });

      setStatsEstados(conteoEstados);

      const empresasArray = Object.keys(conteoEmpresas).map(key => ({
        nombre: key,
        cantidad: conteoEmpresas[key]
      })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5); 

      setStatsEmpresas(empresasArray);

    } catch (error) {
      console.error('Error al cargar Pasantía 2:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosPracticas2();
  }, []);

  // --- FUNCIONES DE EDICIÓN DEL PERFIL ---
  const iniciarEdicion = () => {
    setDatosEdicion({
      nombres: estudianteSeleccionado.nombres,
      apellidos: estudianteSeleccionado.apellidos,
      cedula: estudianteSeleccionado.cedula,
      correo: estudianteSeleccionado.correo,
      telefono: estudianteSeleccionado.telefono,
      fecha_nacimiento: estudianteSeleccionado.fecha_nacimiento,
      etapa: estudianteSeleccionado.etapa || 'Pasantía 2',
      estado: estudianteSeleccionado.estado || 'Activo',
      estatus_pasantia2: estudianteSeleccionado.estatus_pasantia2 || 'Pendiente'
    });
    setModoEdicion(true);
  };

  const manejarCambioEdicion = (e) => {
    setDatosEdicion({ ...datosEdicion, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    try {
      setCargando(true);
      const datosAEnviar = { ...datosEdicion };

      if (datosAEnviar.estatus_pasantia2 === 'Aprobado') {
        datosAEnviar.etapa = 'Culminado'; 
      }

      const { error } = await supabase
        .from('estudiantes')
        .update(datosAEnviar)
        .eq('id_estudiante', estudianteSeleccionado.id_estudiante);

      if (error) throw error;

      if (datosAEnviar.estatus_pasantia2 === 'Aprobado') {
        alert(`🎉 ¡Felicidades! Estudiante evaluado como APROBADO en Prácticas 2.\nSu etapa actual ahora es: "Culminado"`);
        setEstudianteSeleccionado(null); 
      } else {
        alert('✅ Datos actualizados correctamente.');
        setEstudianteSeleccionado({ ...estudianteSeleccionado, ...datosAEnviar });
      }
      
      setModoEdicion(false);
      cargarDatosPracticas2(); 

    } catch (error) {
      console.error('Error al actualizar Prácticas 2:', error);
      alert(`❌ Error al actualizar: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const eliminarEstudiante = async () => {
    const confirmacion = window.confirm(`⚠️ ADVERTENCIA CRÍTICA:\n¿Estás seguro de que deseas ELIMINAR a ${estudianteSeleccionado.nombres}?`);
    if (!confirmacion) return;

    try {
      setCargando(true);
      const { error } = await supabase
        .from('estudiantes')
        .delete()
        .eq('id_estudiante', estudianteSeleccionado.id_estudiante);

      if (error) throw error;

      alert('🗑️ Estudiante eliminado con éxito.');
      setEstudianteSeleccionado(null); 
      cargarDatosPracticas2(); 

    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(`❌ Error al eliminar: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    const esFechaPura = fechaISO.length === 10 && fechaISO.includes('-');
    const fecha = esFechaPura ? new Date(fechaISO + 'T12:00:00') : new Date(fechaISO);
    return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // --- VISTA: PERFIL DEL ESTUDIANTE ---
  if (estudianteSeleccionado) {
    const infoPasantia2 = Array.isArray(estudianteSeleccionado.pasantia_practicas2) 
      ? estudianteSeleccionado.pasantia_practicas2[0] 
      : (estudianteSeleccionado.pasantia_practicas2 || null);

    return (
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <button onClick={() => { setEstudianteSeleccionado(null); setModoEdicion(false); }} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined text-base">arrow_back</span> Volver a Prácticas 2
          </button>

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

        {/* Encabezado Perfil */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
          <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex shrink-0 items-center justify-center text-3xl font-bold">
            {(estudianteSeleccionado.nombres || 'E').charAt(0)}{(estudianteSeleccionado.apellidos || 'S').charAt(0)}
          </div>
          
          <div className="flex-1 w-full">
            {modoEdicion ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombres</label>
                  <input type="text" name="nombres" value={datosEdicion.nombres} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Apellidos</label>
                  <input type="text" name="apellidos" value={datosEdicion.apellidos} onChange={manejarCambioEdicion} className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg" />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-secondary">{estudianteSeleccionado.nombres} {estudianteSeleccionado.apellidos}</h1>
                <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm">badge</span> Cédula: {estudianteSeleccionado.cedula}
                </p>
              </div>
            )}
          </div>

          <div className="md:ml-auto md:text-right w-full md:w-auto">
            {modoEdicion ? (
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-bold text-on-surface-variant text-left md:text-right">Estado</label>
                <select name="estado" value={datosEdicion.estado} onChange={manejarCambioEdicion} className="px-3 py-2 text-sm border border-outline-variant rounded-lg">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                <label className="block text-xs font-bold text-secondary text-left md:text-right mt-2">Evaluación Práctica 2</label>
                <select name="estatus_pasantia2" value={datosEdicion.estatus_pasantia2} onChange={manejarCambioEdicion} className="px-3 py-2 text-sm border-2 border-secondary focus:border-secondary rounded-lg bg-secondary/5 font-semibold text-secondary">
                  <option value="Pendiente">Pendiente de Evaluar</option>
                  <option value="Aprobado">✅ Aprobado</option>
                  <option value="Reprobado">❌ Reprobado</option>
                </select>
              </div>
            ) : (
              <>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-secondary-container text-on-secondary-container">
                  {estudianteSeleccionado.estado || 'Activo'}
                </span>
                <div className="mt-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant text-left md:text-right">
                  <p className="text-xs text-on-surface-variant font-bold mb-1">Resultado Práctica 2:</p>
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold tracking-wide border
                    ${estudianteSeleccionado.estatus_pasantia2 === 'Aprobado' ? 'bg-success/10 text-success border-success/30' : 
                      estudianteSeleccionado.estatus_pasantia2 === 'Reprobado' ? 'bg-error/10 text-error border-error/30' : 
                      'bg-surface-container-high text-on-surface-variant border-outline-variant'}`}>
                    {estudianteSeleccionado.estatus_pasantia2 === 'Aprobado' ? '✅ APROBADO' : 
                     estudianteSeleccionado.estatus_pasantia2 === 'Reprobado' ? '❌ REPROBADO' : 
                     '⏳ PENDIENTE'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bloques de Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-3">
            <div className="flex items-center gap-2 text-secondary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">contact_page</span><h2>Contacto General</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong className="text-on-surface">Correo:</strong> {estudianteSeleccionado.correo}</p>
              <p><strong className="text-on-surface">Teléfono:</strong> {estudianteSeleccionado.telefono || 'No registrado'}</p>
              <p><strong className="text-on-surface">F. Nacimiento:</strong> {formatearFecha(estudianteSeleccionado.fecha_nacimiento)}</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-3">
            <div className="flex items-center gap-2 text-secondary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">assignment</span><h2>Formulario de Ubicación Prácticas 2</h2>
            </div>
            {infoPasantia2 ? (
              <div className="space-y-2 text-sm">
                {/* Aquí usamos los nombres reales de la BD */}
                <p><strong className="text-on-surface">Institución/Empresa:</strong> {infoPasantia2.empresa_nombre || 'Pendiente'}</p>
                <p><strong className="text-on-surface">Tutor Empresarial:</strong> {infoPasantia2.tutor_nombre || 'No asignado'}</p>
                <p><strong className="text-on-surface">Cargo del Tutor:</strong> {infoPasantia2.tutor_cargo || 'Por definir'}</p>
                <p><strong className="text-on-surface">Horas a cursar:</strong> {infoPasantia2.cant_horas || 'No especificado'}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-on-surface-variant/70 text-center">
                <span className="material-symbols-outlined mb-1">pending_actions</span>
                <p className="text-xs">Formulario de Prácticas 2 pendiente por completar.</p>
              </div>
            )}
          </div>
        </div>

        {modoEdicion && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-lowest border border-outline-variant shadow-xl p-4 rounded-2xl flex items-center gap-4 z-50">
            <button onClick={() => setModoEdicion(false)} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container-high text-on-surface-variant">Cancelar</button>
            <button onClick={guardarCambios} disabled={cargando} className="bg-secondary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span> Guardar Cambios
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA PRINCIPAL ---
  const estudiantesFiltrados = estudiantes.filter((est) => {
    const termino = busqueda.toLowerCase();
    return (
      (est.nombres || '').toLowerCase().includes(termino) || 
      (est.apellidos || '').toLowerCase().includes(termino) ||
      (est.cedula || '').includes(termino)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight">Prácticas 2</h1>
          <p className="text-sm text-on-surface-variant">Seguimiento de alumnos en la última fase de pasantías e inserción institucional.</p>
        </div>
        <button onClick={cargarDatosPracticas2} disabled={cargando} className="text-xs bg-surface-container-high text-secondary font-semibold hover:bg-secondary hover:text-white px-3 py-2 rounded-xl border border-outline-variant transition-colors flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${cargando ? 'animate-spin' : ''}`}>refresh</span> Actualizar
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center p-12 text-secondary">
          <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
        </div>
      ) : (
        <>
          {/* Métricas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-lg">analytics</span> Estatus Prácticas 2</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-end"><span className="text-3xl font-black text-secondary">{statsEstados.Total}</span><span className="text-xs text-on-surface-variant font-medium">Alumnos en Fase Final</span></div>
                <div><div className="flex justify-between text-xs font-bold mb-1"><span className="text-success">Activos</span><span>{statsEstados.Activo}</span></div><div className="w-full bg-surface-container-highest rounded-full h-2.5"><div className="bg-success h-2.5 rounded-full" style={{ width: `${statsEstados.Total > 0 ? (statsEstados.Activo / statsEstados.Total) * 100 : 0}%` }}></div></div></div>
                <div><div className="flex justify-between text-xs font-bold mb-1"><span className="text-error">Inactivos</span><span>{statsEstados.Inactivo}</span></div><div className="w-full bg-surface-container-highest rounded-full h-2.5"><div className="bg-error h-2.5 rounded-full" style={{ width: `${statsEstados.Total > 0 ? (statsEstados.Inactivo / statsEstados.Total) * 100 : 0}%` }}></div></div></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-lg">domain</span> Destinos / Empresas Top</h2>
              <div className="space-y-4">
                {statsEmpresas.length === 0 ? <p className="text-sm text-on-surface-variant text-center py-6">Falta asignar empresas en las planillas.</p> : statsEmpresas.map((emp, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-on-surface-variant w-4">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-bold mb-1"><span className="text-secondary truncate max-w-[200px]">{emp.nombre}</span><span>{emp.cantidad} alumnos</span></div>
                      <div className="w-full bg-surface-container-highest rounded-full h-2"><div className="bg-secondary opacity-80 h-2 rounded-full" style={{ width: `${(emp.cantidad / statsEmpresas[0].cantidad) * 100}%` }}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de registros */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm mt-8">
            <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary">assignment_ind</span><h3 className="font-bold text-secondary">Alumnos en Cursado</h3></div>
               <div className="relative w-full md:w-72"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span><input type="text" placeholder="Buscar por cédula o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm" /></div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="p-4">Cédula</th>
                    <th className="p-4">Estudiante</th>
                    <th className="p-4">Empresa/Lugar</th>
                    <th className="p-4">Estatus Práctica 2</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {estudiantesFiltrados.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-on-surface-variant">No hay estudiantes en Prácticas 2 con los criterios de búsqueda.</td></tr> : estudiantesFiltrados.map((est) => {
                    const info2 = Array.isArray(est.pasantia_practicas2) ? est.pasantia_practicas2[0] : (est.pasantia_practicas2 || null);
                    return (
                      <tr key={est.id_estudiante} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-4 font-mono text-sm font-bold text-on-surface">{est.cedula}</td>
                        <td className="p-4"><p className="font-bold text-secondary">{est.nombres} {est.apellidos}</p><p className="text-xs text-on-surface-variant">{est.correo}</p></td>
                        <td className="p-4 text-sm font-medium text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] align-middle mr-1">business</span>
                          {/* Aquí también usamos empresa_nombre */}
                          {info2 ? info2.empresa_nombre : 'Por asignar'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                            ${est.estatus_pasantia2 === 'Aprobado' ? 'bg-success-container text-on-success-container' : 
                              est.estatus_pasantia2 === 'Reprobado' ? 'bg-error-container text-on-error-container' : 
                              'bg-surface-container-high text-on-surface-variant'}`}>
                            {est.estatus_pasantia2 || 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => setEstudianteSeleccionado(est)} className="text-sm bg-surface-container-high text-secondary px-4 py-2 rounded-lg font-bold hover:bg-secondary hover:text-white transition-colors border border-outline-variant/30">
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}