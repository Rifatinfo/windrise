"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ChevronDownIcon, HeartIcon, RulerIcon } from "lucide-react";
import { Product } from "@/types/product";
import { SizeGuideModal } from "./SizeGuideModal";
import { ProductGallery } from "./ProductGallery";

type ProductDetailsProps = {
  product: Product;
  category?: string;
  subCategory?: string;
};

const TABS = ["Description", "Fit & Sizing", "Shipping", "Reviews"] as const;
type Tab = (typeof TABS)[number];
const CART_STORAGE_KEY = "windrise-cart";
const WISHLIST_STORAGE_KEY = "windrise-wishlist";

const ProductDetails = ({ product, category, subCategory }: ProductDetailsProps) => {
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>("Description");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  const images = useMemo(() => {
    if (product.images?.length) return product.images;
    return product.thumbnailImage
      ? [{ id: `${product.id}-thumbnail`, productId: product.id, url: product.thumbnailImage }]
      : [];
  }, [product.id, product.images, product.thumbnailImage]);

  const sizes = useMemo(
    () => Array.from(new Set(product.variants?.map((variant) => variant.size).filter(Boolean) as string[])),
    [product.variants],
  );
  const price = product.salePrice ?? product.regularPrice;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.regularPrice;
  const categoryPath = category ?? product.categories?.[0]?.category?.name;
  const subCategoryPath = subCategory ?? product.subCategories?.[0]?.subCategory?.name;
  const breadcrumb = ["Home", categoryPath, subCategoryPath].filter(Boolean) as string[];

  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) ?? "[]") as string[];
      window.setTimeout(() => setWishlisted(wishlist.includes(product.id)), 0);
    } catch {
      window.setTimeout(() => setWishlisted(false), 0);
    }
  }, [product.id]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) ?? "[]") as string[];
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

    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as Array<{
      productId: string;
      quantity: number;
      size?: string;
    }>;
    const existing = cart.find((item) => item.productId === product.id && item.size === size);
    if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
    else cart.push({ productId: product.id, quantity, ...(size ? { size } : {}) });
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("windrise-cart-changed"));
    setCartMessage("Added to cart.");
  };

  const description = product.fullDescription ?? product.shortDescription ?? "No description available.";
  const shipping = "Standard delivery is available at checkout. Delivery times may vary by location.";

  return (
    <div className="">
      <div className="min-h-full w-full">
        <main className="mx-auto w-full max-w-[1460px] px-4 pb-14 pt-4 sm:px-6 sm:pt-5 lg:px-10 lg:pb-20 lg:pt-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-[12px] font-light lg:text-lg text-[#9E9E9E]">
              {breadcrumb.map((crumb) => (
                <li key={crumb} className="flex items-center gap-1">
                  <Link href="/" className="transition-colors hover:text-ink">{crumb}</Link>
                  <span aria-hidden="true" className="text-line">/</span>
                </li>
              ))}
              <li aria-current="page" className="text-muted">{product.name}</li>
            </ol>
          </nav>

          <div className="mt-4 grid gap-7 sm:mt-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
            <ProductGallery images={images} name={product.name} />
            <div className="lg:pt-1">
              <h1 className="text-[20px] font-light leading-tight text-ink sm:text-[22px] md:text-[29px] font-dm-sans">{product.name}</h1>
              <p className="mt-1 text-[14px] md:text-xl font-medium text-ink">{"Charcoal Black"}</p>
              <p className="mt-1.5 text-[11px] md:text-[14px] font-light text-muted">SKU: {product.sku}</p>
                 <div className="mt-5">
                {hasDiscount && <p className="text-[12px] font-light text-muted line-through">৳ {product.regularPrice.toFixed(2)}</p>}
                <p className="mt-0.5 text-[18px] font-semibold text-ink">৳ {price.toFixed(2)}</p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {sizes.length > 0 && (
                  <label className="relative flex h-9 w-[150px] items-center border border-line px-3">
                    <span className="text-[10px] uppercase tracking-[0.08em] text-muted">Size</span>
                    <select value={size} onChange={(event) => setSize(event.target.value)} aria-label="Select size" className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent pl-12 pr-8 text-[12px] text-ink outline-none">
                      <option value="">Select</option>
                      {sizes.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-muted" strokeWidth={1.5} />
                  </label>
                )}
                <div className="flex h-9 items-center gap-2 border border-line px-3">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted">Qty</span>
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-1 text-[15px] leading-none text-muted hover:text-ink">−</button>
                  <span aria-live="polite" className="min-w-[16px] text-center text-[13px] text-ink">{quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(10, value + 1))} className="px-1 text-[15px] leading-none text-muted hover:text-ink">+</button>
                </div>
              </div>

           
              <div className="mt-5 flex flex-row items-center gap-3">
                <button type="button" onClick={addToCart} disabled={product.stockStatus === "OUT_OF_STOCK"} className="h-10 w-[130px] bg-ink text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40">{product.stockStatus === "OUT_OF_STOCK" ? "Out of Stock" : "Add to Cart"}</button>
                <button type="button" onClick={toggleWishlist} aria-pressed={wishlisted} className="flex h-10 w-[150px] items-center justify-center gap-2 bg-neutral-200 text-[13px] font-medium text-neutral-500 hover:bg-neutral-300"><HeartIcon className={wishlisted ? "h-4 w-4 fill-current" : "h-4 w-4"} strokeWidth={1.5} />{wishlisted ? "Wishlisted" : "Add to Wishlist"}</button>
              </div>
              {cartMessage && <p role="status" className="mt-2 text-[11px] text-muted">{cartMessage}</p>}
              <p className="mt-4 max-w-[330px] text-[11px] font-light leading-relaxed text-muted">Product color may slightly vary, depending on your device’s screen resolution.</p>

              <div className="mt-7 border-b border-line/70"><div role="tablist" aria-label="Product information" className="flex gap-6">{TABS.map((item) => { const active = item === tab; return <button key={item} type="button" role="tab" aria-selected={active} onClick={() => setTab(item)} className={`relative pb-2 text-[13px] cursor-pointer  ${active ? "font-medium text-ink " : "font-light text-muted hover:text-ink"}`}>{item}{active && <span className="absolute -bottom-px left-0 h-[1.5px] w-full bg-ink" />}</button>; })}</div></div>
              <div role="tabpanel" className="mt-4 max-w-[420px]">
                 {tab === "Description" && <p className="text-[12px] font-light leading-relaxed text-ink ">{description}</p>}
                 {tab === "Fit & Sizing" && <p className="text-[12px] font-light leading-relaxed text-ink">{sizes.length ? `Available sizes: ${sizes.join(", ")}.` : "Please check the product measurements before ordering."}</p>}
                 {tab === "Shipping" && <p className="text-[12px] font-light leading-relaxed text-ink">{shipping}</p>}
                 {tab === "Reviews" && <p className="text-[12px] font-light leading-relaxed text-ink">Reviews will appear here once customers share their experience.</p>}
                 {tab === "Description" && <button type="button" onClick={() => setSizeGuideOpen(true)} className="mt-5 flex items-center gap-1.5 text-[12px] font-light text-[#b08968] hover:opacity-70"><RulerIcon className="h-3.5 w-3.5" strokeWidth={1.5} />Size Guide</button>}
              </div>
            </div>
          </div>

          <section className="mt-12 lg:mt-16" aria-labelledby="related-heading"><h2 id="related-heading" className="text-[13px] font-medium text-ink sm:text-[14px]">You might also like</h2><p className="mt-4 text-[12px] font-light text-muted">Explore more products from this collection.</p></section>
        </main>
        <AnimatePresence>{sizeGuideOpen && <SizeGuideModal title={product.name} image={product.sizeGuidImage} sizes={sizes} onClose={() => setSizeGuideOpen(false)} />}</AnimatePresence>
      </div>
    </div>
  );
};

export default ProductDetails;
