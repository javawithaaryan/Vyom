export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="material-symbols-outlined text-4xl text-stone-300 mb-3 select-none">{icon}</span>
      <p className="text-sm font-semibold text-stone-700">{title}</p>
      {description && <p className="text-sm text-stone-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
