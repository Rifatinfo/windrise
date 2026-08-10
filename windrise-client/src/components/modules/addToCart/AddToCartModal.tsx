"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";

export type AddedProduct = {
  name: string;
  sku: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  image: string;
};

type AddToCartModalProps = {
  open: boolean;
  product: AddedProduct;
  onClose: () => void;
};

export function AddToCartModal({ open, product, onClose }: AddToCartModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 mx-4 w-full max-w-[348px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="added-title"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-sm transition-opacity hover:opacity-70"
            >
              <XIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>

            <div className="p-5">
              {/* Top title */}
              <p
                id="added-title"
                className="text-[11px] font-semibold text-[#1a1a1a]"
              >
                Product successfully added to your bag.
              </p>

              <div className="my-3 h-px bg-[#e6e6e6]" />

              {/* Product info */}
              <div className="flex gap-4">
                <div className="relative h-[130px] w-[100px] shrink-0 bg-[#f6f6f6] sm:h-[150px] sm:w-[120px]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-1"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[12px] font-medium leading-tight text-[#1a1a1a]">
                    {product.name}
                  </p>

                  <dl className="mt-2 space-y-[3px] text-[10px]">
                    <div className="flex gap-1">
                      <dt className="text-[#9e9e9e]">Product SKU:</dt>
                      <dd className="text-[#1a1a1a]">{product.sku}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-[#9e9e9e]">Size:</dt>
                      <dd className="text-[#1a1a1a]">{product.size ?? "-"}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-[#9e9e9e]">Color:</dt>
                      <dd className="text-[#1a1a1a]">{product.color ?? "-"}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-[#9e9e9e]">Quantity:</dt>
                      <dd className="text-[#1a1a1a]">{product.quantity}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-[#9e9e9e]">Unit Price:</dt>
                      <dd className="text-[#1a1a1a]">Tk {product.price.toLocaleString("en-BD")}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-[#9e9e9e]">Sub Total:</dt>
                      <dd className="text-[#1a1a1a]">
                        Tk {(product.price * product.quantity).toLocaleString("en-BD")}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="my-4 h-px bg-[#e6e6e6]" />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[32px] flex-1 border border-[#d6d6d6] bg-white text-[9px] font-medium uppercase tracking-[0.06em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/shoppingBag");
                  }}
                  className="h-[32px] flex-1 bg-[#0b0b0b] text-[9px] font-medium uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90"
                >
                  Go to Bag
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
