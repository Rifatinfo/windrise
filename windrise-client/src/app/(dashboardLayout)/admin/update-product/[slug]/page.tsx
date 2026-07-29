


import ProductUpdateClient from "@/components/modules/updateProduct/ProductUpdateClient";
import { serverFetch } from "@/lib/server-fetch";


type Props = {
  params: Promise<{ slug: string }>;
};

const ProductUpdatePage = async ({ params }: Props) => {
  const {slug} = await params;
  console.log("slug", slug);

  const res = await serverFetch.get(`/api/v1/product/slug/${slug}`);
  const data = await res.json();
  console.log("data" , data, res);

  if (!data.success) {
    return (
      <div className="p-10 text-center text-red-500 text-lg font-semibold">
        Product not found
      </div>
    );
  }

//   const product = await data.json();
  console.log("Product" , data);
  return <ProductUpdateClient product={data.data} slug={slug} />;
};

export default ProductUpdatePage;