export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  )
}
