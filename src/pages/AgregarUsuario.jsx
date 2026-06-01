import React, { useState } from 'react';
import { supabase, supabaseAdmin } from '../supabaseClient'; 

export default function AgregarUsuario() {
  const [datosUsuario, setDatosUsuario] = useState({
    correo: '',
    nombre_completo: '',
    rol: 'Profesor' // Por defecto
  });
  const [cargando, setCargando] = useState(false);
  const [usuarioCreado, setUsuarioCreado] = useState(null);

  const manejarCambio = (e) => {
    setDatosUsuario({ ...datosUsuario, [e.target.name]: e.target.value });
  };

  const generarContrasena = () => {
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return pass;
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setCargando(true);
    setUsuarioCreado(null);

    try {
      const contrasenaAleatoria = generarContrasena();

      // 1. Crear al usuario en Supabase Auth usando el Cliente Admin
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: datosUsuario.correo,
        password: contrasenaAleatoria,
        email_confirm: true 
      });

      if (authError) throw new Error(`Error en Auth: ${authError.message}`);

      // 2. Insertar el perfil en la tabla usando supabaseAdmin (¡AQUÍ ESTÁ LA CORRECCIÓN!)
      const { error: dbError } = await supabaseAdmin
        .from('profesores')
        .insert([{
          id_profesor: authData.user.id,
          correo: datosUsuario.correo,
          nombre_completo: datosUsuario.nombre_completo,
          rol: datosUsuario.rol
        }]);

      if (dbError) throw new Error(`Error en BD: ${dbError.message}`);

      // 3. Enviar correo nativo de restablecimiento
      await supabase.auth.resetPasswordForEmail(datosUsuario.correo);

      // 4. Mostrar credenciales en pantalla
      setUsuarioCreado({
        ...datosUsuario,
        contrasena: contrasenaAleatoria
      });
      
      setDatosUsuario({ correo: '', nombre_completo: '', rol: 'Profesor' });

    } catch (error) {
      console.error(error);
      alert(`❌ ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Agregar Nuevo Docente</h1>
        <p className="text-sm text-on-surface-variant">
          El sistema generará una contraseña aleatoria y creará el perfil automáticamente.
        </p>
      </div>

      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm">
        
        {usuarioCreado && (
          <div className="bg-success-container text-on-success-container p-6 rounded-xl mb-8 border border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-success">check_circle</span>
              <h3 className="font-bold text-lg">¡Usuario Creado Exitosamente!</h3>
            </div>
            <p className="text-sm mb-4">Se ha registrado a <strong>{usuarioCreado.nombre_completo}</strong> en el sistema.</p>
            
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant">
              <p className="text-xs text-on-surface-variant mb-1 font-bold">CREDENCIALES DE ACCESO:</p>
              <p className="text-sm"><strong className="text-primary">Correo:</strong> {usuarioCreado.correo}</p>
              <p className="text-sm flex items-center gap-2">
                <strong className="text-primary">Contraseña:</strong> 
                <span className="font-mono bg-surface-container px-2 py-1 rounded">{usuarioCreado.contrasena}</span>
              </p>
            </div>
            <p className="text-xs mt-3 opacity-80 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">mail</span> 
              Supabase ha enviado un correo automático a esta dirección.
            </p>
          </div>
        )}

        <form onSubmit={guardarUsuario} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombre Completo</label>
              <input required type="text" name="nombre_completo" value={datosUsuario.nombre_completo} onChange={manejarCambio} placeholder="Ej: Dra. María López" className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Correo Institucional</label>
              <input required type="email" name="correo" value={datosUsuario.correo} onChange={manejarCambio} placeholder="Ej: maria.lopez@farmacia.edu" className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nivel de Acceso (Rol)</label>
            <select name="rol" value={datosUsuario.rol} onChange={manejarCambio} className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
              <option value="Profesor">Profesor (Solo lectura)</option>
              <option value="Coordinador">Coordinador (Edición)</option>
              {/* ¡Opción de Super Admin eliminada! */}
            </select>
          </div>

          <div className="pt-6 border-t border-outline-variant">
            <button type="submit" disabled={cargando} className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50">
              <span className={`material-symbols-outlined text-[20px] ${cargando ? 'animate-spin' : ''}`}>
                {cargando ? 'sync' : 'magic_button'}
              </span>
              Generar Acceso y Registrar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}