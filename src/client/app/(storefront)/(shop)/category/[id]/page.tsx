"use client";

import { useParams } from "next/navigation";
import { dictionary } from "@/app/_i18n";
import { CategoryPage } from "@/components/features/shop/CategoryPage";
import { decodeRouteParam } from "@/lib/decodeRouteParam";

export default function CategoryRoutePage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="relative flex-1 bg-surface-warm">
      <CategoryPage id={ decodeRouteParam(params.id) } labels={ dictionary.categoryPage } />
    </div>
  );
}
