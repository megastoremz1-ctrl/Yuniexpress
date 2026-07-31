"use client";

import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  lines,
}: SkeletonProps) {
  const baseStyle = "animate-pulse bg-gray-200";

  const variants = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  if (lines) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(baseStyle, variants.text, className)}
            style={{
              ...style,
              width: i === lines - 1 ? "70%" : width || "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(baseStyle, variants[variant], className)}
      style={style}
    />
  );
}

// Pre-built skeleton patterns for common use cases
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <Skeleton variant="rectangular" className="w-full h-48" />
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="w-3/4 h-3" />
        <Skeleton variant="text" className="w-full h-3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton variant="rounded" className="w-20 h-5" />
          <Skeleton variant="circular" className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Title */}
      <Skeleton variant="rounded" className="w-48 h-7" />
      {/* Content blocks */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton lines={3} />
        <Skeleton variant="rounded" className="w-full h-10" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
          <Skeleton variant="circular" className="w-14 h-14" />
          <Skeleton variant="text" className="w-12 h-3" />
        </div>
      ))}
    </div>
  );
}
