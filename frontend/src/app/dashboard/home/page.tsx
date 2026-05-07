import { Suspense } from "react";
import DashboardSkeleton from "./skeleton";
import DashBoardHome from "./client";

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashBoardHome />
    </Suspense>
  );
}
