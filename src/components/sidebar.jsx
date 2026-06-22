import React from 'react';

// IMPORTANTE: Asegúrate de que ahora recibimos 'perfil' aquí arriba
export default function Sidebar({ currentView, setCurrentView, perfil }) {
  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex-col justify-between hidden md:flex z-10 relative h-screen">
      <div className="p-gutter pt-6">
        <div className="font-display-lg text-title-lg font-bold text-primary tracking-tight mb-8 px-4">Facultad de Farmacia</div>
        <nav className="flex flex-col gap-2 px-2">
          
          {/* PANEL DE CONTROL */}
          <button 
            onClick={() => setCurrentView('resumen')}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-label-md text-sm transition-all duration-200 ${
              currentView === 'resumen' 
                ? 'bg-surface-container-low text-primary' 
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={currentView === 'resumen' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span> 
            Panel de Control
          </button>

          {/* REGISTRO DE ESTUDIANTES */}
          <button 
            onClick={() => setCurrentView('estudiantes')}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-label-md text-sm transition-all duration-200 ${
              currentView === 'estudiantes' 
                ? 'bg-surface-container-low text-primary' 
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={currentView === 'estudiantes' ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span> 
            Registro de Estudiantes
          </button>

          {/* PRÁCTICAS 1 */}
          <button 
            onClick={() => setCurrentView('practicas1')}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-label-md text-sm transition-all duration-200 ${
              currentView === 'practicas1' 
                ? 'bg-surface-container-low text-primary' 
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={currentView === 'practicas1' ? { fontVariationSettings: "'FILL' 1" } : {}}>science</span> 
            Prácticas 1
          </button>

          {/* PRÁCTICAS 2 */}
          <button 
            onClick={() => setCurrentView('practicas2')}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-label-md text-sm transition-all duration-200 ${
              currentView === 'practicas2' 
                ? 'bg-surface-container-low text-primary' 
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={currentView === 'practicas2' ? { fontVariationSettings: "'FILL' 1" } : {}}>biotech</span> 
            Prácticas 2
          </button>

          {/* FORMULARIOS */}
          <button 
            onClick={() => setCurrentView('formularios')}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-label-md text-sm transition-all duration-200 ${
              currentView === 'formularios' 
                ? 'bg-surface-container-low text-primary' 
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={currentView === 'formularios' ? { fontVariationSettings: "'FILL' 1" } : {}}>description</span> 
            Formularios
          </button>

          {/* --- NUEVO BOTÓN: AGREGAR USUARIO (SOLO SUPER ADMIN) --- */}
          {perfil?.rol === 'Super Admin' && (
            <>
              {/* Pequeño separador visual para el panel de administración */}
              <div className="my-2 border-t border-outline-variant mx-2"></div>
              <p className="text-[10px] font-bold text-on-surface-variant/70 px-4 uppercase tracking-wider mb-1">
                Administración
              </p>
              
              <button 
                onClick={() => setCurrentView('agregarUsuario')}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-label-md text-sm transition-all duration-200 ${
                  currentView === 'agregarUsuario' 
                    ? 'bg-surface-container-low text-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined" style={currentView === 'agregarUsuario' ? { fontVariationSettings: "'FILL' 1" } : {}}>person_add</span> 
                Usuarios
              </button>
            </>
          )}

        </nav>
      </div>

      {/* CONFIGURACIÓN */}
      <div className="p-gutter border-t border-outline-variant pb-6 px-2">
        <button 
          onClick={() => setCurrentView('configuracion')}
          className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-label-md text-sm transition-all duration-200 ${
            currentView === 'configuracion' 
              ? 'bg-surface-container-low text-primary' 
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined" style={currentView === 'configuracion' ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span> 
          Configuración
        </button>
      </div>
    </aside>
  );
}