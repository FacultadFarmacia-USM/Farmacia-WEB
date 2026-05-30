export default function QuickForms() {
  const forms = [
    { name: "Formulario de Evaluación", icon: "assignment" },
    { name: "Registro de Asistencia", icon: "fact_check" },
    { name: "Informe Final", icon: "analytics" }
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm h-full">
      <h2 className="font-title-lg text-lg font-semibold text-primary mb-4 border-b border-outline-variant pb-4">Formularios Frecuentes</h2>
      <div className="space-y-3">
        {forms.map((form, index) => (
          <button key={index} className="w-full flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:border-secondary hover:bg-surface-container-low transition-all group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-outline group-hover:text-secondary">{form.icon}</span>
              <span className="font-label-md text-sm text-on-surface group-hover:text-primary">{form.name}</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary">arrow_forward</span>
          </button>
        ))}
        <button className="w-full mt-4 py-3 bg-secondary text-on-secondary rounded-lg font-label-md text-sm hover:bg-on-secondary-container transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> Nueva Solicitud
        </button>
      </div>
    </div>
  );
}