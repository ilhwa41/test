import { Suspense } from "react";
import { ItemEdit } from "@/components/ItemEdit";

export default function EditItemPage() {
  return (
    <Suspense>
      <ItemEdit />
    </Suspense>
  );
}
