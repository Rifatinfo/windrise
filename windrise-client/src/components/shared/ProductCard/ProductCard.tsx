"use client";
import { useState } from "react";
import { HeartIcon } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useImageSlider } from "../ImageSlider/useImageSlider";
import { SlideBar } from "../ImageSlider/SlideBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const toSrc = (url: string) =>
  url.startsWith("http") ? url : `${API_URL}${url}`;

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  category?: string;
  subCategory?: string;
  index?: number;
};

export function ProductCard({
  product,
  priority = false,
  category,
  subCategory,
}: ProductCardProps) {
  const images = product.images?.length
    ? product.images.map((image) => image.url)
    : product.thumbnailImage
      ? [product.thumbnailImage]
      : [];

  const { trackRef, activeIndex, goTo, trackDragProps } = useImageSlider(
    Math.max(images.length, 1),
  );
  const [wishlisted, setWishlisted] = useState(false);

  const price = product.salePrice ?? product.regularPrice;
  const hasDiscount =
    product.salePrice !== null && product.salePrice < product.regularPrice;

  const badge = hasDiscount
    ? `-${Math.round(
        (1 - (product.salePrice as number) / product.regularPrice) * 100,
      )}%`
    : null;

  const categorySegment =
    category ?? product.categories?.[0]?.category?.name ?? "";
  const subCategorySegment =
    subCategory ?? product.subCategories?.[0]?.subCategory?.name ?? "";

  const href = categorySegment
    ? `/${encodeURIComponent(categorySegment)}${
        subCategorySegment
          ? `/${encodeURIComponent(subCategorySegment)}`
          : "/product"
      }/${encodeURIComponent(product.slug)}`
    : "#";

  return (
    <article className="w-full">
      {/* 410.67 × 513.33 on large screens, identical 4:5 ratio below */}
      <div className="group relative aspect-[410.67/513.33] w-full overflow-hidden rounded-md bg-neutral-200">
        <div
          ref={trackRef}
          {...trackDragProps}
          className="gallery-track flex h-full w-full overflow-x-auto"
        >
          {images.length > 0 ? (
            images.map((src, index) => (
              <Link
                key={`${product.id}-${index}`}
                href={href}
                tabIndex={index === activeIndex ? 0 : -1}
                aria-label={`${product.name}, view ${index + 1}`}
                className="gallery-slide block h-full w-full min-w-full"
              >
                <img
                  src={src}
                  alt={product.name}
                  draggable={false}
                  loading={priority && index === 0 ? "eager" : "lazy"}
                  className="h-full w-full select-none object-cover"
                />
              </Link>
            ))
          ) : (
            <Link
              href={href}
              aria-label={product.name}
              className="gallery-slide flex h-full w-full min-w-full items-center justify-center text-[12px] font-light text-muted"
            >
              No image
            </Link>
          )}
        </div>

        {!badge && (
          <span className="pointer-events-none absolute left-3 top-3 bg-ink px-2.5 py-[3px] lg:py-2 rounded-sm text-[11px] lg:text-[14px] font-normal leading-none text-white">
            {product.stockStatus == "IN_STOCK" ? "New" : "Sale"}
          </span>
        )}

        <button
          type="button"
          onClick={() => setWishlisted((value) => !value)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className="absolute right-2.5 top-2.5 p-1 text-white transition-transform duration-200 hover:scale-110"
        >
          <HeartIcon
            className={`h-[18px] w-[18px] drop-shadow-sm ${
              wishlisted ? "fill-white" : ""
            }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Thin sliding bar — click, drag or swipe to change image */}
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-3 right-3 sm:bottom-2 sm:left-4 sm:right-4  md:px-4">
            <SlideBar
              count={images.length}
              activeIndex={activeIndex}
              onSelect={goTo}
              label={product.name}
            />
          </div>
        )}
      </div>

      <h3 className="mt-2.5 text-[12px] font-light leading-snug text-[#5D5D5D] lg:text-[15px]">
        <Link href={href} className="transition-opacity hover:opacity-60 ">
          {product.name}
        </Link>
      </h3>
      <p className="mt-1 text-[13px] font-normal text-ink lg:text-[22px]">
       ৳ {price.toFixed(2)}
        {hasDiscount && (
          <span className="ml-2 font-light text-muted line-through">
         ৳ {product.regularPrice.toFixed(2)}
          </span>
        )}
      </p>
    </article>
  );
}

export default ProductCard;
