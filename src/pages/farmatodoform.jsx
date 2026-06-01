import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function FarmatodoForm() {
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', fechaNacimiento: '', cedula: '', rif: '',
    correo: '', telefono: '', direccion: '', ciudad: '', estado: '',
    farmatodoOpcion1: '', farmatodoOpcion2: '', empleadoActivo: '',
    cuenta_mercantil: ''
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // BLOQUEO EN TIEMPO REAL: Si es la cuenta mercantil, borra inmediatamente lo que no sea número
    if (name === 'cuenta_mercantil') {
      const soloNumeros = value.replace(/\D/g, ''); // Remueve cualquier letra o símbolo
      setFormData({ ...formData, [name]: soloNumeros });
      return;
    }

    setFormData({ ...formData, [name]: value });
    setFormError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // SANITIZACIÓN FINAL ANTES DE SUPABASE
    const cleanData = {
      ...formData,
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      cedula: formData.cedula.trim().toUpperCase(),
      rif: formData.rif.trim().toUpperCase(),
      correo: formData.correo.trim().toLowerCase(),
      telefono: formData.telefono.trim(),
      cuenta_mercantil: formData.cuenta_mercantil.trim()
    };

    // VALIDACIONES DE SEGURIDAD
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
      const { data: estudianteCreado, error: errorEstudiante } = await supabase
        .from('estudiantes')
        .insert([{
            cedula: cleanData.cedula,
            rif: cleanData.rif,
            nombres: cleanData.nombres,
            apellidos: cleanData.apellidos,
            fecha_nacimiento: cleanData.fechaNacimiento,
            correo: cleanData.correo,
            telefono: cleanData.telefono
        }])
        .select().single();

      if (errorEstudiante) throw errorEstudiante;

      const { data: pasantiaCreada, error: errorPasantia } = await supabase
        .from('pasantia_farmatodo')
        .insert([{
            id_estudiante: estudianteCreado.id_estudiante,
            ciudad: cleanData.ciudad,
            cuenta_mercantil: cleanData.cuenta_mercantil,
            empleado_activo: cleanData.empleadoActivo
        }])
        .select().single();

      if (errorPasantia) throw errorPasantia;

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
        
        {/* Encabezado */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Opción 1 de Sucursal Farmatodo</label>
                  <input type="text" name="farmatodoOpcion1" required maxLength="100" value={formData.farmatodoOpcion1} onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                    placeholder="Indique la sucursal de preferencia" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Opción 2 de Sucursal Farmatodo</label>
                  <input type="text" name="farmatodoOpcion2" required maxLength="100" value={formData.farmatodoOpcion2} onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                    placeholder="Indique una sucursal alternativa" />
                </div>
              </div>

              <div>
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