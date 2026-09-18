import { apiClient } from "@/lib/http/apiClient";
import { HttpCategoryService } from "./HttpCategoryService";
import type { CategoryService } from "./CategoryService";

/** Shared `CategoryService` instance used across the app. */
export const categoryService: CategoryService = new HttpCategoryService(apiClient);
