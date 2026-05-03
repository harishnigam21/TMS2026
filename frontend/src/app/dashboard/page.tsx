import { Suspense } from "react";
import DashboardClient from "./client";
import DashboardSkeleton from "./skeleton";

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}
