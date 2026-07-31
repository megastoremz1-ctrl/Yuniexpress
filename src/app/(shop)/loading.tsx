import { ProductGridSkeleton, CategorySkeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Categories skeleton */}
      <div className="bg-white rounded-xl border p-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <CategorySkeleton />
      </div>

      {/* Products grid skeleton */}
      <div>
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
