import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../supabaseClient'; 

export default function PanelUsuarios() {
  // --- ESTADOS PARA LA TABLA DE USUARIOS ---
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  // --- ESTADOS PARA EL FORMULARIO ---
  const [datosUsuario, setDatosUsuario] = useState({
    correo: '',
    nombre_completo: '',
    rol: 'Profesor' // Por defecto
  });
  const [cargando, setCargando] = useState(false);
  const [usuarioCreado, setUsuarioCreado] = useState(null);

  // ========================================================
  // 1. CARGAR LISTA DE USUARIOS REGISTRADOS
  // ========================================================
  const obtenerUsuarios = async () => {
    try {
      setCargandoLista(true);
      const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .order('nombre_completo', { ascending: true });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar la lista de usuarios:', error);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // ========================================================
  // 2. ELIMINAR ACCESO DE UN USUARIO (REVOCAR)
  // ========================================================
  const eliminarUsuario = async (id_profesor, nombre) => {
    const confirmar = window.confirm(`⚠️ ADVERTENCIA:\n¿Estás seguro de que deseas revocar el acceso a ${nombre}?\nYa no podrá ingresar al sistema.`);
    if (!confirmar) return;

    try {
      // 1. Lo borramos de la base de datos de autenticación usando supabaseAdmin
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id_profesor);
      if (authError) throw new Error(`Auth Error: ${authError.message}`);

      // 2. Lo borramos de la tabla de profesores (por si no tienes el borrado en cascada configurado)
      const { error: dbError } = await supabaseAdmin
        .from('profesores')
        .delete()
        .eq('id_profesor', id_profesor);
        
      if (dbError) console.error("Error al borrar de la tabla:", dbError.message);

      alert('🗑️ Acceso revocado con éxito.');
      obtenerUsuarios(); // Actualizar la tabla

    } catch (error) {
      alert(`❌ Error al eliminar usuario: ${error.message}`);
    }
  };

  // ========================================================
  // 3. FUNCIONES DEL FORMULARIO (TU CÓDIGO ORIGINAL)
  // ========================================================
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

      // 2. Insertar el perfil en la tabla
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

      // 5. ¡Actualizar la tabla de arriba!
      obtenerUsuarios();

    } catch (error) {
      console.error(error);
      alert(`❌ ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Panel de Accesos y Usuarios</h1>
          <p className="text-sm text-on-surface-variant">Administra quién tiene credenciales para entrar al sistema de la Facultad.</p>
        </div>
        <button onClick={obtenerUsuarios} disabled={cargandoLista} className="text-xs bg-surface-container-high text-primary font-semibold hover:bg-primary hover:text-white px-3 py-2 rounded-xl border border-outline-variant transition-colors flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${cargandoLista ? 'animate-spin' : ''}`}>refresh</span> Sincronizar
        </button>
      </div>

      {/* ========================================================= */}
      {/* BLOQUE 1: LISTADO DE USUARIOS REGISTRADOS                  */}
      {/* ========================================================= */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-4 bg-surface-container-low border-b border-outline-variant">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">group</span> Personal Autorizado
          </h2>
        </div>
        
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-container-low/90 backdrop-blur-md border-b border-outline-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Rol en el Sistema</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {cargandoLista ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-on-surface-variant">
                    No hay docentes ni coordinadores registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((user) => (
                  <tr key={user.id_profesor} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-bold text-primary">{user.nombre_completo}</td>
                    <td className="p-4 text-on-surface-variant">{user.correo}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                        user.rol === 'Coordinador' ? 'bg-success-container text-on-success-container' : 
                        user.rol === 'Super Usuario' ? 'bg-primary-container text-on-primary-container' : 
                        'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {user.rol || 'Profesor'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => eliminarUsuario(user.id_profesor, user.nombre_completo)}
                        className="text-error hover:bg-error-container p-2 rounded-lg transition-colors flex items-center justify-center mx-auto"
                        title="Revocar Acceso"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-outline-variant" />

      {/* ========================================================= */}
      {/* BLOQUE 2: FORMULARIO PARA AGREGAR NUEVO USUARIO            */}
      {/* ========================================================= */}
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm max-w-4xl">
        <div className="border-b border-outline-variant pb-3 mb-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">person_add</span> Registrar un Nuevo Docente/Coordinador
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">El sistema generará una contraseña aleatoria, creará el perfil automáticamente y actualizará la tabla de arriba.</p>
        </div>

        {usuarioCreado && (
          <div className="bg-success-container text-on-success-container p-6 rounded-xl mb-8 border border-success/30 animate-in fade-in slide-in-from-top-4">
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
              <input required type="text" name="nombre_completo" value={datosUsuario.nombre_completo} onChange={manejarCambio} placeholder="Ej: Dra. María López" className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Correo Institucional</label>
              <input required type="email" name="correo" value={datosUsuario.correo} onChange={manejarCambio} placeholder="Ej: maria.lopez@farmacia.edu" className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nivel de Acceso (Rol)</label>
            <select name="rol" value={datosUsuario.rol} onChange={manejarCambio} className="w-full px-4 py-3 text-sm border border-outline-variant rounded-xl bg-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
              <option value="Profesor">Profesor</option>
              <option value="Coordinador">Coordinador</option>
            </select>
          </div>

          <div className="pt-6 border-t border-outline-variant flex justify-end">
            <button type="submit" disabled={cargando} className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50">
              <span className={`material-symbols-outlined text-[20px] ${cargando ? 'animate-spin' : ''}`}>
                {cargando ? 'sync' : 'magic_button'}
              </span>
              Generar Acceso y Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}