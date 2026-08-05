import { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const toSrc = (url: string) =>
  url.startsWith("http") ? url : `${API_URL}${url}`;

type ProductDetailsProps = {
    product: Product;
    category?: string;
    subCategory?: string;
};

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const imageSrc = product.thumbnailImage ?? product.images?.[0]?.url ?? null;
  const price = product.salePrice ?? product.regularPrice;

    return (
        <div className="bg-white">
            <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image gallery */}
                    <div className="aspect-w-1 aspect-h-1">
                        {imageSrc ? (
                            <img
                                src={toSrc(imageSrc)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-neutral-200" />
                        )}
                    </div>

                    <div>
                        <h1 className="text-2xl font-medium text-ink">{product.name}</h1>
                        <p className="mt-3 text-lg text-ink">
                            {price.toFixed(2)}
                            {product.salePrice !== null &&
                                product.salePrice < product.regularPrice && (
                                    <span className="ml-2 text-muted line-through">
                                        {product.regularPrice.toFixed(2)}
                                    </span>
                                )}
                        </p>
                        {product.shortDescription && (
                            <p className="mt-4 text-sm font-light text-muted">
                                {product.shortDescription}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;