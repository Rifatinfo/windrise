"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { HeartIcon, RulerIcon } from "lucide-react";
import { Product } from "@/types/product";
import { SizeGuideModal } from "./SizeGuideModal";
import { ProductGallery } from "./ProductGallery";
import { AddToCartModal, AddedProduct } from "@/components/modules/addToCart/AddToCartModal";
import { useCart } from "@/contexts/CartContext";
import { trackEvent } from "@/lib/eventTracking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductDetailsProps = {
  product: Product;
  category?: string;
  subCategory?: string;
};

const TABS = ["Description", "Fit & Sizing", "Shipping", "Reviews"] as const;
type Tab = (typeof TABS)[number];
const WISHLIST_STORAGE_KEY = "windrise-wishlist";

const ProductDetails = ({
  product,
  category,
  subCategory,
}: ProductDetailsProps) => {
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>("Description");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState<AddedProduct | null>(null);
  const { addItem } = useCart();

  const images = useMemo(() => {
    if (product.images?.length) return product.images;
    return product.thumbnailImage
      ? [
          {
            id: `${product.id}-thumbnail`,
            productId: product.id,
            url: product.thumbnailImage,
          },
        ]
      : [];
  }, [product.id, product.images, product.thumbnailImage]);

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          product.variants
            ?.map((variant) => variant.size)
            .filter(Boolean) as string[],
        ),
      ),
    [product.variants],
  );
  const regularPrice = Number(product.regularPrice);
  const salePrice =
    product.salePrice == null ? null : Number(product.salePrice);
  const hasDiscount = salePrice !== null && salePrice !== regularPrice;
  const price = salePrice ?? regularPrice;
  const categoryPath = category ?? product.categories?.[0]?.category?.name;
  const subCategoryPath =
    subCategory ?? product.subCategories?.[0]?.subCategory?.name;
  const breadcrumb = ["Home", categoryPath, subCategoryPath].filter(
    Boolean,
  ) as string[];

  useEffect(() => {
    try {
      const wishlist = JSON.parse(
        localStorage.getItem(WISHLIST_STORAGE_KEY) ?? "[]",
      ) as string[];
      window.setTimeout(() => setWishlisted(wishlist.includes(product.id)), 0);
    } catch {
      window.setTimeout(() => setWishlisted(false), 0);
    }
  }, [product.id]);

  useEffect(() => {
    trackEvent("PRODUCT_VIEW", { productId: product.id });
  }, [product.id]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(
      localStorage.getItem(WISHLIST_STORAGE_KEY) ?? "[]",
    ) as string[];
    const next = wishlist.includes(product.id)
      ? wishlist.filter((id) => id !== product.id)
      : [...wishlist, product.id];
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    setWishlisted(next.includes(product.id));
    window.dispatchEvent(new CustomEvent("windrise-wishlist-changed"));
  };

  const addToCart = () => {
    if (product.stockStatus === "OUT_OF_STOCK") return;
    if (sizes.length > 0 && !size) {
      setCartMessage("Please select a size.");
      return;
    }

    const selectedVariant = product.variants?.find(
      (variant) => variant.size === size
    );
    const productColor =
      selectedVariant?.color ?? product.variants?.[0]?.color ?? "Charcoal Black";
    const itemPrice = salePrice ?? regularPrice;
    const imageUrl =
      product.thumbnailImage ?? product.images?.[0]?.url ?? "/placeholder.png";

    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      size: size || undefined,
      color: productColor,
      price: itemPrice,
      image: imageUrl,
      quantity,
    });
    trackEvent("ADD_TO_CART", { productId: product.id });

    setAddedProduct({
      name: product.name,
      sku: product.sku,
      size: size || undefined,
      color: productColor,
      quantity,
      price: itemPrice,
      image: imageUrl,
    });
    setCartMessage("Added to cart.");
    setModalOpen(true);
  };

  const description =
    product.fullDescription ??
    product.shortDescription ??
    "No description available.";
  const shipping =
    "Standard delivery is available at checkout. Delivery times may vary by location.";

  return (
    <div className="">
      <div className="min-h-full w-full">
        <main className="mx-auto w-full max-w-[1460px] px-6 pb-14 pt-4 sm:px-6 sm:pt-5 lg:px-10 lg:pb-20 lg:pt-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-[12px] font-light lg:text-lg text-[#9E9E9E]">
              {breadcrumb.map((crumb) => (
                <li key={crumb} className="flex items-center gap-1">
                  <Link href="/" className="transition-colors hover:text-ink">
                    {crumb}
                  </Link>
                  <span aria-hidden="true" className="text-line">
                    /
                  </span>
                </li>
              ))}
              <li aria-current="page" className="text-muted">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-4 grid gap-7 sm:mt-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]  md:mr-20 ld:gap-4">
            <ProductGallery images={images} name={product.name} />
            <div className="w-full lg:pt-1">
              <h1 className="text-[20px] font-light leading-tight text-ink sm:text-[22px] md:text-[29px] font-dm-sans">
                {product.name}
              </h1>
              <p className="mt-1 text-[14px] md:text-xl font-medium text-ink md:mt-3">
                {product.variants?.[0]?.color ?? "Charcoal Black"}
              </p>
              <p className="mt-1.5 text-[11px] md:text-[14px] font-light text-muted">
                SKU: {product.sku}
              </p>
              
              <div className="mt-5 block md:flex md:flex-row items-center gap-4">
                {hasDiscount && (
                  <del className="block md:flex md:flex-row  text-[12px] font-light text-[#666666] line-through decoration-muted md:text-[18px]">
                    ৳{" "}
                    {regularPrice.toLocaleString("en-BD", {
                      minimumFractionDigits: 2,
                    })}
                  </del>
                )}
                <p className="mt-0.5 text-[18px] md:text-[26px] font-medium text-ink">
                  ৳{" "}
                  {price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3.5  md:mt-8">
                {sizes.length > 0 && (
                  <Select
                    value={size}
                    onValueChange={(value) => setSize(value ?? "")}
                  >
                    <SelectTrigger
                      aria-label="Select size"
                      className="!h-10 w-[130px] rounded-none border-line text-[12px] lg:!h-12 border lg:w-[190px] lg:text-[14px]"
                    >
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
               
                <div className="flex h-10 w-[126px] lg:h-12 lg:w-[190px] items-center justify-between border border-line px-4">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted lg:text-[12px]">
                    Qty
                  </span>

                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="text-[15px] leading-none text-muted hover:text-ink lg:text-[20px]"
                  >
                    −
                  </button>

                  <span className="min-w-[20px] text-center text-[13px] text-ink lg:text-[15px]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((value) => Math.min(10, value + 1))
                    }
                    className="text-[15px] leading-none text-muted hover:text-ink lg:text-[20px]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-row items-center gap-3.5 lg:gap-4  md:mt-8">
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={product.stockStatus === "OUT_OF_STOCK"}
                  className="h-10 w-[130px] bg-ink text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 lg:h-12 lg:w-[190px] lg:text-[15px]"
                >
                  {product.stockStatus === "OUT_OF_STOCK"
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-pressed={wishlisted}
                  className="flex h-10 w-[126px] items-center justify-center gap-2 bg-neutral-200 text-[13px] font-medium text-neutral-500 hover:bg-neutral-300 lg:h-12 lg:w-[190px] lg:text-[15px]"
                >
                  <HeartIcon
                    className={
                      wishlisted
                        ? "h-4 w-4 fill-current lg:h-5 lg:w-5"
                        : "h-4 w-4 lg:h-5 lg:w-5"
                    }
                    strokeWidth={1.5}
                  />
                  {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
              </div>
              {cartMessage && (
                <p role="status" className="mt-2 text-[11px] text-muted">
                  {cartMessage}
                </p>
              )}
              <p className="mt-4 max-w-[330px] text-[11px] md:text-[14px] font-light leading-relaxed text-muted  md:mt-6">
                Product color may slightly vary, depending on your device’s
                screen resolution.
              </p>

              <div className="mt-7 border-b border-line/70  md:mt-10">
                <div
                  role="tablist"
                  aria-label="Product information"
                  className="flex gap-5 lg:gap-10"
                >
                  {TABS.map((item) => {
                    const active = item === tab;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setTab(item)}
                        className={`relative cursor-pointer pb-2 text-[11px] lg:text-[16px] ${active ? "font-medium text-ink" : "font-light text-muted hover:text-ink"}`}
                      >
                        {item}
                        {active && (
                          <span className="absolute -bottom-px left-0 h-[1.5px] w-full bg-ink" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                role="tabpanel"
                className="mt-4 max-w-[420px] lg:max-w-[620px]"
              >
                {tab === "Description" && (
                  <p className="text-[12px] font-light leading-relaxed text-ink lg:text-[15px]">
                    {description}
                  </p>
                )}
                {tab === "Fit & Sizing" && (
                  <p className="text-[12px] font-light leading-relaxed text-ink lg:text-[15px]">
                    {sizes.length
                      ? `Available sizes: ${sizes.join(", ")}.`
                      : "Please check the product measurements before ordering."}
                  </p>
                )}
                {tab === "Shipping" && (
                  <p className="text-[12px] font-light leading-relaxed text-ink lg:text-[15px]">
                    {shipping}
                  </p>
                )}
                {tab === "Reviews" && (
                  <p className="text-[12px] font-light leading-relaxed text-ink lg:text-[15px]">
                    Reviews will appear here once customers share their
                    experience.
                  </p>
                )}
                {tab === "Description" && (
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="mt-5 flex items-center gap-1.5 text-[12px] font-light text-[#b08968] hover:opacity-70 lg:text-[14px]"
                  >
                    <RulerIcon
                      className="h-3.5 w-3.5 lg:h-4 lg:w-4"
                      strokeWidth={1.5}
                    />
                    Size Guide
                  </button>
                )}
              </div>
            </div>
          </div>

          <section className="mt-12 lg:mt-16" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-[13px] font-medium text-ink sm:text-[14px]"
            >
              You might also like
            </h2>
            <p className="mt-4 text-[12px] font-light text-muted">
              Explore more products from this collection.
            </p>
          </section>
        </main>
        <AnimatePresence>
          {sizeGuideOpen && (
            <SizeGuideModal
              title={product.name}
              image={product.sizeGuidImage}
              sizes={sizes}
              onClose={() => setSizeGuideOpen(false)}
            />
          )}
        </AnimatePresence>

        {addedProduct && (
          <AddToCartModal
            open={modalOpen}
            product={addedProduct}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
