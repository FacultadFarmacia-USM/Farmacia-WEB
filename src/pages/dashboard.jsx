import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import ActivityTable from '../components/activitytable';
import QuickForms from '../components/quickforms';
import StatCard from '../components/statcard';
import FloatingAssistant from '../components/floatingassistant';
import FormsMenu from './FormsMenu';
import RegistroEstudiantes from './RegistroEstudiantes'; 
import Practicas1 from './Practicas1';
import AgregarUsuario from './AgregarUsuario';
import AjustesCuenta from './AjustesCuenta';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('resumen');

  // --- NUEVOS ESTADOS PARA AUTENTICACIÓN Y PERFIL ---
  const [perfil, setPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // --- ESTADO PARA LAS MÉTRICAS DE LAS TARJETAS ---
  const [metricas, setMetricas] = useState({
    total: 0,
    pasantia1: 0,
    pasantia2: 0,
    cargando: true
  });

  useEffect(() => {
    // 1. FUNCIÓN PARA OBTENER EL PERFIL DEL PROFESOR DESDE SUPABASE
    const obtenerPerfil = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profesores')
            .select('*')
            .eq('id_profesor', user.id)
            .single();

          if (error) throw error;
          setPerfil(data);
        }
      } catch (error) {
        console.error("Error al cargar el perfil del docente:", error);
      } finally {
        setCargandoPerfil(false);
      }
    };

    // 2. FUNCIÓN PARA CONTAR ESTUDIANTES AL CARGAR
    const obtenerMetricas = async () => {
      try {
        // Solo traemos la columna 'etapa' para no pesar la app
        const { data, error } = await supabase
          .from('estudiantes')
          .select('etapa');

        if (error) throw error;

        const totalAlumnos = data.length;
        const enPasantia1 = data.filter(est => est.etapa === 'Pasantía 1' || !est.etapa).length;
        const enPasantia2 = data.filter(est => est.etapa === 'Pasantía 2').length;

        setMetricas({
          total: totalAlumnos,
          pasantia1: enPasantia1,
          pasantia2: enPasantia2,
          cargando: false
        });

      } catch (error) {
        console.error("Error cargando métricas:", error);
        setMetricas(prev => ({ ...prev, cargando: false }));
      }
    };

    // Ejecutamos ambas funciones al mismo tiempo cuando carga el dashboard
    obtenerPerfil();
    obtenerMetricas();
  }, []); // Se ejecuta una sola vez

  // --- FUNCIÓN PARA CERRAR SESIÓN ---
  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error al cerrar sesión: " + error.message);
    }
    // No hace falta redirigir aquí. El main.jsx está escuchando y lo hará por ti.
  };

  // PANTALLA DE CARGA MIENTRAS SE VERIFICA QUIÉN ESTÁ LOGUEADO
  if (cargandoPerfil) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary font-bold space-y-4">
        <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
        <p>Cargando entorno de trabajo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased flex relative medical-grid">
      
      {/* Pasamos las propiedades al Sidebar por si pones ahí el botón de salir o el nombre */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        perfil={perfil} 
        cerrarSesion={cerrarSesion} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Pasamos las propiedades al Header por si pones ahí la foto, nombre o botón de salir */}
        <Header 
          perfil={perfil} 
          cerrarSesion={cerrarSesion} 
        />

        <main className="flex-1 p-6 overflow-y-auto">
          
          {currentView === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Resumen</h1>
                <p className="text-sm text-on-surface-variant">
                  {/* Mensaje de bienvenida personalizado */}
                  Bienvenido(a), <span className="font-bold text-primary">{perfil?.nombre_completo || 'Docente'}</span>. Panel de Administración.
                </p>
              </div>

              {/* TARJETAS DE ESTADÍSTICAS CON DATOS REALES DE SUPABASE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="ESTUDIANTES REGISTRADOS" 
                  value={metricas.cargando ? '...' : metricas.total.toString()} 
                  icon="school" 
                  colorTheme="primary" 
                  info="En tiempo real" 
                />
                <StatCard 
                  title="PRÁCTICAS ACTIVAS 1" 
                  value={metricas.cargando ? '...' : metricas.pasantia1.toString()} 
                  icon="vaccines" 
                  colorTheme="secondary" 
                  progress={metricas.total === 0 ? 0 : Math.round((metricas.pasantia1 / metricas.total) * 100)} 
                />
                <StatCard 
                  title="PRÁCTICAS ACTIVAS 2" 
                  value={metricas.cargando ? '...' : metricas.pasantia2.toString()} 
                  icon="local_pharmacy" 
                  colorTheme="tertiary" 
                  progress={metricas.total === 0 ? 0 : Math.round((metricas.pasantia2 / metricas.total) * 100)} 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
                <div className="lg:col-span-2">
                  <ActivityTable />
                </div>
                <div className="lg:col-span-1">
                  <QuickForms />
                </div>
              </div>
            </div>
          )}

          {currentView === 'formularios' && <FormsMenu />}
          {currentView === 'estudiantes' && <RegistroEstudiantes />}
          {currentView === 'practicas1' && <Practicas1 />}
          {currentView === 'agregarUsuario' && <AgregarUsuario />}
          {currentView === 'configuracion' && <AjustesCuenta perfil={perfil} />}

        </main>
      </div>

      <FloatingAssistant />
    </div>
  );
}