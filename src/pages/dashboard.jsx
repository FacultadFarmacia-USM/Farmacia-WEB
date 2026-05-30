import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import ActivityTable from '../components/activitytable';
import QuickForms from '../components/quickforms';
import StatCard from '../components/statcard';
import FloatingAssistant from '../components/floatingassistant';
import FormsMenu from './FormsMenu';
import RegistroEstudiantes from './RegistroEstudiantes'; // Importamos el menú nuevo

export default function Dashboard() {
  // Este estado controla qué pestaña interna está viendo el profesor
  const [currentView, setCurrentView] = useState('resumen'); // 'resumen' o 'formularios'

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased flex relative medical-grid">
      
      {/* Pasamos el control de la navegación al Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          
          {/* MUESTRA ESTO SI ESTÁ EN EL RESUMEN */}
          {currentView === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Resumen</h1>
                <p className="text-sm text-on-surface-variant">Panel de Administración de la Facultad de Farmacia</p>
              </div>

              {/* Tarjetas de Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="ESTUDIANTES REGISTRADOS" value="1,248" icon="school" colorTheme="primary" info="+4% desde el semestre pasado" />
                <StatCard title="PRÁCTICAS ACTIVAS 1" value="342" icon="vaccines" colorTheme="secondary" progress={65} />
                <StatCard title="PRÁCTICAS ACTIVAS 2" value="285" icon="local_pharmacy" colorTheme="tertiary" progress={82} />
              </div>

              {/* Tablas y Accesos rápidos */}
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

          {/* MUESTRA ESTO SI DIO CLIC EN FORMULARIOS */}
          {currentView === 'formularios' && (
            <FormsMenu />
          )}
          {currentView === 'estudiantes' && (
            <RegistroEstudiantes />
          )}

        </main>
      </div>

      <FloatingAssistant />
    </div>
  );
}