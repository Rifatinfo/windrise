


import ProductUpdateClient from "@/components/modules/updateProduct/ProductUpdateClient";
import { serverFetch } from "@/lib/server-fetch";


type Props = {
  params: Promise<{ slug: string }>;
};

const ProductUpdatePage = async ({ params }: Props) => {
  const { slug } = await params;

  let data: { success?: boolean; message?: string; data?: unknown } = {};
  try {
    const res = await serverFetch.get(
      `/api/v1/product/slug/${encodeURIComponent(slug)}`,
    );
    data = await res.json();
  } catch (error) {
    console.error("Failed to fetch product for update:", error);
  }

  if (!data.success) {
    return (
      <div className="p-10 text-center text-red-500 text-lg font-semibold">
        {data.message || "Product not found"}
      </div>
    );
  }

  return <ProductUpdateClient product={data.data} slug={slug} />;
};

export default ProductUpdatePage;