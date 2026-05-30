export default function StatCard({ title, value, icon, colorTheme, info, progress }) {
  // Un pequeño mapeo para usar los colores correctos según la tarjeta
  const colorMap = {
    primary: "bg-primary text-primary group-hover:bg-primary-container group-hover:text-on-primary-container",
    secondary: "bg-secondary text-secondary group-hover:bg-secondary-container group-hover:text-on-secondary-container",
    tertiary: "bg-surface-tint text-surface-tint group-hover:bg-surface-variant group-hover:text-surface-tint"
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute top-0 left-0 w-full h-1 bg-${colorTheme === 'tertiary' ? 'surface-tint' : colorTheme}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-body-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">{title}</div>
          <div className="font-headline-lg text-3xl font-bold text-primary">{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center transition-colors ${colorMap[colorTheme]}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
      
      {progress ? (
        <>
          <div className="w-full bg-surface-container-low rounded-full h-1.5 mt-2">
            <div className={`h-1.5 rounded-full bg-${colorTheme === 'tertiary' ? 'surface-tint' : colorTheme}`} style={{ width: `${progress}%` }}></div>
          </div>
          <div className="font-body-md text-xs text-on-surface-variant mt-2 text-right">{progress}% Capacidad</div>
        </>
      ) : (
        <div className="flex items-center gap-2 font-body-md text-xs text-secondary">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span>{info}</span>
        </div>
      )}
    </div>
  );
}