import { dictionary } from "@/app/_i18n";
import { BrandList } from "@/components/features/admin/brands/BrandList";

export default function AdminBrandsPage() {
  return <BrandList labels={ dictionary.brandList } formLabels={ dictionary.brandForm } />;
}
