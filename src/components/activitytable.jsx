export default function ActivityTable() {
  const students = [
    { name: "Sarah Jenkins", stage: "Prácticas 1", status: "Aprobado", statusColor: "bg-secondary-container/30 text-on-secondary-container", date: "Oct 24, 2024" },
    { name: "Michael Chen", stage: "Registro", status: "Pendiente", statusColor: "bg-surface-variant text-on-surface", date: "Oct 23, 2024" },
    { name: "Emily Rodriguez", stage: "Prácticas 2", status: "Aprobado", statusColor: "bg-secondary-container/30 text-on-secondary-container", date: "Oct 22, 2024" },
    { name: "David Kim", stage: "Prácticas 1", status: "Acción Requerida", statusColor: "bg-error-container/50 text-on-error-container", date: "Oct 21, 2024" },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant flex justify-between items-center">
        <h2 className="font-title-lg text-lg font-semibold text-primary">Actividad Reciente de Estudiantes</h2>
        <button className="text-secondary font-label-md text-sm hover:underline">Ver Todo</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface/50">
              <th className="py-3 px-6 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">NOMBRE DEL ESTUDIANTE</th>
              <th className="py-3 px-6 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">ETAPA DEL PROGRAMA</th>
              <th className="py-3 px-6 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">ESTADO</th>
              <th className="py-3 px-6 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">FECHA</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-sm divide-y divide-outline-variant">
            {students.map((student, index) => (
              <tr key={index} className="hover:bg-surface-container-low transition-colors">
                <td className="py-4 px-6 text-primary font-medium">{student.name}</td>
                <td className="py-4 px-6 text-on-surface-variant">{student.stage}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.statusColor}`}>
                    {student.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-on-surface-variant text-sm">{student.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}