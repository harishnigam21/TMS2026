import { Suspense } from "react";
import DashboardClient from "./client";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}