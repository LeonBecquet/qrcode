import { CardSkeleton, KpiSkeleton, PageHeaderSkeleton } from "@/components/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <CardSkeleton className="h-72" />
      <CardSkeleton className="h-64" />
    </div>
  );
}
