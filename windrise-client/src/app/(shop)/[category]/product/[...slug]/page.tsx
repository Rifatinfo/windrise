
import { notFound } from "next/navigation";
import ProductDetails from "@/components/modules/ProductDetails/ProductDetails";
import { getProductBySlug } from "@/services/product/getProductBySlug";


interface PageProps {
  params: Promise<{
    category: string;
    subCategory: string;
    slug: string[];
  }>;
}


const ProductDetailsPage = async ({ params }: PageProps) => {
  const { category, subCategory, slug } = await params;


  // slug is array
  // example:
  // ["quo-ea-et-anim-offic"]


  const productSlug = slug[slug.length - 1];


  const product = await getProductBySlug(productSlug);


  if (!product) {
    notFound();
  }


  return (
    <div className="mt-20">
      <ProductDetails
        product={product}
        category={category}
        subCategory={subCategory}
      />
    </div>
  );
};


export default ProductDetailsPage;
