export function AuthFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-11 w-full bg-surface rounded-xl" />
      <div className="h-4 w-32 bg-surface rounded mx-auto" />
      <div className="space-y-3 pt-2">
        <div className="h-10 w-full bg-surface rounded-xl" />
        <div className="h-10 w-full bg-surface rounded-xl" />
        <div className="h-10 w-full bg-primary/20 rounded-xl mt-4" />
      </div>
    </div>
  );
}
