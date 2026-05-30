import React from 'react';

export default function FormsMenu() {
  // Genera el enlace público dinámicamente
  const urlPublicaFormulario = `${window.location.origin}/?view=alumno-farmatodo`;

  const copiarEnlace = () => {
    navigator.clipboard.writeText(urlPublicaFormulario);
    alert("¡Enlace copiado! Ya puedes pegarlo en WhatsApp o Correo.");
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Centro de Formularios</h1>
        <p className="text-sm text-on-surface-variant mt-1">Previsualiza las planillas y gestiona los enlaces de acceso para los alumnos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECCIÓN PASANTÍAS 1 - FARMATODO */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold px-1">
            <span className="material-symbols-outlined">filter_1</span>
            <h2 className="uppercase tracking-widest text-xs">Pasantía 1: Farmacia Galénica</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            
            {/* 1. VISTA PEQUEÑA (PREVIEW REAL) */}
            <div className="p-4 bg-surface-container-low border-b border-outline-variant">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-highest px-2 py-1 rounded">Vista Previa Real del Alumno</span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">visibility</span>
              </div>
              
              {/* Contenedor Iframe Escala 50% */}
              <div className="h-64 rounded-lg border border-outline-variant shadow-inner overflow-hidden relative bg-white">
                 
                 {/* El iframe carga la URL del alumno. Se quitó la capa invisible para permitir scroll y pruebas */}
                 <iframe 
                    src={urlPublicaFormulario} 
                    className="w-[200%] h-[200%] origin-top-left scale-50 border-none" 
                    title="Vista Previa Farmatodo"
                 ></iframe>
              </div>
            </div>

            {/* 2. ÁREA DE ACCIÓN Y LINK CORREGIDA */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-primary">Inscripción Inicial Farmatodo</h3>
                <p className="text-xs text-on-surface-variant mt-1">Usa este enlace para recolectar datos de Nombres, RIF, Ciudad y Sucursales.</p>
              </div>

              {/* Caja del link */}
              <div className="bg-surface px-3 py-2 rounded-xl border border-outline-variant flex items-center justify-between gap-4">
                <div className="truncate text-sm font-mono text-on-surface flex-1 selection:bg-primary selection:text-white">
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

        {/* ESPACIO PARA OTROS FORMULARIOS (PASANTÍA 2) */}
        <div className="flex flex-col gap-4 opacity-60">
            <div className="flex items-center gap-2 text-on-surface-variant font-bold px-1">
                <span className="material-symbols-outlined">filter_2</span>
                <h2 className="uppercase tracking-widest text-xs">Pasantía 2: Hospitalaria</h2>
            </div>
            <div className="h-full border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center p-10 text-center">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline">folder_zip</span>
                <p className="text-sm font-medium text-primary">Módulo en Desarrollo</p>
                <p className="text-xs text-on-surface-variant mt-1">Pronto podrás gestionar aquí los formularios de la segunda etapa.</p>
            </div>
        </div>

      </div>
    </div>
  );
}