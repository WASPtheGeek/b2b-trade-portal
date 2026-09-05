"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { DepartmentNav } from "@/components/layout/DepartmentNav";
import { CatalogMegaMenu } from "@/components/layout/CatalogMegaMenu";
import { MobileCategoryDrawer } from "@/components/layout/MobileCategoryDrawer";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { ScrollReveal } from "@/components/features/catalog/ScrollReveal";
import { ProductTile } from "@/components/features/catalog/ProductTile";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/cn";
import { DEPARTMENTS, FOOTER_COLUMNS, MEGA_CATALOG, CATEGORY_TREE, PRODUCTS } from "@/lib/mock-data";
import type { ProductUnit } from "@/types/catalog";

const PRODUCT_TILE_LABELS = {
  maskedCta: "Ienākt, lai redzētu cenu",
  priceNote: "bez PVN",
  wishlistSave: "Saglabāt vēlāk",
  wishlistRemove: "Noņemt no saglabātajiem",
  wishlistSaved: "Saglabāts",
  decreaseQty: "Samazināt daudzumu",
  increaseQty: "Palielināt daudzumu",
  addToCart: "Pievienot grozam",
  addedToCart: "Pievienots grozam",
  add: "Pievienot",
  added: "Pievienots",
};

// Sample product detail page, ported from src/design/ui_kits/storefront/ProductScreen.jsx.
// Guest (masked) browsing: pricing stays locked, matching the homepage's default state.
export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const product = useMemo(() => PRODUCTS.find((p) => p.id === params?.id) ?? PRODUCTS[0]!, [params?.id]);
  const masked = true;

  const units = product.units || [];
  const [unit, setUnit] = useState<ProductUnit["value"] | undefined>(units.find((u) => u.available !== false)?.value ?? units[0]?.value);
  const [qty, setQty] = useState(25);
  const [shot, setShot] = useState(0);
  const [added, setAdded] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => {
    setUnit(units.find((u) => u.available !== false)?.value ?? units[0]?.value);
    setQty(1);
    // Only the product identity should reset the unit/qty selection, not every units[] re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const active = units.find((u) => u.value === unit) ?? units[0];
  const unitPrice = active?.price ?? product.price;
  const related = PRODUCTS.filter((x) => x.id !== product.id).slice(0, 5);
  const specs = product.specs ?? [
    { label: "Zīmols", value: product.brand },
    { label: "Artikuls", value: product.sku },
  ];

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const closeMegaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openMega = () => {
    clearTimeout(closeMegaTimer.current);
    setMega(true);
  };
  const closeMega = (delay = 0) => {
    clearTimeout(closeMegaTimer.current);
    closeMegaTimer.current = setTimeout(() => setMega(false), delay);
  };
  useEffect(() => () => clearTimeout(closeMegaTimer.current), []);

  return (
    <div className="relative min-h-screen bg-surface-warm">
    </div>
  );
}
