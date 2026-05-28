export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-live="polite">
      <div className="spinner spinner-lg" />
      <p className="text-sm text-stone-500">{message}</p>
    </div>
  );
}
