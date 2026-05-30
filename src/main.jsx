import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './pages/dashboard.jsx'
import FarmatodoForm from './pages/farmatodoform.jsx'
import './index.css'
import './supabaseClient';

// Validamos si la URL contiene el parámetro para el alumno
const parametrosURL = new URLSearchParams(window.location.search);
const vistaActual = parametrosURL.get('view');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* SI el link contiene "?view=alumno-farmatodo" muestra el formulario limpio, sino, el Dashboard de admin */}
    {vistaActual === 'alumno-farmatodo' ? (
      <FarmatodoForm />
    ) : (
      <Dashboard />
    )}
  </React.StrictMode>,
)