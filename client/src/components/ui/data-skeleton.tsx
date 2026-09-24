import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TableListSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-md border"
      data-slot="list-skeleton"
    >
      <div className="flex h-12 items-center gap-4 border-b bg-muted/50 px-4">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={`head-${index}`} className="h-4 min-w-0 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="flex h-16 items-center gap-4 border-t px-4"
        >
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton
              key={column}
              className="h-4 min-w-0 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      data-slot="card-skeleton"
    >
      {Array.from({ length: cards }, (_, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PreferenceListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" data-slot="preference-skeleton">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}

export function NotificationListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="flex flex-col gap-2 px-2 py-2"
      data-slot="notification-skeleton"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-md px-2 py-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function PaginationSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-[140px]" />
        <Skeleton className="size-8" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8" />
      </div>
    </div>
  );
}
