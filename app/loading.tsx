export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-xs font-medium text-muted-foreground animate-pulse">
          Loading BookNook...
        </p>
      </div>
    </div>
  );
}
