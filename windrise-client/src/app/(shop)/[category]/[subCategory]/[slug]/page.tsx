import ProductDetails from "@/components/modules/ProductDetails/ProductDetails";
import { getProductBySlug } from "@/services/product/getProductBySlug";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    category: string;
    subCategory: string;
    slug: string;
  }>;
}


const ProductDetailsPage = async ({ params }: PageProps) => {
  const { slug, category, subCategory, } = await params;
 
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetails product={product} category={category} subCategory={subCategory} />;
};


export default ProductDetailsPage;
