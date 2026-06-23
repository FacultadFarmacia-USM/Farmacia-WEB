import React, { useState } from 'react';

export default function Sidebar({ currentView, setCurrentView, perfil }) {
  // Estado para controlar si el menú está abierto o cerrado en móviles
  const [isOpen, setIsOpen] = useState(false);

  // Función para cambiar de vista y cerrar el menú móvil automáticamente
  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* BOTÓN HAMBURGUESA (Solo visible en móviles) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface-container-low text-primary rounded-lg shadow-sm border border-outline-variant flex items-center justify-center"
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* FONDO OSCURO (Aparece detrás del menú cuando está abierto en móvil) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR (Deslizable en móvil, estático en PC) */}
      <aside className={`fixed md:static top-0 left-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div className="p-gutter pt-16 md:pt-6"> {/* Más padding top en móvil para esquivar el botón */}
          <div className="font-display-lg text-title-lg font-bold text-primary tracking-tight mb-8 px-4">
            Facultad de Farmacia
          </div>
          
          <nav className="flex flex-col gap-2 px-2 overflow-y-auto">
            {/* PANEL DE CONTROL */}
            <button 
              onClick={() => handleNavigation('resumen')}
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
              onClick={() => handleNavigation('estudiantes')}
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
              onClick={() => handleNavigation('practicas1')}
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
              onClick={() => handleNavigation('practicas2')}
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
              onClick={() => handleNavigation('formularios')}
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
                <div className="my-2 border-t border-outline-variant mx-2"></div>
                <p className="text-[10px] font-bold text-on-surface-variant/70 px-4 uppercase tracking-wider mb-1">
                  Administración
                </p>
                <button 
                  onClick={() => handleNavigation('agregarUsuario')}
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
        <div className="p-gutter border-t border-outline-variant pb-6 px-2 bg-surface-container-lowest mt-auto">
          <button 
            onClick={() => handleNavigation('configuracion')}
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
    </>
  );
}