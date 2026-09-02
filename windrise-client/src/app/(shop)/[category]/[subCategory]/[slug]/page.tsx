import ProductDetails from "@/components/modules/ProductDetails/ProductDetails";
import { getProductBySlug } from "@/services/product/getProductBySlug";
import { getRelatedProducts } from "@/services/product/getRelatedProducts";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    category: string;
    subCategory: string;
    slug: string;
  }>;
}

/** How many "You might also like" cards the widest layout shows. */
const RELATED_LIMIT = 5;

const ProductDetailsPage = async ({ params }: PageProps) => {
  const { slug, category, subCategory } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Fetched on the server so the row arrives with the page rather than
  // appearing a moment later.
  const relatedProducts = await getRelatedProducts(product.id, RELATED_LIMIT);

  return (
    <ProductDetails
      product={product}
      category={category}
      subCategory={subCategory}
      relatedProducts={relatedProducts}
    />
  );
};

export default ProductDetailsPage;
