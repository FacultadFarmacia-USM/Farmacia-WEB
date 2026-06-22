import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import logoUniversidad from '../assets/logo-universidad.png';

export default function Header({ perfil, cerrarSesion }) {
  
  // --- ESTADOS PARA NOTIFICACIONES ---
  const [notificaciones, setNotificaciones] = useState([]);
  const [hayNuevas, setHayNuevas] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);

  // --- LÓGICA DE SUPABASE REALTIME ---
  useEffect(() => {
    // 1. Escuchar Prácticas 1 (Farmatodo)
    const canalPractica1 = supabase
      .channel('registro-practica1')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pasantia_farmatodo' },
        (payload) => {
          agregarNotificacion('Se ha registrado un estudiante en Prácticas 1 (Farmatodo)');
        }
      )
      .subscribe();

    // 2. Escuchar Prácticas 2
    const canalPractica2 = supabase
      .channel('registro-practica2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pasantia_practicas2' },
        (payload) => {
          agregarNotificacion('Se ha registrado un estudiante en Prácticas 2');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalPractica1);
      supabase.removeChannel(canalPractica2);
    };
  }, []);

  const agregarNotificacion = (mensaje) => {
    const nuevaNotificacion = {
      id: Date.now(),
      mensaje: mensaje,
      // Hora formato corto (Ej: "10:30 a. m.")
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setNotificaciones((prev) => [nuevaNotificacion, ...prev]);
    setHayNuevas(true);
  };

  const toggleNotificaciones = () => {
    setMostrarMenu(!mostrarMenu);
    if (!mostrarMenu) {
      setHayNuevas(false); // Apagamos el puntito rojo al abrir el menú
    }
  };

  return (
    <header className="h-20 bg-surface text-on-surface border-b border-outline-variant flex items-center justify-end px-6 shadow-sm">

      {/* LADO DERECHO: Perfil del usuario y botón de salir */}
      <div className="flex items-center gap-6">
        
        {/* === SECCIÓN DE NOTIFICACIONES MODIFICADA === */}
        <div className="relative">
          <button 
            onClick={toggleNotificaciones}
            className="relative p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            
            {/* Puntito rojo condicional */}
            {hayNuevas && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border border-surface"></span>
            )}
          </button>

          {/* Menú desplegable de notificaciones */}
          {mostrarMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant">
                <h3 className="text-sm font-bold text-on-surface">Notificaciones</h3>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    No tienes alertas nuevas
                  </div>
                ) : (
                  notificaciones.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                      <p className="text-sm text-on-surface font-medium leading-tight">
                        {notif.mensaje}
                      </p>
                      <span className="text-xs text-on-surface-variant mt-1.5 block">
                        Hoy, {notif.fecha}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* =========================================== */}

        {/* Línea divisoria */}
        <div className="h-8 w-[1px] bg-outline-variant"></div>

        {/* Información del Docente / Admin Conectado */}
        <div className="flex items-center gap-3">
          
          {/* AVATAR: Modificado para mostrar el Logo de la Universidad en lugar del tubo de ensayo */}
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-outline shadow-sm overflow-hidden transition-transform duration-300 hover:scale-105 p-1">
            <img 
              src={logoUniversidad} 
              alt="Logo Universidad" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="hidden sm:block text-left">
            <h4 className="text-sm font-bold text-on-surface leading-tight tracking-tight">
              {perfil?.nombre_completo || 'Cargando usuario...'}
            </h4>
            <p className="text-xs font-medium text-secondary tracking-wide mt-0.5">
              {perfil?.rol || 'Profesor'}
            </p>
          </div>
        </div>

        {/* Botón de Cierre de Sesión */}
        <button 
          onClick={cerrarSesion}
          className="flex items-center gap-2 bg-error-container text-on-error-container hover:bg-error hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 shadow-sm"
          title="Cerrar sesión del sistema"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden md:inline">Salir</span>
        </button>

      </div>
    </header>
  );
}