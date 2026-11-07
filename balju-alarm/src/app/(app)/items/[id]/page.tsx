import { Suspense } from "react";
import { ItemDetail } from "@/components/ItemDetail";

export default function ItemPage() {
  return (
    <Suspense>
      <ItemDetail />
    </Suspense>
  );
}
