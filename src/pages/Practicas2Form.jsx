import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Practicas2Form() {
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // NUEVO: Estado para almacenar el periodo académico activo
  const [periodoActivoId, setPeriodoActivoId] = useState(null);
  
  // Datos de validación
  const [cedulaInput, setCedulaInput] = useState('');
  const [estudianteId, setEstudianteId] = useState(null);
  const [datosEstudiante, setDatosEstudiante] = useState(null);

  // Campos del formulario
  const [formData, setFormData] = useState({
    cant_horas: '',
    empresa_nombre: '',
    empresa_correo: '',
    empresa_telefono: '',
    carta_dirigida_a: '',
    cargo_carta: '',
    tutor_nombre: '',
    tutor_cargo: '',
    tutor_correo: '',
    tutor_telefono: ''
  });

  // NUEVO: Buscar el periodo activo al cargar la página
  useEffect(() => {
    const cargarPeriodoActivo = async () => {
      try {
        const { data, error } = await supabase
          .from('periodos_academicos')
          .select('id')
          .eq('activo', true)
          .single(); // Trae solo el activo

        if (!error && data) {
          setPeriodoActivoId(data.id);
        }
      } catch (err) {
        console.error("Error cargando el periodo activo:", err);
      }
    };

    cargarPeriodoActivo();
  }, []);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PASO 1: VALIDACIÓN ESTRICTA
  const validarEstudiante = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { data: estudiante, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('cedula', cedulaInput.trim())
        .single();

      if (error || !estudiante) {
        throw new Error('Estudiante no encontrado. Verifica tu número de cédula.');
      }

      const etapaActual = estudiante.etapa || 'Pasantía 1';

      if (etapaActual === 'Pasantía 1') {
        throw new Error('Aún estás cursando Prácticas 1 o tu aprobación no ha sido procesada. No puedes inscribirte en Prácticas 2.');
      }

      if (etapaActual === 'Pasantía 2' || etapaActual === 'Culminado') {
        throw new Error('Ya te encuentras registrado en Prácticas 2 o ya has culminado tu ciclo de pasantías.');
      }

      if (etapaActual !== 'En espera') {
        throw new Error('Tu estatus académico actual no te permite registrarte en esta etapa.');
      }

      const { data: registroExistente } = await supabase
        .from('pasantia_practicas2')
        .select('id')
        .eq('estudiante_id', estudiante.id_estudiante)
        .single();

      if (registroExistente) {
        throw new Error('Ya existe una solicitud de Prácticas 2 en proceso para tu cédula.');
      }

      setDatosEstudiante(estudiante);
      setEstudianteId(estudiante.id_estudiante);
      setPaso(2);
      
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    } finally {
      setCargando(false);
    }
  };

  // PASO 2: ENVIAR FORMULARIO
  const enviarFormulario = async (e) => {
    e.preventDefault();

    // NUEVO: Verificamos que exista un periodo activo antes de procesar el envío
    if (!periodoActivoId) {
      setMensaje({ tipo: 'error', texto: 'No hay un periodo académico activo en este momento. Por favor, contacta a la coordinación.' });
      return;
    }

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error: errorInsert } = await supabase
        .from('pasantia_practicas2')
        .insert([
          {
            estudiante_id: estudianteId,
            periodo_id: periodoActivoId, // ✨ EL ENLACE MÁGICO ✨
            ...formData
          }
        ]);

      if (errorInsert) throw errorInsert;

      const { error: errorUpdate } = await supabase
        .from('estudiantes')
        .update({ etapa: 'Pasantía 2', estatus_pasantia2: 'Pendiente' })
        .eq('id_estudiante', estudianteId);

      if (errorUpdate) throw errorUpdate;

      setPaso(3);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión al enviar la solicitud: ' + error.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        
        {/* ENCABEZADO INSTITUCIONAL BLANCO CON DETALLES NARANJAS */}
        <div className="bg-white p-8 text-center border-t-8 border-[#FE5701] border-b border-slate-100 relative">
          
          <div className="flex justify-center mb-4">
            {/* RUTA DE IMAGEN ACTUALIZADA */}
            <img 
              src="/assets/logo-universidad.jpeg" 
              alt="Logo Universidad" 
              className="h-24 md:h-28 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-slate-800">Facultad de Farmacia</h1>
          <h2 className="text-sm md:text-base font-bold mt-1 text-[#FE5701] uppercase tracking-wider">Coordinación de Prácticas Profesionales</h2>
          
          <div className="mt-6 inline-block bg-slate-50 text-slate-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200">
            Solicitud de Pasantías Prácticas 2 (Industria/Institucional)
          </div>
        </div>

        <div className="p-6 md:p-10">
          {mensaje.texto && (
            <div className={`p-4 mb-8 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              <span className="material-symbols-outlined text-2xl">{mensaje.tipo === 'error' ? 'error' : 'check_circle'}</span>
              {mensaje.texto}
            </div>
          )}

          {/* VISTA 1: VALIDACIÓN DE CÉDULA */}
          {paso === 1 && (
            <form onSubmit={validarEstudiante} className="max-w-md mx-auto space-y-8 text-center py-6">
              <div className="w-24 h-24 mx-auto bg-[#FE5701]/10 text-[#FE5701] rounded-full flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-5xl">admin_panel_settings</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Validación de Ingreso</h3>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  Solo los alumnos que hayan <strong className="text-slate-700">aprobado Prácticas 1</strong> están habilitados para acceder a este formulario. Ingresa tu número de cédula para consultar tu estatus.
                </p>
              </div>
              
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FE5701] transition-colors">badge</span>
                <input 
                  type="text" 
                  placeholder="Ej. 25123456" 
                  value={cedulaInput} 
                  onChange={(e) => setCedulaInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-lg text-slate-800 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={cargando || !cedulaInput.trim()}
                className="w-full bg-[#FE5701] text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#e04d00] hover:shadow-lg hover:shadow-[#FE5701]/30 disabled:opacity-50 disabled:hover:shadow-none transition-all flex justify-center items-center gap-2"
              >
                {cargando ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Verificar Estatus'}
              </button>
            </form>
          )}

          {/* VISTA 2: FORMULARIO COMPLETO */}
          {paso === 2 && (
            <form onSubmit={enviarFormulario} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Tarjeta de validación */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FE5701]/10 text-[#FE5701] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">how_to_reg</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#FE5701] uppercase tracking-wider mb-0.5">Estudiante Autorizado</p>
                    <p className="text-lg font-black text-slate-800">{datosEstudiante.nombres} {datosEstudiante.apellidos}</p>
                  </div>
                </div>
              </div>

              {/* Bloque: Datos Académicos */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative pt-10 mt-12">
                <span className="absolute -top-4 left-6 bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">school</span> Datos Académicos
                </span>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Cant. de Horas a cursar</label>
                  <input type="number" name="cant_horas" value={formData.cant_horas} onChange={manejarCambio} required placeholder="Ej: 240" className="w-full md:w-1/3 px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                </div>
              </div>

              {/* Bloque: Datos de la Empresa y Carta */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative pt-10 mt-12">
                <span className="absolute -top-4 left-6 bg-[#FE5701] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">domain</span> Destino Institucional
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Nombre de la Empresa</label>
                    <input type="text" name="empresa_nombre" value={formData.empresa_nombre} onChange={manejarCambio} required placeholder="Ej: Laboratorios Leti" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Correo Electrónico (Empresa)</label>
                    <input type="email" name="empresa_correo" value={formData.empresa_correo} onChange={manejarCambio} required placeholder="contacto@empresa.com" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Teléfono (Empresa)</label>
                    <input type="text" name="empresa_telefono" value={formData.empresa_telefono} onChange={manejarCambio} required placeholder="Ej: 0212-1234567" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>

                  {/* Datos para la Carta de Postulación */}
                  <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t-2 border-slate-100 border-dashed">
                    <div className="bg-[#FE5701]/10 text-[#FE5701] p-3 rounded-xl inline-flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-sm">drafts</span>
                      <p className="text-[11px] font-bold uppercase tracking-wider">Datos para la emisión de la carta oficial</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Carta Dirigida a:</label>
                    <input type="text" name="carta_dirigida_a" value={formData.carta_dirigida_a} onChange={manejarCambio} required placeholder="Ej: Lcda. María Gómez" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Cargo de la persona:</label>
                    <input type="text" name="cargo_carta" value={formData.cargo_carta} onChange={manejarCambio} required placeholder="Ej: Gerente de Recursos Humanos" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                </div>
              </div>

              {/* Bloque: Datos del Tutor */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative pt-10 mt-12">
                <span className="absolute -top-4 left-6 bg-slate-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">person_pin</span> Tutor Empresarial
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Nombres y Apellidos</label>
                    <input type="text" name="tutor_nombre" value={formData.tutor_nombre} onChange={manejarCambio} required className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Cargo que ocupa</label>
                    <input type="text" name="tutor_cargo" value={formData.tutor_cargo} onChange={manejarCambio} required className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Correo Electrónico</label>
                    <input type="email" name="tutor_correo" value={formData.tutor_correo} onChange={manejarCambio} required className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Teléfono de Contacto</label>
                    <input type="text" name="tutor_telefono" value={formData.tutor_telefono} onChange={manejarCambio} required className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#FE5701] focus:bg-white focus:ring-4 focus:ring-[#FE5701]/10 outline-none transition-all font-medium text-slate-700" />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-slate-100">
                <button type="button" onClick={() => setPaso(1)} className="px-6 py-4 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors order-2 md:order-1">
                  Volver al inicio
                </button>
                <button type="submit" disabled={cargando} className="px-8 py-4 bg-[#FE5701] text-white rounded-xl text-sm font-black shadow-lg shadow-[#FE5701]/30 hover:bg-[#e04d00] hover:-translate-y-1 hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest order-1 md:order-2">
                  {cargando ? <span className="material-symbols-outlined animate-spin text-[20px]">sync</span> : <span className="material-symbols-outlined text-[20px]">send</span>}
                  Registrar Solicitud
                </button>
              </div>
            </form>
          )}

          {/* VISTA 3: PANTALLA DE ÉXITO */}
          {paso === 3 && (
            <div className="text-center py-16 animate-in zoom-in duration-500">
              <div className="w-24 h-24 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-6xl text-green-500">task_alt</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">¡Inscripción Exitosa!</h2>
              <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
                Tu solicitud de ubicación para las <strong className="text-slate-700">Prácticas 2</strong> ha sido registrada y tu estatus académico ha sido actualizado en el sistema.
              </p>
              
              <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl inline-block text-left text-sm min-w-[280px] shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Estudiante</p>
                    <p className="font-bold text-slate-700">{datosEstudiante.nombres} {datosEstudiante.apellidos}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Empresa de Destino</p>
                    <p className="font-bold text-slate-700">{formData.empresa_nombre}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Estatus Actual</p>
                    <span className="bg-[#FE5701]/10 text-[#FE5701] px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                      Pendiente por Evaluación
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}