import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ActivityTable() {
  const [estudiantesRecientes, setEstudiantesRecientes] = useState([]);
  const [cargandoActividad, setCargandoActividad] = useState(true);

  const obtenerActividadReciente = async () => {
    try {
      setCargandoActividad(true);
      const { data, error } = await supabase
        .from('estudiantes')
        .select('nombres, apellidos, etapa, estado, creado_en')
        .order('creado_en', { ascending: false })
        .limit(5);

      if (error) throw error;
      setEstudiantesRecientes(data);
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
    } finally {
      setCargandoActividad(false);
    }
  };

  useEffect(() => {
    obtenerActividadReciente();
  }, []);

  // Función para poner la fecha bonita (ej. 24 oct 2026)
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
          Actividad Reciente de Estudiantes
        </h3>
        <button 
          onClick={obtenerActividadReciente} 
          disabled={cargandoActividad}
          className="text-xs text-primary font-medium hover:bg-surface-container-high px-2 py-1 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[16px] ${cargandoActividad ? 'animate-spin' : ''}`}>refresh</span> 
          Actualizar
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-on-surface-variant border-b border-outline-variant uppercase bg-surface-container-high/50">
              <th className="py-2 px-3">Nombre del Estudiante</th>
              <th className="py-2 px-3">Etapa del Programa</th>
              <th className="py-2 px-3">Fecha de Registro</th> {/* NUEVA COLUMNA */}
              <th className="py-2 px-3 text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargandoActividad ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-xs text-on-surface-variant"> {/* Cambiado a colSpan="4" */}
                  <div className="flex flex-col items-center justify-center gap-2 animate-pulse">
                    <span className="material-symbols-outlined text-2xl">sync</span>
                    Cargando registros reales...
                  </div>
                </td>
              </tr>
            ) : estudiantesRecientes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-xs text-on-surface-variant"> {/* Cambiado a colSpan="4" */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-2xl">inbox</span>
                    No hay estudiantes registrados en el sistema aún.
                  </div>
                </td>
              </tr>
            ) : (
              estudiantesRecientes.map((estudiante, index) => (
                <tr key={index} className="border-b border-outline-variant/50 hover:bg-surface-container-high/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-on-surface flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
                      {estudiante.nombres.charAt(0)}{estudiante.apellidos.charAt(0)}
                    </div>
                    {estudiante.nombres} {estudiante.apellidos}
                  </td>
                  
                  <td className="py-3 px-3 text-on-surface-variant">
                    {estudiante.etapa || 'Pasantía 1'}
                  </td>

                  {/* NUEVA CELDA: Fecha formateada */}
                  <td className="py-3 px-3 text-on-surface-variant text-xs capitalize">
                    {formatearFecha(estudiante.creado_en)}
                  </td>
                  
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      estudiante.estado === 'Activo' || !estudiante.estado
                        ? 'bg-success-container text-on-success-container' 
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {estudiante.estado || 'Activo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-outline-variant text-center">
        <button className="text-xs text-primary font-medium hover:underline">
          Ver todos los registros
        </button>
      </div>
    </div>
  );
}