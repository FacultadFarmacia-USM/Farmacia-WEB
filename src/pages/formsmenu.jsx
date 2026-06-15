import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajusta la ruta según tu proyecto

export default function FormsMenu() {
  // --- ESTADOS PARA PERÍODOS ACADÉMICOS ---
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [nuevoPeriodoNombre, setNuevoPeriodoNombre] = useState('');
  
  // --- ESTADOS PARA ESTUDIANTES ---
  const [listaEstudiantes, setListaEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Genera el enlace público dinámicamente
  const urlPublicaFormulario = `${window.location.origin}/?view=alumno-farmatodo`;

  const copiarEnlace = () => {
    navigator.clipboard.writeText(urlPublicaFormulario);
    alert("¡Enlace copiado! Ya puedes pegarlo en WhatsApp o Correo.");
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

  // 2. Cargar estudiantes con todos los 12 campos solicitados
  useEffect(() => {
    if (!periodoSeleccionado) return;

    const cargarEstudiantesPorPeriodo = async () => {
      setCargando(true);
      // 🔥 Traemos absolutamente todos los campos desde 'estudiantes' y la relación
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

    cargarEstudiantesPorPeriodo();
  }, [periodoSeleccionado]);

  // 3. Crear un nuevo período académico
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

  // 4. Cambiar el período activo de la plataforma
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

  // 5. Motor de exportación con el orden exacto de columnas que pediste
  const exportarExcelFiltrado = () => {
    if (listaEstudiantes.length === 0) {
      alert("No hay alumnos registrados en este periodo para exportar.");
      return;
    }

    const periodoNombre = periodos.find(p => p.id === Number(periodoSeleccionado))?.nombre || "Desconocido";
    
    // Encabezados ordenados perfectamente
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
          <div className="flex gap-3 overflow-x-auto pb-1 selection:bg-transparent">
            {periodos.map(p => (
              <div 
                key={p.id} 
                className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                  p.activo 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' 
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}
              >
                <span>{p.nombre}</span>
                {p.activo ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ) : (
                  <button 
                    onClick={() => handleActivarPeriodo(p.id)}
                    className="text-[10px] bg-white hover:bg-slate-100 border border-outline-variant text-primary px-2 py-0.5 rounded-md font-bold uppercase transition-all"
                  >
                    Activar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DOS COLUMNAS DE TRABAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN E IFRAME */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold px-1">
            <span className="material-symbols-outlined">filter_1</span>
            <h2 className="uppercase tracking-widest text-xs">Pasantía 1: Farmacia Galénica</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-highest px-2 py-1 rounded">Vista Previa Real del Alumno</span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">visibility</span>
              </div>
              
              <div className="h-64 rounded-lg border border-outline-variant shadow-inner overflow-hidden relative bg-white">
                 <iframe 
                    src={urlPublicaFormulario} 
                    className="w-[200%] h-[200%] origin-top-left scale-50 border-none" 
                    title="Vista Previa Farmatodo"
                 ></iframe>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-primary">Inscripción Inicial Farmatodo</h3>
                <p className="text-xs text-on-surface-variant mt-1">Usa este enlace para recolectar datos de Nombres, RIF, Ciudad y Sucursales.</p>
              </div>

              <div className="bg-surface px-3 py-2 rounded-xl border border-outline-variant flex items-center justify-between gap-4">
                <div className="truncate text-sm font-mono text-on-surface flex-1">
                   {urlPublicaFormulario}
                </div>
                <button 
                  onClick={copiarEnlace}
                  className="bg-surface-container-high text-primary p-2 rounded-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center border border-outline-variant shadow-sm"
                  title="Copiar enlace"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
              
              <button 
                onClick={copiarEnlace}
                className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                Copiar y Compartir con Alumnos
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TABLA COMPLETA CON DESPLAZAMIENTO HORIZONTAL */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold px-1">
            <span className="material-symbols-outlined">group</span>
            <h2 className="uppercase tracking-widest text-xs">Alumnos Postulados en esta Cohorte</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-4 flex flex-col justify-between h-full min-h-[460px]">
            
            <div className="space-y-4 flex-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-low px-2 py-1 rounded">
                Registros en Tiempo Real ({listaEstudiantes.length})
              </span>

              {/* 🔥 Añadimos overflow-x-auto para poder navegar las 12 columnas cómodamente */}
              <div className="border border-outline-variant rounded-xl overflow-hidden max-h-[300px] overflow-y-auto overflow-x-auto bg-white">
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

            {/* BOTÓN DE EXPORTACIÓN (ABAJO) */}
            <div className="pt-4 border-t border-outline-variant mt-4">
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

      </div>
    </div>
  );
}