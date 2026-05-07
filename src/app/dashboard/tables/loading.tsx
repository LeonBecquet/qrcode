import { CardSkeleton, KpiSkeleton, PageHeaderSkeleton } from "@/components/skeleton";

export default function TablesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <CardSkeleton className="h-48" />
      <div className="bg-card h-[420px] rounded-3xl border shadow-sm">
        <div className="bg-muted/40 h-full w-full animate-pulse rounded-3xl" />
      </div>
    </div>
  );
}
