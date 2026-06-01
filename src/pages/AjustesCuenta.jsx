import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AjustesCuenta({ perfil }) {
  const [datos, setDatos] = useState({ nombre_completo: '', correo: '' });
  const [passwords, setPasswords] = useState({ nueva: '', confirmacion: '' });
  
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [cargandoPass, setCargandoPass] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Verificamos si es Super Admin para bloquear el correo
  const esSuperAdmin = perfil?.rol === 'Super Admin';

  // Llenar los datos cuando carga el componente
  useEffect(() => {
    if (perfil) {
      setDatos({
        nombre_completo: perfil.nombre_completo || '',
        correo: perfil.correo || ''
      });
    }
  }, [perfil]);

  const manejarCambioDatos = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });
  const manejarCambioPass = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  // --- FUNCIÓN PARA ACTUALIZAR NOMBRE Y CORREO ---
  const actualizarPerfil = async (e) => {
    e.preventDefault();
    setCargandoPerfil(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // 1. Si el correo cambió (y no es Super Admin), actualizar en Supabase Auth
      if (datos.correo !== perfil.correo && !esSuperAdmin) {
        const { error: authError } = await supabase.auth.updateUser({ email: datos.correo });
        if (authError) throw new Error(`Error Auth: ${authError.message}`);
      }

      // 2. Actualizar en tu tabla 'profesores'
      const { error: dbError } = await supabase
        .from('profesores')
        .update({ 
          nombre_completo: datos.nombre_completo,
          // Solo actualizamos el correo en la BD si NO es Super Admin
          ...( !esSuperAdmin && { correo: datos.correo } ) 
        })
        .eq('id_profesor', perfil.id_profesor);

      if (dbError) throw new Error(`Error BD: ${dbError.message}`);

      setMensaje({ tipo: 'exito', texto: '✅ Datos del perfil actualizados. (Si cambiaste el correo, revisa tu bandeja de entrada para confirmarlo).' });
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: `❌ ${error.message}` });
    } finally {
      setCargandoPerfil(false);
    }
  };

  // --- FUNCIÓN PARA ACTUALIZAR CONTRASEÑA ---
  const actualizarContrasena = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (passwords.nueva !== passwords.confirmacion) {
      setMensaje({ tipo: 'error', texto: '❌ Las contraseñas nuevas no coinciden.' });
      return;
    }
    if (passwords.nueva.length < 6) {
      setMensaje({ tipo: 'error', texto: '❌ La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setCargandoPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.nueva });
      if (error) throw error;

      setMensaje({ tipo: 'exito', texto: '✅ Contraseña actualizada exitosamente.' });
      setPasswords({ nueva: '', confirmacion: '' }); // Limpiar formulario
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: `❌ ${error.message}` });
    } finally {
      setCargandoPass(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Ajustes de la Cuenta</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Administra tu información personal y credenciales de acceso.
        </p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          mensaje.tipo === 'exito' ? 'bg-success-container text-on-success-container border border-success/30' : 'bg-error-container text-on-error-container border border-error/30'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* FORMULARIO DE DATOS PERSONALES */}
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-4">
          <span className="material-symbols-outlined text-primary">manage_accounts</span>
          <h3 className="font-bold text-lg text-primary">Datos Personales</h3>
        </div>

        <form onSubmit={actualizarPerfil} className="space-y-5 max-w-md">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombre Completo</label>
            <input 
              required type="text" name="nombre_completo" 
              value={datos.nombre_completo} onChange={manejarCambioDatos} 
              className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Correo Electrónico {esSuperAdmin && <span className="text-error ml-1">(Bloqueado para Super Admin)</span>}
            </label>
            <input 
              required type="email" name="correo" 
              value={datos.correo} onChange={manejarCambioDatos}
              disabled={esSuperAdmin}
              className={`w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all ${
                esSuperAdmin ? 'bg-surface-container-high border-transparent text-on-surface-variant/70 cursor-not-allowed' : 'border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'
              }`} 
            />
          </div>

          <button 
            type="submit" disabled={cargandoPerfil} 
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 w-full md:w-auto"
          >
            <span className={`material-symbols-outlined text-[20px] ${cargandoPerfil ? 'animate-spin' : ''}`}>
              {cargandoPerfil ? 'sync' : 'save'}
            </span>
            Guardar Cambios
          </button>
        </form>
      </div>

      {/* FORMULARIO DE CONTRASEÑA */}
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-4">
          <span className="material-symbols-outlined text-primary">lock_reset</span>
          <h3 className="font-bold text-lg text-primary">Cambiar Contraseña</h3>
        </div>

        <form onSubmit={actualizarContrasena} className="space-y-5 max-w-md">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nueva Contraseña</label>
            <input 
              required type="password" name="nueva" 
              value={passwords.nueva} onChange={manejarCambioPass} 
              placeholder="Mínimo 6 caracteres" 
              className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Confirmar Contraseña</label>
            <input 
              required type="password" name="confirmacion" 
              value={passwords.confirmacion} onChange={manejarCambioPass} 
              placeholder="Repite tu nueva contraseña" 
              className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            />
          </div>

          <button 
            type="submit" disabled={cargandoPass} 
            className="flex items-center justify-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 w-full md:w-auto"
          >
            <span className={`material-symbols-outlined text-[20px] ${cargandoPass ? 'animate-spin' : ''}`}>
              {cargandoPass ? 'sync' : 'key'}
            </span>
            Actualizar Contraseña
          </button>
        </form>
      </div>

    </div>
  );
}