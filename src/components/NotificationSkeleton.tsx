"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationItemSkeleton = () => {
  return (
    <Card className="w-full mb-3">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar skeleton */}
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

          <div className="flex-1 space-y-2">
            {/* Username and action skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Content skeleton */}
            <Skeleton className="h-3 w-full max-w-md" />

            {/* Timestamp skeleton */}
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Notification indicator */}
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationSkeleton = () => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Notifications list skeleton */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <NotificationItemSkeleton key={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationSkeleton;
