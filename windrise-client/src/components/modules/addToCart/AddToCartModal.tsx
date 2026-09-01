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
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 mx-4 w-full max-w-[500px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="added-title"
          >
            <div className="p-[18px]">
              {/* Top title, with the close control sharing its line */}
              <div className="flex items-start justify-between gap-3">
                <p
                  id="added-title"
                  className="text-[10px] font-semibold leading-[14px] text-[#1a1a1a]"
                >
                  Product successfully added to your bag.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-[#f2f2f2] text-[#4a4a4a] transition-colors hover:bg-[#e4e4e4]"
                >
                  <XIcon className="h-[11px] w-[11px]" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-4 h-px bg-[#e6e6e6]" />

              {/* Product info — stacked with a centred image on phones,
                  side by side from sm up */}
              <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-[18px]">
                <div className="relative h-[220px] w-[172px] shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex w-full min-w-0 flex-1 flex-col">
                  <p className="text-[11.5px] font-medium leading-tight text-[#1a1a1a]">
                    {product.name}
                  </p>

                  <dl className="mt-5 space-y-[7px] text-[9.5px]">
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

              <div className="mt-[18px] h-px bg-[#e6e6e6]" />

              {/* Buttons split the row on phones; from sm up they shrink to
                  their labels and sit at the outer edges */}
              <div className="mt-[18px] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[32px] flex-1 whitespace-nowrap border border-[#d6d6d6] bg-white px-2 text-[8.5px] font-medium uppercase tracking-[0.06em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] sm:h-[26px] sm:flex-none sm:min-w-[112px] sm:px-3"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/shoppingBag");
                  }}
                  className="h-[32px] flex-1 whitespace-nowrap bg-[#0b0b0b] px-2 text-[8.5px] font-medium uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90 sm:h-[26px] sm:flex-none sm:min-w-[112px] sm:px-3"
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
