import { dictionary } from "@/app/_i18n";
import { ProductList } from "@/components/features/admin/products/ProductList";

export default function AdminProductsPage() {
  return <ProductList labels={ dictionary.adminProductList } formLabels={ dictionary.productForm } />;
}
