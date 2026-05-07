import { cn } from "@/lib/utils";

/**
 * Skeleton block — animation pulse cohérente partout.
 * Utiliser comme placeholder pendant les loadings.
 */
export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-muted/60 animate-pulse rounded-md", className)}
      {...rest}
    />
  );
}

/**
 * Carte skeleton générique : header + 3 lignes.
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card space-y-3 rounded-2xl border p-5 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

/**
 * KPI skeleton — pour les strips de stats.
 */
export function KpiSkeleton() {
  return (
    <div className="bg-card rounded-2xl border p-4 shadow-sm">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="mt-3 h-8 w-1/3" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}

/**
 * Page header skeleton — icône + titre + description.
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
