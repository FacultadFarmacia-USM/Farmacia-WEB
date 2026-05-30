export default function Header() {
  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-gutter z-10">
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full pl-10 pr-4 py-2 rounded-[12px] border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all font-body-md text-sm text-on-surface placeholder:text-outline" placeholder="Buscar estudiantes, formularios..." type="text" />
        </div>
      </div>
      <button className="md:hidden text-on-surface p-2">
        <span className="material-symbols-outlined">menu</span>
      </button>
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-outline-variant pl-4 ml-2">
          <div className="hidden md:block text-right">
            <div className="font-label-md text-sm font-semibold text-on-surface">Dr. Garrido</div>
            <div className="font-body-md text-xs text-on-surface-variant">Administrador de la Facultad</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-title-lg text-lg font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}