export default function FloatingAssistant() {
  return (
    <div className="fixed bottom-8 right-8 z-50 group flex flex-col items-end">
      <div className="mb-3 bg-surface-container-lowest text-on-surface border border-outline-variant px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
        <p className="font-label-md text-sm">¿En qué puedo ayudarte?</p>
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-surface-container-lowest border-r border-b border-outline-variant rotate-45"></div>
      </div>
      <button className="relative p-1 bg-surface-container-lowest rounded-full shadow-xl border-2 border-[#001c3a] hover:scale-105 transition-transform duration-200">
        <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-surface-container-high text-primary">
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
        </div>
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-secondary border-2 border-surface-container-lowest rounded-full"></div>
      </button>
    </div>
  );
}