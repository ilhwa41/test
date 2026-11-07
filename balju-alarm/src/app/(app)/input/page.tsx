import { Suspense } from "react";
import { StockForm } from "@/components/StockForm";

export default function InputPage() {
  return (
    <Suspense>
      <StockForm />
    </Suspense>
  );
}
