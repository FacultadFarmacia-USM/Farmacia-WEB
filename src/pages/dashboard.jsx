import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import ActivityTable from '../components/activitytable';
// import QuickForms from '../components/quickforms'; <-- Ya no lo necesitamos aquí
import StatCard from '../components/statcard';
import FloatingAssistant from '../components/floatingassistant';
import FormsMenu from './FormsMenu';
import RegistroEstudiantes from './RegistroEstudiantes'; 
import Practicas1 from './Practicas1';
import Practicas2 from './Practicas2'; 
import AgregarUsuario from './AgregarUsuario';
import AjustesCuenta from './AjustesCuenta';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('resumen');

  // --- NUEVOS ESTADOS PARA AUTENTICACIÓN Y PERFIL ---
  const [perfil, setPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // --- ESTADO PARA ESTUDIANTES CULMINADOS ---
  const [estudiantesCulminados, setEstudiantesCulminados] = useState([]);

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
        // Seleccionamos también id, nombres y cédula para armar la lista de culminados
        const { data, error } = await supabase
          .from('estudiantes')
          .select('id_estudiante, nombres, apellidos, cedula, etapa');

        if (error) throw error;

        const totalAlumnos = data.length;
        const enPasantia1 = data.filter(est => est.etapa === 'Pasantía 1' || !est.etapa).length;
        const enPasantia2 = data.filter(est => est.etapa === 'Pasantía 2').length;
        
        // Filtramos los culminados y los guardamos en su estado
        const culminados = data.filter(est => est.etapa === 'Culminado');
        setEstudiantesCulminados(culminados);

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

    obtenerPerfil();
    obtenerMetricas();
  }, []);

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error al cerrar sesión: " + error.message);
    }
  };

  if (cargandoPerfil) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary font-bold space-y-4">
        <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
        <p>Cargando entorno de trabajo...</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-on-background font-body-md antialiased flex relative medical-grid">
      
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        perfil={perfil} 
        cerrarSesion={cerrarSesion} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        
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
                  Bienvenido(a), <span className="font-bold text-primary">{perfil?.nombre_completo || 'Docente'}</span>. Panel de Administración.
                </p>
              </div>

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
                  
                  {/* --- NUEVA SECCIÓN: ESTUDIANTES CULMINADOS --- */}
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col h-full min-h-[350px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-secondary">Estudiantes Culminados</h3>
                      <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-black">
                        Total: {estudiantesCulminados.length}
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[300px]">
                      {estudiantesCulminados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-on-surface-variant text-center">
                          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">school</span>
                          <p className="text-sm font-medium">Aún no hay estudiantes culminados.</p>
                        </div>
                      ) : (
                        estudiantesCulminados.map((est) => (
                          <div key={est.id_estudiante} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-success/10 hover:border-success/30 transition-colors">
                            <div className="w-10 h-10 bg-success/20 text-success rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                              {(est.nombres || 'E').charAt(0)}{(est.apellidos || 'S').charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-on-surface truncate">{est.nombres} {est.apellidos}</p>
                              <p className="text-xs text-on-surface-variant truncate">Cédula: {est.cedula}</p>
                            </div>
                            <div className="text-success shrink-0">
                              <span className="material-symbols-outlined text-xl">workspace_premium</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-outline-variant">
                      <button onClick={() => setCurrentView('estudiantes')} className="w-full text-sm font-bold text-secondary hover:text-primary flex items-center justify-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        Ver registro completo
                      </button>
                    </div>
                  </div>
                  {/* --- FIN NUEVA SECCIÓN --- */}

                </div>
              </div>
            </div>
          )}

          {currentView === 'formularios' && <FormsMenu />}
          {currentView === 'estudiantes' && <RegistroEstudiantes />}
          {currentView === 'practicas1' && <Practicas1 />}
          {currentView === 'practicas2' && <Practicas2 />} 
          {currentView === 'agregarUsuario' && <AgregarUsuario />}
          {currentView === 'configuracion' && <AjustesCuenta perfil={perfil} />}

        </main>
      </div>

      <FloatingAssistant />
    </div>
  );
}