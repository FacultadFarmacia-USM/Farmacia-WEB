import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

export default function FormsMenu() {
  // --- ESTADOS PARA PERÍODOS ACADÉMICOS ---
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [nuevoPeriodoNombre, setNuevoPeriodoNombre] = useState('');
  const [menuAbiertoId, setMenuAbiertoId] = useState(null); 
  
  // --- ESTADOS PARA ESTUDIANTES (PRACTICA 1) ---
  const [listaEstudiantes, setListaEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);

  // --- ESTADOS PARA ESTUDIANTES (PRACTICA 2) ---
  const [registrosPractica2, setRegistrosPractica2] = useState([]);
  const [cargandoPractica2, setCargandoPractica2] = useState(false);

  // ENLACES PÚBLICOS
  const urlPublicaFarmatodo = `${window.location.origin}/?view=alumno-farmatodo`;
  const urlPublicaIndustria = `${window.location.origin}/?view=alumno-industria`; 

  const copiarEnlace = (url) => {
    navigator.clipboard.writeText(url);
    alert("¡Enlace copiado! Ya puedes compartirlo con los alumnos.");
  };

  // 1. Cargar todos los períodos académicos al montar el componente
  const cargarPeriodos = async () => {
    const { data, error } = await supabase
      .from('periodos_academicos')
      .select('*')
      .order('id', { ascending: false });
    
    if (!error && data) {
      setPeriodos(data);
      const activo = data.find(p => p.activo === true);
      if (activo) setPeriodoSeleccionado(activo.id);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  // 2. Cargar estudiantes de Ambas Prácticas al cambiar el período
  useEffect(() => {
    if (!periodoSeleccionado) return;

    // Cargar Práctica 1 (Farmatodo)
    const cargarEstudiantesPorPeriodo = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from('estudiantes')
        .select(`
          nombres, 
          apellidos, 
          fecha_nacimiento, 
          cedula, 
          rif, 
          correo, 
          telefono, 
          direccion, 
          estado,
          pasantia_farmatodo!inner (
            ciudad, 
            cuenta_mercantil, 
            empleado_activo, 
            periodo_id,
            farmatodo_sucursales ( prioridad, sucursal )
          )
        `)
        .eq('pasantia_farmatodo.periodo_id', periodoSeleccionado);

      if (!error && data) {
        setListaEstudiantes(data);
      } else {
        setListaEstudiantes([]);
      }
      setCargando(false);
    };

    // Cargar Práctica 2 (Industria)
    const cargarPracticas2PorPeriodo = async () => {
      setCargandoPractica2(true);
      try {
        const { data, error } = await supabase
          .from('pasantia_practicas2')
          .select(`
            *,
            estudiantes (nombres, apellidos, cedula)
          `)
          .eq('periodo_id', periodoSeleccionado);

        if (error) throw error;
        setRegistrosPractica2(data || []);
      } catch (error) {
        console.error("Error cargando Práctica 2:", error);
        setRegistrosPractica2([]);
      }
      setCargandoPractica2(false);
    };

    cargarEstudiantesPorPeriodo();
    cargarPracticas2PorPeriodo();
  }, [periodoSeleccionado]);

  // --- FUNCIONES DE MANEJO DE PERÍODOS ---
  const handleCrearPeriodo = async (e) => {
    e.preventDefault();
    if (!nuevoPeriodoNombre.trim()) return;

    const { error } = await supabase
      .from('periodos_academicos')
      .insert([{ nombre: nuevoPeriodoNombre.trim(), activo: false }]);

    if (error) {
      alert("Error al crear el período: " + error.message);
    } else {
      setNuevoPeriodoNombre('');
      await cargarPeriodos();
      alert("¡Período creado con éxito! Ahora puedes activarlo en la lista.");
    }
  };

  const handleActivarPeriodo = async (idPeriodo) => {
    try {
      await supabase.from('periodos_academicos').update({ activo: false }).neq('id', idPeriodo);
      const { error } = await supabase.from('periodos_academicos').update({ activo: true }).eq('id', idPeriodo);

      if (error) throw error;

      await cargarPeriodos();
      alert("¡Período activado! Los nuevos alumnos que se registren caerán aquí.");
    } catch (err) {
      alert("Error al activar periodo: " + err.message);
    }
  };

  const handleEditarPeriodo = async (id, nombreActual) => {
    setMenuAbiertoId(null);
    const nuevoNombre = prompt("Modificar nombre de la cohorte:", nombreActual);
    
    if (!nuevoNombre || nuevoNombre.trim() === "" || nuevoNombre === nombreActual) return;

    const { error } = await supabase
      .from('periodos_academicos')
      .update({ nombre: nuevoNombre.trim() })
      .eq('id', id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      await cargarPeriodos();
      alert("¡Nombre actualizado correctamente!");
    }
  };

  const handleEliminarPeriodo = async (id, nombre) => {
    setMenuAbiertoId(null);
    const confirmar = window.confirm(`¿Estás completamente seguro de eliminar "${nombre}"?\nEsta acción no se puede deshacer.`);
    
    if (!confirmar) return;

    const { error } = await supabase
      .from('periodos_academicos')
      .delete()
      .eq('id', id);

    if (error) {
      alert("No se pudo borrar: Si este período ya tiene estudiantes postulados, el sistema impedirá su eliminación para proteger los datos.");
      console.error(error);
    } else {
      await cargarPeriodos();
      alert("Período eliminado con éxito.");
    }
  };

  // --- EXPORTACIONES A EXCEL ---
  const exportarExcelFiltrado = () => {
    if (listaEstudiantes.length === 0) {
      alert("No hay alumnos registrados en este periodo para exportar.");
      return;
    }

    const periodoNombre = periodos.find(p => p.id === Number(periodoSeleccionado))?.nombre || "Desconocido";
    
    const encabezados = [
      "Nombre", "Apellido", "Fecha de Nacimiento", "Cédula", "RIF", 
      "Correo", "Teléfono", "Dirección Habitación", "Ciudad", "Estado", 
      "Opción 1", "Opción 2"
    ];

    const filas = listaEstudiantes.map(estudiante => {
      const pasantiaRaw = estudiante.pasantia_farmatodo;
      const pasantia = Array.isArray(pasantiaRaw) ? pasantiaRaw[0] : (pasantiaRaw || {});
      const sucursales = pasantia.farmatodo_sucursales || [];
      const opc1 = sucursales.find(s => s.prioridad === 1)?.sucursal || 'N/A';
      const opc2 = sucursales.find(s => s.prioridad === 2)?.sucursal || 'N/A';

      return [
        estudiante.nombres,
        estudiante.apellidos,
        estudiante.fecha_nacimiento || 'N/A',
        estudiante.cedula,
        estudiante.rif,
        estudiante.correo,
        estudiante.telefono,
        estudiante.direccion || 'N/A',
        pasantia.ciudad || 'N/A',
        estudiante.estado || 'N/A',
        opc1,
        opc2
      ];
    });

    const contenidoCsv = [encabezados, ...filas]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\ufeff" + contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Postulados_Farmatodo_${periodoNombre.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarExcelPractica2 = () => {
    if (registrosPractica2.length === 0) {
      alert("No hay registros de Práctica 2 en este periodo para exportar.");
      return;
    }

    const periodoNombre = periodos.find(p => p.id === Number(periodoSeleccionado))?.nombre || "Desconocido";
    
    // Encabezados con TODOS los campos de la tabla
    const encabezados = [
      "Nombre", "Apellido", "Cédula", "Empresa", "Correo Empresa", "Telf. Empresa",
      "Carta Dirigida A", "Cargo Carta", "Tutor Nombre", "Tutor Cargo", "Tutor Correo", 
      "Tutor Teléfono", "Horas"
    ];

    const filas = registrosPractica2.map(reg => [
      reg.estudiantes?.nombres || 'N/A',
      reg.estudiantes?.apellidos || 'N/A',
      reg.estudiantes?.cedula || 'N/A',
      reg.empresa_nombre || 'N/A',
      reg.empresa_correo || 'N/A',
      reg.empresa_telefono || 'N/A',
      reg.carta_dirigida_a || 'N/A',
      reg.cargo_carta || 'N/A',
      reg.tutor_nombre || 'N/A',
      reg.tutor_cargo || 'N/A',
      reg.tutor_correo || 'N/A',
      reg.tutor_telefono || 'N/A',
      reg.cant_horas || 'N/A'
    ]);

    const contenidoCsv = [encabezados, ...filas]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\ufeff" + contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Registros_Industria_${periodoNombre.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ENCABEZADO PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Centro de Formularios</h1>
          <p className="text-sm text-on-surface-variant mt-1">Previsualiza las planillas y gestiona los enlaces de acceso para los alumnos.</p>
        </div>
        
        {/* FILTRO SELECTOR DE PERÍODO */}
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant p-2 rounded-xl shadow-sm w-full md:w-auto">
          <span className="material-symbols-outlined text-sm text-on-surface-variant pl-1">calendar_month</span>
          <select 
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className="bg-transparent text-sm font-semibold text-primary focus:outline-none pr-4 cursor-pointer"
          >
            {periodos.map(p => (
              <option key={p.id} value={p.id} className="text-on-surface">
                {p.nombre} {p.activo ? '🟢 (Activo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MODULO: CONTROL DE PERÍODOS ACADÉMICOS */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleCrearPeriodo} className="flex flex-col gap-2 justify-center border-b md:border-b-0 md:border-r border-outline-variant pb-4 md:pb-0 md:pr-6">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Crear Nueva Cohorte</span>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ej: Periodo 2026-II"
              value={nuevoPeriodoNombre}
              onChange={(e) => setNuevoPeriodoNombre(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-surface border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
            />
            <button type="submit" className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-opacity-90 transition-all">
              Añadir
            </button>
          </div>
        </form>

        <div className="md:col-span-2 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Historial y Conmutador de Estado Interno</span>
          <div className="flex flex-wrap gap-3 pb-1 selection:bg-transparent">
            {periodos.map(p => (
              <div 
                key={p.id} 
                className={`relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  p.activo 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' 
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}
              >
                <span>{p.nombre}</span>
                {p.activo ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                ) : (
                  <button 
                    onClick={() => handleActivarPeriodo(p.id)}
                    className="text-[10px] bg-white hover:bg-slate-100 border border-outline-variant text-primary px-2 py-0.5 rounded-md font-bold uppercase transition-all"
                  >
                    Activar
                  </button>
                )}

                {/* MENÚ DE TRES PUNTOS */}
                <div className="relative flex items-center ml-1 border-l border-outline-variant/60 pl-1">
                  <button
                    type="button"
                    onClick={() => setMenuAbiertoId(menuAbiertoId === p.id ? null : p.id)}
                    className="p-0.5 hover:bg-black/5 rounded-full transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-base block">more_vert</span>
                  </button>

                  {menuAbiertoId === p.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setMenuAbiertoId(null)} />
                      <div className="absolute right-0 top-full mt-1.5 bg-white border border-outline-variant rounded-xl shadow-xl z-30 py-1 min-w-[110px] text-on-surface animate-in fade-in slide-in-from-top-1 duration-100">
                        <button
                          type="button"
                          onClick={() => handleEditarPeriodo(p.id, p.nombre)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700"
                        >
                          <span className="material-symbols-outlined text-sm text-slate-400">edit</span>
                          Editar
                        </button>
                        <div className="border-t border-outline-variant/40 my-0.5"></div>
                        <button
                          type="button"
                          onClick={() => handleEliminarPeriodo(p.id, p.nombre)}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-1.5 text-[11px] font-bold text-red-600"
                        >
                          <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOQUE DE CONTENIDO: DISEÑO EN CUADRÍCULA DIRECTA (ARRIBA Y ABAJO) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* =======================
            FILA 1: PRÁCTICAS 1
            ======================= */}
        
        {/* FORMULARIO 1 (Columna Izquierda) */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold px-1">
            <span className="material-symbols-outlined">filter_1</span>
            <h2 className="uppercase tracking-widest text-xs">Pasantía 1: Farmacia Galénica</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-highest px-2 py-1 rounded">Vista Previa Real</span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">visibility</span>
              </div>
              <div className="h-48 rounded-lg border border-outline-variant shadow-inner overflow-hidden relative bg-white">
                <iframe 
                  src={urlPublicaFarmatodo} 
                  className="w-[200%] h-[200%] origin-top-left scale-50 border-none" 
                  title="Vista Previa Farmatodo"
                ></iframe>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-surface px-3 py-2 rounded-xl border border-outline-variant flex items-center justify-between gap-4">
                <div className="truncate text-xs font-mono text-on-surface flex-1">
                  {urlPublicaFarmatodo}
                </div>
              </div>
              <button 
                onClick={() => copiarEnlace(urlPublicaFarmatodo)}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span> Copiar Link
              </button>
            </div>
          </div>
        </div>

        {/* TABLA 1 (Columna Derecha) */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold px-1">
            <span className="material-symbols-outlined">group</span>
            <h2 className="uppercase tracking-widest text-xs">Alumnos Postulados en esta Cohorte (Pasantía 1)</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-4 flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-4 flex-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-low px-2 py-1 rounded">
                Registros en Tiempo Real ({listaEstudiantes.length})
              </span>

              <div className="border border-outline-variant rounded-xl overflow-hidden max-h-[250px] overflow-y-auto overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold border-b border-outline-variant sticky top-0 z-10">
                      <th className="p-2.5 pl-4">Nombre</th>
                      <th className="p-2.5">Apellido</th>
                      <th className="p-2.5">Fecha Nac.</th>
                      <th className="p-2.5">Cédula</th>
                      <th className="p-2.5">RIF</th>
                      <th className="p-2.5">Correo</th>
                      <th className="p-2.5">Teléfono</th>
                      <th className="p-2.5">Dirección</th>
                      <th className="p-2.5">Ciudad</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5">Opción 1</th>
                      <th className="p-2.5 pr-4">Opción 2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-xs text-on-surface">
                    {cargando ? (
                      <tr>
                        <td colSpan="12" className="text-center p-8 text-on-surface-variant italic">Cargando postulados...</td>
                      </tr>
                    ) : listaEstudiantes.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="text-center p-8 text-on-surface-variant italic">Ningún alumno inscrito en este período todavía.</td>
                      </tr>
                    ) : (
                      listaEstudiantes.map((estudiante, i) => {
                        const pasantiaRaw = estudiante.pasantia_farmatodo;
                        const pasantia = Array.isArray(pasantiaRaw) ? pasantiaRaw[0] : (pasantiaRaw || {});
                        const sucursales = pasantia.farmatodo_sucursales || [];
                        const opc1 = sucursales.find(s => s.prioridad === 1)?.sucursal || 'N/A';
                        const opc2 = sucursales.find(s => s.prioridad === 2)?.sucursal || 'N/A';
                        
                        return (
                          <tr key={i} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="p-2.5 pl-4 font-medium">{estudiante.nombres}</td>
                            <td className="p-2.5 font-medium">{estudiante.apellidos}</td>
                            <td className="p-2.5 font-mono">{estudiante.fecha_nacimiento || 'N/A'}</td>
                            <td className="p-2.5 font-mono">{estudiante.cedula}</td>
                            <td className="p-2.5 font-mono">{estudiante.rif}</td>
                            <td className="p-2.5">{estudiante.correo}</td>
                            <td className="p-2.5 font-mono">{estudiante.telefono}</td>
                            <td className="p-2.5 truncate max-w-[150px]" title={estudiante.direccion}>{estudiante.direccion || 'N/A'}</td>
                            <td className="p-2.5">{pasantia.ciudad || 'N/A'}</td>
                            <td className="p-2.5">{estudiante.estado || 'N/A'}</td>
                            <td className="p-2.5 text-primary font-medium truncate max-w-[120px]" title={opc1}>{opc1}</td>
                            <td className="p-2.5 pr-4 text-primary font-medium truncate max-w-[120px]" title={opc2}>{opc2}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant mt-auto">
              <button 
                onClick={exportarExcelFiltrado}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Exportar Data a Excel (.CSV)
              </button>
            </div>
          </div>
        </div>

        {/* =======================
            FILA 2: PRÁCTICAS 2
            ======================= */}
        
        {/* FORMULARIO 2 (Columna Izquierda) */}
        <div className="xl:col-span-1 flex flex-col gap-4 mt-4 xl:mt-0">
          <div className="flex items-center gap-2 text-secondary font-bold px-1">
            <span className="material-symbols-outlined">filter_2</span>
            <h2 className="uppercase tracking-widest text-xs">Pasantía 2: Industria</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-highest px-2 py-1 rounded">Vista Previa Real</span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">visibility</span>
              </div>
              <div className="h-48 rounded-lg border border-outline-variant shadow-inner overflow-hidden relative bg-[#001c3a]">
                <iframe 
                  src={urlPublicaIndustria} 
                  className="w-[200%] h-[200%] origin-top-left scale-50 border-none" 
                  title="Vista Previa Industria"
                ></iframe>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-surface px-3 py-2 rounded-xl border border-outline-variant flex items-center justify-between gap-4">
                <div className="truncate text-xs font-mono text-on-surface flex-1">
                  {urlPublicaIndustria}
                </div>
              </div>
              <button 
                onClick={() => copiarEnlace(urlPublicaIndustria)}
                className="w-full py-2.5 bg-secondary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span> Copiar Link
              </button>
            </div>
          </div>
        </div>

        {/* TABLA 2 (Columna Derecha) */}
        <div className="xl:col-span-2 flex flex-col gap-4 mt-4 xl:mt-0">
          <div className="flex items-center gap-2 text-secondary font-bold px-1">
            <span className="material-symbols-outlined">factory</span>
            <h2 className="uppercase tracking-widest text-xs">Alumnos Registrados en esta Cohorte (Pasantía 2)</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-4 flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-4 flex-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-low px-2 py-1 rounded">
                Registros en Tiempo Real ({registrosPractica2.length})
              </span>
              
              {/* Contenedor con overflow-x-auto para admitir el ancho de la tabla expandida */}
              <div className="border border-outline-variant rounded-xl overflow-hidden max-h-[250px] overflow-y-auto overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[1600px]">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold border-b border-outline-variant sticky top-0 z-10">
                      <th className="p-2.5 pl-4">Nombre</th>
                      <th className="p-2.5">Apellido</th>
                      <th className="p-2.5">Cédula</th>
                      <th className="p-2.5">Empresa</th>
                      <th className="p-2.5">Correo Empresa</th>
                      <th className="p-2.5">Telf. Empresa</th>
                      <th className="p-2.5">Carta Dirigida a</th>
                      <th className="p-2.5">Cargo Carta</th>
                      <th className="p-2.5">Tutor Nombre</th>
                      <th className="p-2.5">Tutor Cargo</th>
                      <th className="p-2.5">Tutor Correo</th>
                      <th className="p-2.5">Tutor Teléfono</th>
                      <th className="p-2.5 pr-4">Horas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-xs text-on-surface">
                    {cargandoPractica2 ? (
                      <tr>
                        <td colSpan="13" className="text-center p-8 text-on-surface-variant italic">Cargando registros...</td>
                      </tr>
                    ) : registrosPractica2.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="text-center p-8 text-on-surface-variant italic">Ningún registro en este período todavía.</td>
                      </tr>
                    ) : (
                      registrosPractica2.map((reg) => (
                        <tr key={reg.id} className="hover:bg-surface-container-low/40 transition-colors">
                          <td className="p-2.5 pl-4 font-medium">{reg.estudiantes?.nombres || 'N/A'}</td>
                          <td className="p-2.5 font-medium">{reg.estudiantes?.apellidos || 'N/A'}</td>
                          <td className="p-2.5 font-mono text-on-surface-variant">{reg.estudiantes?.cedula || 'N/A'}</td>
                          <td className="p-2.5 font-medium text-secondary">{reg.empresa_nombre || 'N/A'}</td>
                          <td className="p-2.5 font-mono">{reg.empresa_correo || 'N/A'}</td>
                          <td className="p-2.5 font-mono">{reg.empresa_telefono || 'N/A'}</td>
                          <td className="p-2.5 truncate max-w-[150px]" title={reg.carta_dirigida_a}>{reg.carta_dirigida_a || 'N/A'}</td>
                          <td className="p-2.5 truncate max-w-[150px]" title={reg.cargo_carta}>{reg.cargo_carta || 'N/A'}</td>
                          <td className="p-2.5 font-medium">{reg.tutor_nombre || 'N/A'}</td>
                          <td className="p-2.5">{reg.tutor_cargo || 'N/A'}</td>
                          <td className="p-2.5">{reg.tutor_correo || 'N/A'}</td>
                          <td className="p-2.5 font-mono">{reg.tutor_telefono || 'N/A'}</td>
                          <td className="p-2.5 pr-4 font-mono">{reg.cant_horas || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="pt-4 border-t border-outline-variant mt-auto">
              <button 
                onClick={exportarExcelPractica2}
                className="w-full py-3 bg-[#0a6b40] hover:bg-[#085a36] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                EXPORTAR DATA A EXCEL (.CSV)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}