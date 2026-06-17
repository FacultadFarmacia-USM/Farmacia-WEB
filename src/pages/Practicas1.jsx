import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Practicas1() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [statsEstados, setStatsEstados] = useState({ Activo: 0, Inactivo: 0, Pendiente: 0, Total: 0 });
  const [statsSucursales, setStatsSucursales] = useState([]);

  // --- ESTADOS PARA EL PERFIL Y EDICIÓN ---
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({});

  const cargarDatosPracticas = async () => {
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
        .eq('etapa', 'Pasantía 1')
        .order('creado_en', { ascending: false });

      if (error) throw error;

      const estudiantesPracticas = data || [];
      setEstudiantes(estudiantesPracticas);

      const conteoEstados = { Activo: 0, Inactivo: 0, Pendiente: 0, Total: estudiantesPracticas.length };
      const conteoSucursales = {};

      estudiantesPracticas.forEach(est => {
        const estadoActual = est.estado || 'Activo';
        if (conteoEstados[estadoActual] !== undefined) {
          conteoEstados[estadoActual]++;
        }

        const dataCrudaFarmatodo = est.pasantia_farmatodo;
        const infoFarmatodo = Array.isArray(dataCrudaFarmatodo) ? dataCrudaFarmatodo[0] : (dataCrudaFarmatodo || null);
        
        if (infoFarmatodo && infoFarmatodo.farmatodo_sucursales) {
          infoFarmatodo.farmatodo_sucursales.forEach(suc => {
            if (suc.sucursal) {
              const nombreSucursal = suc.sucursal.trim();
              conteoSucursales[nombreSucursal] = (conteoSucursales[nombreSucursal] || 0) + 1;
            }
          });
        }
      });

      setStatsEstados(conteoEstados);

      const sucursalesArray = Object.keys(conteoSucursales).map(key => ({
        nombre: key,
        cantidad: conteoSucursales[key]
      })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5); 

      setStatsSucursales(sucursalesArray);

    } catch (error) {
      console.error('Error al cargar Pasantía 1:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosPracticas();
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
      etapa: estudianteSeleccionado.etapa || 'Pasantía 1',
      estado: estudianteSeleccionado.estado || 'Activo',
      estatus_pasantia1: estudianteSeleccionado.estatus_pasantia1 || 'Pendiente'
    });
    setModoEdicion(true);
  };

  const manejarCambioEdicion = (e) => {
    setDatosEdicion({ ...datosEdicion, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    try {
      setCargando(true);
      
      // 1. Aislamos solo los datos que realmente vamos a modificar (Evita errores silenciosos de BD)
      const estatusSeleccionado = datosEdicion.estatus_pasantia1;
      const nuevaEtapa = estatusSeleccionado === 'Aprobado' ? 'En espera' : datosEdicion.etapa;

      const paqueteDeActualizacion = {
        estado: datosEdicion.estado,
        etapa: nuevaEtapa,
        estatus_pasantia1: estatusSeleccionado,
        nombres: datosEdicion.nombres, // Solo si también quieres que se edite el nombre
        apellidos: datosEdicion.apellidos
      };

      // 2. Ejecutamos la actualización y le agregamos .select() para forzar respuesta
      const { data, error } = await supabase
        .from('estudiantes')
        .update(paqueteDeActualizacion)
        .eq('id_estudiante', estudianteSeleccionado.id_estudiante)
        .select(); 

      if (error) throw error;

      // 3. Validación de seguridad: Si data viene vacío, la BD bloqueó la acción
      if (!data || data.length === 0) {
        throw new Error("No se pudo actualizar. Posible bloqueo de permisos (RLS) en Supabase.");
      }

      // 4. Procesamos el éxito
      if (estatusSeleccionado === 'Aprobado') {
        alert(`✅ Estudiante evaluado como APROBADO.\nSu etapa actual ahora es: "En espera"`);
        
        // Lo sacamos visualmente al instante para una experiencia super rápida
        setEstudiantes((prev) => prev.filter(est => est.id_estudiante !== estudianteSeleccionado.id_estudiante));
        setEstudianteSeleccionado(null); 
      } else {
        alert('✅ Datos actualizados correctamente.');
        setEstudianteSeleccionado({ ...estudianteSeleccionado, ...paqueteDeActualizacion });
      }
      
      setModoEdicion(false);
      
      // 5. Refrescamos la tabla desde la BD con await
      await cargarDatosPracticas(); 

    } catch (error) {
      console.error('Error detallado al actualizar:', error);
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
      cargarDatosPracticas(); 

    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(`❌ Error al eliminar: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // FUNCIÓN CORREGIDA PARA PREVENIR EL DESFASE HORARIO 🛠️
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    
    // Si la cadena mide 10 caracteres (YYYY-MM-DD), forzamos mediodía en la conversión
    // para evitar que los husos horarios negativos de Latam resten un día completo.
    const esFechaPura = fechaISO.length === 10 && fechaISO.includes('-');
    const fecha = esFechaPura ? new Date(fechaISO + 'T12:00:00') : new Date(fechaISO);
    
    return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // --- VISTA: PERFIL DEL ESTUDIANTE (Si hay uno seleccionado) ---
  if (estudianteSeleccionado) {
    const dataCrudaFarmatodo = estudianteSeleccionado.pasantia_farmatodo;
    const infoFarmatodo = Array.isArray(dataCrudaFarmatodo) ? dataCrudaFarmatodo[0] : (dataCrudaFarmatodo || null);
    
    const sucursal1 = infoFarmatodo?.farmatodo_sucursales?.find(s => s.prioridad === 1)?.sucursal;
    const sucursal2 = infoFarmatodo?.farmatodo_sucursales?.find(s => s.prioridad === 2)?.sucursal;

    const historialReal = [{ fecha: formatearFecha(estudianteSeleccionado.creado_en), evento: "Perfil creado e ingresado al sistema." }];
    if (infoFarmatodo) {
      historialReal.unshift({ fecha: formatearFecha(infoFarmatodo.creado_en), evento: "Formulario Inicial de Pasantías Farmatodo completado." });
    }

    return (
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <button onClick={() => { setEstudianteSeleccionado(null); setModoEdicion(false); }} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined text-base">arrow_back</span> Volver a Prácticas 1
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
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Fecha Nacimiento</label>
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
                <label className="block text-xs font-bold text-primary text-left md:text-right mt-4 border-t border-outline-variant pt-2">
                  Evaluación Práctica 1
                </label>
                <select 
                  name="estatus_pasantia1" 
                  value={datosEdicion.estatus_pasantia1} 
                  onChange={manejarCambioEdicion} 
                  className="px-3 py-2 text-sm border-2 border-primary/50 focus:border-primary rounded-lg bg-primary/5 font-semibold text-primary"
                >
                  <option value="Pendiente">Pendiente de Evaluar</option>
                  <option value="Aprobado">✅ Aprobado</option>
                  <option value="Reprobado">❌ Reprobado</option>
                </select>
              </div>
            ) : (
              <>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${estudianteSeleccionado.estado === 'Activo' ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>
                  {estudianteSeleccionado.estado || 'Activo'}
                </span>
                <p className="text-xs text-on-surface-variant mt-2 font-medium">Etapa: {estudianteSeleccionado.etapa || 'Pasantía 1'}</p>
                <div className="mt-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant inline-block text-left md:text-right w-full md:w-auto">
                  <p className="text-xs text-on-surface-variant font-bold mb-1">Resultado Práctica 1:</p>
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold tracking-wide border
                    ${estudianteSeleccionado.estatus_pasantia1 === 'Aprobado' ? 'bg-success/10 text-success border-success/30' : 
                      estudianteSeleccionado.estatus_pasantia1 === 'Reprobado' ? 'bg-error/10 text-error border-error/30' : 
                      'bg-surface-container-high text-on-surface-variant border-outline-variant'}`}>
                    {estudianteSeleccionado.estatus_pasantia1 === 'Aprobado' ? '✅ APROBADO' : 
                     estudianteSeleccionado.estatus_pasantia1 === 'Reprobado' ? '❌ REPROBADO' : 
                     '⏳ PENDIENTE'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined">contact_page</span><h2>Datos de Contacto</h2>
            </div>
            {modoEdicion ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Correo</label>
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-on-surface-variant/70 text-center">
                <span className="material-symbols-outlined mb-1">pending_actions</span>
                <p className="text-xs">No ha llenado la planilla de Farmatodo.</p>
              </div>
            )}
          </div>

          {!modoEdicion && (
            <div className="md:col-span-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold border-b border-outline-variant pb-2">
                <span className="material-symbols-outlined">history</span><h2>Historial Académico</h2>
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

        {modoEdicion && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-lowest border border-outline-variant shadow-xl p-4 rounded-2xl flex items-center gap-4 z-50">
            <p className="text-sm font-bold text-primary mr-4">¿Guardar cambios?</p>
            <button onClick={() => setModoEdicion(false)} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors text-on-surface-variant">Cancelar</button>
            <button onClick={guardarCambios} disabled={cargando} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-opacity-90 transition-all">
              <span className={`material-symbols-outlined text-[18px] ${cargando ? 'animate-spin' : ''}`}>save</span> Guardar
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA PRINCIPAL: TABLA DE PRÁCTICAS Y GRÁFICAS ---
  const estudiantesFiltrados = estudiantes.filter((estudiante) => {
    const termino = busqueda.toLowerCase();
    return (
      (estudiante.nombres || '').toLowerCase().includes(termino) || 
      (estudiante.apellidos || '').toLowerCase().includes(termino) ||
      (estudiante.cedula || '').includes(termino)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Prácticas 1 (Farmatodo)</h1>
          <p className="text-sm text-on-surface-variant">Métricas en tiempo real y listado de estudiantes asignados.</p>
        </div>
        <button onClick={cargarDatosPracticas} disabled={cargando} className="text-xs bg-surface-container-high text-primary font-semibold hover:bg-primary hover:text-white px-3 py-2 rounded-xl border border-outline-variant transition-colors flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${cargando ? 'animate-spin' : ''}`}>refresh</span> Actualizar
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center p-12 text-primary">
          <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
        </div>
      ) : (
        <>
          {/* Gráficas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-lg">donut_large</span> Estatus Actual</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1"><span className="text-3xl font-black text-primary">{statsEstados.Total}</span><span className="text-xs text-on-surface-variant font-medium pb-1">Alumnos en total</span></div>
                <div><div className="flex justify-between text-xs font-bold mb-1"><span className="text-success">Activos</span><span>{statsEstados.Activo}</span></div><div className="w-full bg-surface-container-highest rounded-full h-2.5"><div className="bg-success h-2.5 rounded-full" style={{ width: `${statsEstados.Total > 0 ? (statsEstados.Activo / statsEstados.Total) * 100 : 0}%` }}></div></div></div>
                <div><div className="flex justify-between text-xs font-bold mb-1"><span className="text-tertiary">Pendientes</span><span>{statsEstados.Pendiente}</span></div><div className="w-full bg-surface-container-highest rounded-full h-2.5"><div className="bg-tertiary h-2.5 rounded-full" style={{ width: `${statsEstados.Total > 0 ? (statsEstados.Pendiente / statsEstados.Total) * 100 : 0}%` }}></div></div></div>
                <div><div className="flex justify-between text-xs font-bold mb-1"><span className="text-error">Inactivos / Retirados</span><span>{statsEstados.Inactivo}</span></div><div className="w-full bg-surface-container-highest rounded-full h-2.5"><div className="bg-error h-2.5 rounded-full" style={{ width: `${statsEstados.Total > 0 ? (statsEstados.Inactivo / statsEstados.Total) * 100 : 0}%` }}></div></div></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-lg">store</span> Top Sucursales Solicitadas</h2>
              <div className="space-y-4">
                {statsSucursales.length === 0 ? <p className="text-sm text-on-surface-variant text-center py-6">No hay datos aún.</p> : statsSucursales.map((suc, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-on-surface-variant w-4">{i + 1}.</span>
                    <div className="flex-1"><div className="flex justify-between text-xs font-bold mb-1"><span className="text-primary truncate max-w-[200px]">{suc.nombre}</span><span>{suc.cantidad} sol.</span></div><div className="w-full bg-surface-container-highest rounded-full h-2"><div className="bg-primary opacity-80 h-2 rounded-full" style={{ width: `${(suc.cantidad / statsSucursales[0].cantidad) * 100}%` }}></div></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla con Buscador */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm mt-8">
            <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">groups</span><h3 className="font-bold text-primary">Listado de Prácticas 1</h3></div>
               <div className="relative w-full md:w-72"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span><input type="text" placeholder="Buscar por cédula o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm" /></div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="p-4">Cédula</th>
                    <th className="p-4">Estudiante</th>
                    <th className="p-4">Ciudad Asignada</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {estudiantesFiltrados.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-on-surface-variant">No hay resultados.</td></tr> : estudiantesFiltrados.map((estudiante) => {
                    const info = Array.isArray(estudiante.pasantia_farmatodo) ? estudiante.pasantia_farmatodo[0] : (estudiante.pasantia_farmatodo || null);
                    return (
                      <tr key={estudiante.id_estudiante} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-4 font-mono text-sm font-bold text-on-surface">{estudiante.cedula}</td>
                        <td className="p-4"><p className="font-bold text-primary">{estudiante.nombres} {estudiante.apellidos}</p><p className="text-xs text-on-surface-variant">{estudiante.correo}</p></td>
                        <td className="p-4 text-sm font-medium text-on-surface-variant"><span className="material-symbols-outlined text-[16px] align-middle mr-1">location_on</span>{info ? info.ciudad : 'Sin asignar'}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${estudiante.estado === 'Activo' || !estudiante.estado ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>{estudiante.estado || 'Activo'}</span></td>
                        <td className="p-4 text-center">
                          <button onClick={() => setEstudianteSeleccionado(estudiante)} className="text-sm bg-surface-container-high text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors border border-outline-variant/30">
                            Ver Perfil
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