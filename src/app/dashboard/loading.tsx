import { CardSkeleton, KpiSkeleton, PageHeaderSkeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <CardSkeleton className="lg:col-span-2" />
        <CardSkeleton />
      </div>
    </div>
  );
}
