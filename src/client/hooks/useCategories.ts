"use client";

import { createListQuery } from "@/hooks/createListQuery";
import { categoryService } from "@/services/categoryServiceInstance";
import type { Category } from "@/types/category";

/** Fetches every admin-visible category, once, on mount. */
export const useCategories = createListQuery<Category>(categoryService);
