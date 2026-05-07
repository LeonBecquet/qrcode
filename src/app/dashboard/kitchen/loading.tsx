import { PageHeaderSkeleton, Skeleton } from "@/components/skeleton";

export default function KitchenLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card space-y-3 rounded-2xl border p-4 shadow-sm">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
