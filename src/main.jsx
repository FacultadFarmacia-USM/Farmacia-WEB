import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './pages/dashboard.jsx'; 
import FarmatodoForm from './pages/farmatodoform.jsx'; 
import Login from './pages/Login.jsx'; 
import FormularioNuevaPassword from './pages/FormularioNuevaPassword.jsx'; // <-- 1. IMPORTA TU NUEVO COMPONENTE DE CLAVE
import { supabase } from './supabaseClient';
import './index.css';

const App = () => {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [modoRecuperacion, setModoRecuperacion] = useState(false); // <-- 2. NUEVO ESTADO

  // Validamos si la URL contiene el parámetro para el alumno
  const parametrosURL = new URLSearchParams(window.location.search);
  const vistaActual = parametrosURL.get('view');

  useEffect(() => {
    // 1. Revisar si ya hay una sesión guardada al abrir la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargandoSesion(false);
    });

    // 2. Quedarse "escuchando" cambios. Cambiamos "_event" por "event" para poder leerlo.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSesion(session);

      // <-- 3. CAPTURAMOS EL EVENTO DE RECUPERACIÓN AQUÍ
      if (event === 'PASSWORD_RECOVERY') {
        setModoRecuperacion(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- REGLAS DE NAVEGACIÓN ---

  // REGLA 1: Si es el link público del alumno, entra directo al formulario (Sin pedir clave)
  if (vistaActual === 'alumno-farmatodo') {
    return <FarmatodoForm />;
  }

  // Mientras revisa si hay sesión en Supabase, mostramos pantalla blanca o un loader
  if (cargandoSesion) {
    return <div className="h-screen bg-surface flex items-center justify-center text-primary">Cargando...</div>;
  }

  // 🔥 NUEVA REGLA: Si hizo clic en el correo de recuperación, lo interceptamos antes que al Login
  if (modoRecuperacion) {
    return <FormularioNuevaPassword alTerminar={() => setModoRecuperacion(false)} />;
  }

  // REGLA 2: Si es el administrador pero NO ha iniciado sesión, le mostramos el Login
  if (!sesion) {
    return <Login />;
  }

  // REGLA 3: Si es el administrador y SÍ tiene sesión activa, lo dejamos pasar al Dashboard
  return <Dashboard />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);