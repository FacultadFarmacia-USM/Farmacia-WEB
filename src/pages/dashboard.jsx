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

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('resumen');

  // --- NUEVO ESTADO PARA LAS MÉTRICAS DE LAS TARJETAS ---
  const [metricas, setMetricas] = useState({
    total: 0,
    pasantia1: 0,
    pasantia2: 0,
    cargando: true
  });

  // --- FUNCIÓN PARA CONTAR ESTUDIANTES AL CARGAR ---
  useEffect(() => {
    const obtenerMetricas = async () => {
      try {
        // Solo traemos la columna 'etapa' de todos los estudiantes para hacer el conteo sin pesar la app
        const { data, error } = await supabase
          .from('estudiantes')
          .select('etapa');

        if (error) throw error;

        // Matemáticas simples: filtramos y contamos la longitud de los arreglos
        const totalAlumnos = data.length;
        // Asumimos que si la etapa está vacía, están en Pasantía 1 por defecto
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

    obtenerMetricas();
  }, []); // Se ejecuta una sola vez al cargar el Dashboard

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased flex relative medical-grid">
      
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          
          {currentView === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Resumen</h1>
                <p className="text-sm text-on-surface-variant">Panel de Administración de la Facultad de Farmacia</p>
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

        </main>
      </div>

      <FloatingAssistant />
    </div>
  );
}