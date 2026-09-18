"use client";

import { useParams } from "next/navigation";
import { dictionary } from "@/app/_i18n";
import { ProductPage } from "@/components/features/shop/ProductPage";

export default function ProductRoutePage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="relative flex-1 bg-surface-warm">
      <ProductPage id={ Number(params.id) } labels={ dictionary.productPage } />
    </div>
  );
}
