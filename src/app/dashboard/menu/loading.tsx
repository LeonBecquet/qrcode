import { CardSkeleton, PageHeaderSkeleton } from "@/components/skeleton";

export default function MenuLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardSkeleton className="h-72" />
      <CardSkeleton className="h-32" />
    </div>
  );
}
