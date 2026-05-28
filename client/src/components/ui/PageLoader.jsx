export default function PageLoader({ message = 'Loading your workspace…' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3" role="status">
      <div className="spinner spinner-lg" />
      <p className="text-sm text-stone-500">{message}</p>
    </div>
  );
}
