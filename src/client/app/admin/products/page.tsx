import { dictionary } from "@/app/_i18n";
import { ProductList } from "@/components/features/admin/products/ProductList";

interface AdminProductsPageProps {
  searchParams: Promise<{ edit?: string | string[] }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  // `?edit={id}` deep-links straight into a product's edit form, e.g. from the import details.
  const { edit } = await searchParams;
  const editProductId = Number(Array.isArray(edit) ? edit[0] : edit);

  return (
    <ProductList
      labels={ dictionary.adminProductList }
      formLabels={ dictionary.productForm }
      initialEditProductId={ Number.isInteger(editProductId) && editProductId > 0 ? editProductId : undefined }
    />
  );
}
