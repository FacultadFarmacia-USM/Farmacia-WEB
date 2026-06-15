import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// --- COMPONENTE: Buscador de Sucursales Personalizado ---
const BuscadorSucursal = ({ label, placeholder, opciones, valorSeleccionado, name, onChange }) => {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const opcionesFiltradas = opciones.filter(op => 
    op.nombre_sucursal.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionar = (valor) => {
    onChange({ target: { name, value: valor } });
    setAbierto(false);
    setBusqueda('');
  };

  return (
    <div className="relative w-full">
      <label className="block text-xs font-medium text-on-surface-variant mb-1">{label}</label>
      
      <div 
        onClick={() => setAbierto(!abierto)}
        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all text-sm flex justify-between items-center cursor-pointer"
      >
        <span className={valorSeleccionado ? "text-on-surface" : "text-on-surface-variant"}>
          {valorSeleccionado || placeholder}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant text-lg">
          {abierto ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      <input 
        type="text" 
        required 
        value={valorSeleccionado} 
        onChange={() => {}} 
        className="absolute bottom-0 left-1/2 opacity-0 pointer-events-none w-0 h-0" 
        tabIndex={-1}
      />

      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)}></div>
          
          <div className="absolute z-50 w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-outline-variant bg-surface-container-low">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
              <input 
                type="text" 
                autoFocus
                placeholder="Buscar sucursal..." 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
                className="w-full bg-transparent text-sm outline-none text-on-surface placeholder:text-on-surface-variant/70"
              />
            </div>
            
            <ul className="max-h-48 overflow-y-auto">
              {opcionesFiltradas.length > 0 ? (
                opcionesFiltradas.map((sucursal) => (
                  <li 
                    key={sucursal.id} 
                    onClick={() => handleSeleccionar(sucursal.nombre_sucursal)}
                    className="px-4 py-2 text-sm hover:bg-secondary/10 cursor-pointer transition-colors text-on-surface"
                  >
                    {sucursal.nombre_sucursal}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-center text-on-surface-variant">
                  No se encontró ninguna sucursal.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};


export default function FarmatodoForm() {
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', fechaNacimiento: '', cedula: '', rif: '',
    correo: '', telefono: '', direccion: '', ciudad: '', estado: '',
    farmatodoOpcion1: '', farmatodoOpcion2: '', empleadoActivo: '',
    cuenta_mercantil: ''
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [listaSucursales, setListaSucursales] = useState([]);
  
  // 🔥 NUEVO: Estado para capturar el período activo del sistema
  const [periodoActivoId, setPeriodoActivoId] = useState(null);

  useEffect(() => {
    const cargarCatálogoYPeriodo = async () => {
      // 1. Cargar sucursales
      const { data: sucursales, error: errSuc } = await supabase
        .from('catalogo_sucursales')
        .select('id, nombre_sucursal')
        .order('nombre_sucursal', { ascending: true });

      if (!errSuc && sucursales) setListaSucursales(sucursales);

      // 2. 🔥 NUEVO: Detectar cuál es el periodo académico activo en tiempo real
      const { data: periodo, error: errPer } = await supabase
        .from('periodos_academicos')
        .select('id')
        .eq('activo', true)
        .maybeSingle();

      if (!errPer && periodo) {
        setPeriodoActivoId(periodo.id);
      }
    };
    
    cargarCatálogoYPeriodo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cuenta_mercantil') {
      const soloNumeros = value.replace(/\D/g, ''); 
      setFormData({ ...formData, [name]: soloNumeros });
      return;
    }

    setFormData({ ...formData, [name]: value });
    setFormError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validación preventiva de cohortes
    if (!periodoActivoId) {
      return setFormError('Lo sentimos, no hay ningún período académico activo en este momento. Notifique al administrador.');
    }
    
    const cleanData = {
      ...formData,
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      cedula: formData.cedula.trim().toUpperCase(),
      rif: formData.rif.trim().toUpperCase(),
      correo: formData.correo.trim().toLowerCase(),
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad.trim(),
      estado: formData.estado.trim(),
      cuenta_mercantil: formData.cuenta_mercantil.trim()
    };

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexCedula = /^[VE]-\d{6,8}$/;
    const regexRif = /^[VEJG]-\d{6,9}-\d{1}$/;
    const regexTelefono = /^0(412|414|416|424|426)-?\d{7}$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!soloLetras.test(cleanData.nombres) || !soloLetras.test(cleanData.apellidos)) {
      return setFormError('Los nombres y apellidos solo deben contener letras.');
    }
    if (!regexCedula.test(cleanData.cedula)) {
      return setFormError('La Cédula debe tener el formato V-12345678 o E-12345678.');
    }
    if (!regexRif.test(cleanData.rif)) {
      return setFormError('El RIF debe tener el formato exacto V-12345678-0.');
    }
    if (!regexCorreo.test(cleanData.correo)) {
      return setFormError('Ingresa una dirección de correo electrónico válida.');
    }
    if (!regexTelefono.test(cleanData.telefono)) {
      return setFormError('El teléfono debe ser un celular válido (Ej. 0414-1234567).');
    }
    if (cleanData.cuenta_mercantil && cleanData.cuenta_mercantil.length !== 20) {
      return setFormError('La cuenta Mercantil debe tener exactamente 20 dígitos.');
    }

    setLoading(true);

    try {
      // 1. Insertar Datos Personales del Alumno (Añadimos dirección y estado que faltaban)
      const { data: estudianteCreado, error: errorEstudiante } = await supabase
        .from('estudiantes')
        .insert([{
            cedula: cleanData.cedula,
            rif: cleanData.rif,
            nombres: cleanData.nombres,
            apellidos: cleanData.apellidos,
            fecha_nacimiento: cleanData.fechaNacimiento,
            correo: cleanData.correo,
            telefono: cleanData.telefono,
            direccion: cleanData.direccion, 
            estado_ubicacion: cleanData.estado,
            estado: 'Activo'    
        }])
        .select().single();

      if (errorEstudiante) throw errorEstudiante;

      // 2. Insertar relación de Pasantía ligándola al periodo activo
      const { data: pasantiaCreada, error: errorPasantia } = await supabase
        .from('pasantia_farmatodo')
        .insert([{
            id_estudiante: estudianteCreado.id_estudiante,
            ciudad: cleanData.ciudad,
            cuenta_mercantil: cleanData.cuenta_mercantil,
            empleado_activo: cleanData.empleadoActivo,
            periodo_id: periodoActivoId // 🔥 ¡AQUÍ ESTÁ LA MAGIA!
        }])
        .select().single();

      if (errorPasantia) throw errorPasantia;

      // 3. Registrar Sucursales de preferencia
      const { error: errorSucursales } = await supabase
        .from('farmatodo_sucursales')
        .insert([
          { id_pasantia_farmatodo: pasantiaCreada.id_pasantia_farmatodo, prioridad: 1, sucursal: cleanData.farmatodoOpcion1 },
          { id_pasantia_farmatodo: pasantiaCreada.id_pasantia_farmatodo, prioridad: 2, sucursal: cleanData.farmatodoOpcion2 }
        ]);

      if (errorSucursales) throw errorSucursales;

      alert('¡Tu solicitud de pasantía ha sido registrada con éxito en el sistema!');
      
      setFormData({
        nombres: '', apellidos: '', fechaNacimiento: '', cedula: '', rif: '',
        correo: '', telefono: '', direccion: '', ciudad: '', estado: '',
        farmatodoOpcion1: '', farmatodoOpcion2: '', empleadoActivo: '',
        cuenta_mercantil: ''
      });

    } catch (error) {
      console.error('Error detallado de Supabase:', error);
      if (error.code === '23505') { 
        if (error.message.includes('cedula_unica') || error.message.includes('cedula')) {
          setFormError(`Ya existe una solicitud registrada con la Cédula: ${cleanData.cedula}.`);
        } else if (error.message.includes('rif_unico') || error.message.includes('rif')) {
          setFormError(`El RIF ${cleanData.rif} ya está registrado en nuestro sistema.`);
        } else if (error.message.includes('correo_unico') || error.message.includes('correo')) {
          setFormError(`El correo electrónico ${cleanData.correo} ya fue utilizado.`);
        } else {
          setFormError('Ya existe un registro con estos datos personales.');
        }
      } else {
        setFormError(`Error de conexión: ${error.message || 'Inténtalo de nuevo.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased flex items-center justify-center p-4 md:p-8 relative medical-grid">
      <div className="max-w-3xl w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-6 md:p-8 shadow-lg relative z-10 my-8">
        
        <div className="text-center mb-8 border-b border-outline-variant pb-6">
          <div className="w-16 h-16 rounded-full bg-surface-container-low text-secondary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-3xl">storefront</span>
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Solicitud de Pasantía - Farmatodo</h1>
          <p className="text-sm text-on-surface-variant mt-1">Formulario inicial para asignación de sucursales</p>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm font-medium">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
              <span className="material-symbols-outlined text-lg">badge</span> 1. Datos Personales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Nombres</label>
                <input type="text" name="nombres" required maxLength="50" value={formData.nombres} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. María Alejandra" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Apellidos</label>
                <input type="text" name="apellidos" required maxLength="50" value={formData.apellidos} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. González Pérez" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Cédula de Identidad</label>
                <input type="text" name="cedula" required maxLength="12" value={formData.cedula} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. V-25123456" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">RIF</label>
                <input type="text" name="rif" required maxLength="14" value={formData.rif} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. V-25123456-0" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" required value={formData.fechaNacimiento} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONTACTO Y UBICACIÓN */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
              <span className="material-symbols-outlined text-lg">location_on</span> 2. Contacto y Ubicación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Correo Electrónico</label>
                <input type="email" name="correo" required maxLength="100" value={formData.correo} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="correo@ejemplo.com" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Teléfono Móvil</label>
                <input type="tel" name="telefono" required maxLength="12" value={formData.telefono} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. 0414-1234567" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Dirección de Habitación (Detallada)</label>
                <textarea name="direccion" rows="2" required maxLength="300" value={formData.direccion} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Avenida, Calle, Edificio/Casa, Punto de referencia..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Ciudad</label>
                <input type="text" name="ciudad" required maxLength="50" value={formData.ciudad} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. Los Teques" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Estado</label>
                <input type="text" name="estado" required maxLength="50" value={formData.estado} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. Miranda" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DATOS DE LA PASANTÍA */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
              <span className="material-symbols-outlined text-lg">medical_services</span> 3. Asignación Farmatodo
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-20">
                <BuscadorSucursal 
                  label="Opción 1 de Sucursal Farmatodo"
                  placeholder="Seleccione una sucursal..."
                  name="farmatodoOpcion1"
                  opciones={listaSucursales}
                  valorSeleccionado={formData.farmatodoOpcion1}
                  onChange={handleChange}
                />

                <BuscadorSucursal 
                  label="Opción 2 de Sucursal Farmatodo"
                  placeholder="Seleccione una alternativa..."
                  name="farmatodoOpcion2"
                  opciones={listaSucursales.filter(s => s.nombre_sucursal !== formData.farmatodoOpcion1)}
                  valorSeleccionado={formData.farmatodoOpcion2}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-on-surface-variant mb-2">¿Es usted empleado activo de Farmatodo actualmente?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="empleadoActivo" value="Si" onChange={handleChange} className="text-secondary focus:ring-secondary" required />
                    <span className="text-sm">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="empleadoActivo" value="No" onChange={handleChange} className="text-secondary focus:ring-secondary" required />
                    <span className="text-sm">No</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="empleadoActivo" value="Otros" onChange={handleChange} className="text-secondary focus:ring-secondary" required />
                    <span className="text-sm">Otros (Ex-empleado, en proceso, etc.)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              ¿Posee Cuenta Corriente Mercantil? (Opcional)
            </label>
            <input 
              type="text" 
              name="cuenta_mercantil" 
              maxLength="20" 
              placeholder="Ingrese su número de cuenta de 20 dígitos" 
              value={formData.cuenta_mercantil} 
              onChange={handleChange} 
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm" 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-secondary text-on-secondary rounded-lg font-semibold text-sm hover:bg-on-secondary-container transition-colors flex items-center justify-center gap-2 mt-8 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">
              {loading ? 'sync' : 'send'}
            </span> 
            {loading ? 'Validando y Enviando...' : 'Enviar Solicitud'}
          </button>

        </form>
      </div>
    </div>
  );
}