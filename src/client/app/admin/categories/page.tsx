import { dictionary } from "@/app/_i18n";
import { CategoryList } from "@/components/features/admin/categories/CategoryList";

export default function AdminCategoriesPage() {
  return <CategoryList labels={ dictionary.categoryList } formLabels={ dictionary.categoryForm } />;
}
