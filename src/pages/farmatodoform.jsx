import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function FarmatodoForm() {
  // 1. Un solo estado unificado con todos tus campos reales de la interfaz
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    cedula: '',
    rif: '',
    correo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado: '', // Estado geográfico (Ej. Miranda)
    farmatodoOpcion1: '',
    farmatodoOpcion2: '',
    empleadoActivo: '',
    cuenta_mercantil: '' // CORRECCIÓN 1: Inicializar el campo en el estado
  });

  const [loading, setLoading] = useState(false);

  // 2. Manejador de cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Procesamiento del envío relacional a Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PASO 1: Insertar en la tabla 'estudiantes'
      const { data: estudianteCreado, error: errorEstudiante } = await supabase
        .from('estudiantes')
        .insert([
          {
            cedula: formData.cedula,
            rif: formData.rif,
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            fecha_nacimiento: formData.fechaNacimiento,
            correo: formData.correo,
            telefono: formData.telefono
            // 'etapa' y 'estado' (académico) se configuran por defecto en la Base de Datos
          }
        ])
        .select() 
        .single();

      if (errorEstudiante) throw errorEstudiante;

      // PASO 2: Insertar en 'pasantia_farmatodo' usando 'id_estudiante'
      const { data: pasantiaCreada, error: errorPasantia } = await supabase
        .from('pasantia_farmatodo')
        .insert([
          {
            id_estudiante: estudianteCreado.id_estudiante,
            ciudad: formData.ciudad,
            cuenta_mercantil: formData.cuenta_mercantil // CORRECCIÓN 2: Enviar el dato a Supabase
          }
        ])
        .select()
        .single();

      if (errorPasantia) throw errorPasantia;

      // PASO 3: Insertar las sucursales en 'farmatodo_sucursales' (4FN)
      const { error: errorSucursales } = await supabase
        .from('farmatodo_sucursales')
        .insert([
          { 
            id_pasantia_farmatodo: pasantiaCreada.id_pasantia_farmatodo,
            prioridad: 1, 
            sucursal: formData.farmatodoOpcion1 
          },
          { 
            id_pasantia_farmatodo: pasantiaCreada.id_pasantia_farmatodo,
            prioridad: 2, 
            sucursal: formData.farmatodoOpcion2 
          }
        ]);

      if (errorSucursales) throw errorSucursales;

      // ¡Éxito total!
      alert('¡Tu solicitud de pasantía ha sido registrada con éxito en el sistema!');
      
      // Limpieza opcional del formulario
      setFormData({
        nombres: '', apellidos: '', fechaNacimiento: '', cedula: '', rif: '',
        correo: '', telefono: '', direccion: '', ciudad: '', estado: '',
        farmatodoOpcion1: '', farmatodoOpcion2: '', empleadoActivo: '',
        cuenta_mercantil: '' // CORRECCIÓN 3: Limpiar el campo tras un envío exitoso
      });

    } catch (error) {
      console.error('Error detallado de Supabase:', error);
      
      if (error.code === '23505') { 
        if (error.message.includes('cedula_unica') || error.message.includes('cedula')) {
          alert(`⚠️ Error: Ya existe una solicitud registrada con la Cédula: ${formData.cedula}.`);
        } 
        else if (error.message.includes('rif_unico') || error.message.includes('rif')) {
          alert(`⚠️ Error: El RIF ${formData.rif} ya está registrado en nuestro sistema.`);
        }
        else if (error.message.includes('correo_unico') || error.message.includes('correo')) {
          alert(`⚠️ Error: El correo electrónico ${formData.correo} ya fue utilizado por otro estudiante.`);
        } 
        else {
          alert('⚠️ Error: Ya existe un registro con estos datos personales (Cédula, RIF o Correo).');
        }
        
      } else {
        alert(`❌ Ocurrió un error de conexión al guardar los datos: ${error.message || 'Inténtalo de nuevo.'}`);
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

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
              <span className="material-symbols-outlined text-lg">badge</span> 1. Datos Personales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Nombres</label>
                <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. María Alejandra" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Apellidos</label>
                <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. González Pérez" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Cédula de Identidad</label>
                <input type="text" name="cedula" required value={formData.cedula} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. V-25123456" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">RIF</label>
                <input type="text" name="rif" required value={formData.rif} onChange={handleChange}
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
                <input type="email" name="correo" required value={formData.correo} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="correo@ejemplo.com" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Teléfono Móvil</label>
                <input type="tel" name="telefono" required value={formData.telefono} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. 0414-1234567" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Dirección de Habitación (Detallada)</label>
                <textarea name="direccion" rows="2" required value={formData.direccion} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Avenida, Calle, Edificio/Casa, Punto de referencia..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Ciudad</label>
                <input type="text" name="ciudad" required value={formData.ciudad} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                  placeholder="Ej. Los Teques" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Estado</label>
                <input type="text" name="estado" required value={formData.estado} onChange={handleChange}
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
                  <input type="text" name="farmatodoOpcion1" required value={formData.farmatodoOpcion1} onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm"
                    placeholder="Indique la sucursal de preferencia" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Opción 2 de Sucursal Farmatodo</label>
                  <input type="text" name="farmatodoOpcion2" required value={formData.farmatodoOpcion2} onChange={handleChange}
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

          {/* CORRECCIÓN 4: Vinculación correcta del input con las variables formData y handleChange */}
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              ¿Posee Cuenta Corriente Mercantil? (Opcional)
            </label>
            <input 
              type="text" 
              name="cuenta_mercantil" 
              maxLength="20" 
              placeholder="Ingrese su número de cuenta de 20 dígitos (si posee)" 
              value={formData.cuenta_mercantil} 
              onChange={handleChange} 
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all text-sm" 
            />
          </div>

          {/* Botón de Envío Dinámico */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-secondary text-on-secondary rounded-lg font-semibold text-sm hover:bg-on-secondary-container transition-colors flex items-center justify-center gap-2 mt-8 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">
              {loading ? 'sync' : 'send'}
            </span> 
            {loading ? 'Enviando Solicitud...' : 'Enviar Solicitud'}
          </button>

        </form>
      </div>
    </div>
  );
}