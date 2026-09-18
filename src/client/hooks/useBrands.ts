"use client";

import { createListQuery } from "@/hooks/createListQuery";
import { brandService } from "@/services/brandServiceInstance";
import type { Brand } from "@/types/brand";

/** Fetches every brand available to assign to a product, once, on mount. */
export const useBrands = createListQuery<Brand>(brandService);
