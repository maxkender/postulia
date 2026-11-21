import { Suspense } from "react";
import { OfferPath } from "@/components/OfferPath";

export default function Page() {
  return (
    <Suspense>
      <OfferPath />
    </Suspense>
  );
}
