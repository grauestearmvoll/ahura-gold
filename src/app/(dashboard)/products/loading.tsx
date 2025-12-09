export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}
