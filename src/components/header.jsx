import React from 'react';

export default function Header({ perfil, cerrarSesion }) {
  
  // URL de un Tubo de Ensayo en formato SVG (Estilo 3D moderno, súper seguro y rápido de cargar)
  const tuboEnsayoSeguro = "https://api.iconify.design/fluent-emoji/test-tube.svg?width=128&height=128";

  return (
    <header className="h-20 bg-surface text-on-surface border-b border-outline-variant flex items-center justify-between px-6 shadow-sm">
      
      {/* LADO IZQUIERDO: Buscador */}
      <div className="flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-full w-full max-w-md border border-outline">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input 
          type="text" 
          placeholder="Buscar estudiantes, expedientes, formularios..." 
          className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder-on-surface-variant"
        />
      </div>

      {/* LADO DERECHO: Perfil del usuario y botón de salir */}
      <div className="flex items-center gap-6">
        
        {/* Notificaciones */}
        <button className="relative p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* Línea divisoria */}
        <div className="h-8 w-[1px] bg-outline-variant"></div>

        {/* Información del Docente / Admin Conectado */}
        <div className="flex items-center gap-3">
          
          {/* AVATAR: Tubo de Ensayo SVG */}
          <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline shadow-sm overflow-hidden transition-transform duration-300 hover:scale-105 p-2">
            <img 
              src={tuboEnsayoSeguro} 
              alt="Tubo de ensayo" 
              className="w-full h-full object-contain drop-shadow-sm"
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