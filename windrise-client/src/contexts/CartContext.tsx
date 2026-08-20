"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getPublicSettings } from "@/services/settings/settings";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  image: string;
  quantity: number;
};

export type ShippingOption = {
  id: string;
  label: string;
  price: number;
  method: string;
  note: string;
};

const CART_STORAGE_KEY = "windrise-cart";

/** Fallbacks used until the store's configured rates arrive. */
const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "DHAKA_CITY", label: "Inside Dhaka", price: 60, method: "Home Delivery", note: "2-3 business days" },
  { id: "DHAKA_SUBURB", label: "Dhaka Suburb", price: 100, method: "Home Delivery", note: "3-4 business days" },
  { id: "OUTSIDE_DHAKA", label: "Outside Dhaka", price: 130, method: "Courier Delivery", note: "5-7 business days" },
];

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  shippingId: string;
  setShippingId: (id: string) => void;
  shipping: ShippingOption;
  subtotal: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function makeItemId(item: Omit<CartItem, "id">): string {
  return `${item.productId}-${item.size ?? "no-size"}-${item.color ?? "no-color"}`;
}

const EMPTY_CART: CartItem[] = [];
let cachedRaw: string | null = null;
let cachedCart: CartItem[] = EMPTY_CART;

function readCart(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw === cachedRaw) return cachedCart;
    cachedRaw = raw;
    if (!raw) {
      cachedCart = EMPTY_CART;
    } else {
      const parsed = JSON.parse(raw) as CartItem[];
      cachedCart = Array.isArray(parsed) ? parsed : EMPTY_CART;
    }
    return cachedCart;
  } catch {
    cachedRaw = null;
    cachedCart = EMPTY_CART;
    return EMPTY_CART;
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(items);
  localStorage.setItem(CART_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedCart = items;
  window.dispatchEvent(new CustomEvent("windrise-cart-changed"));
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("windrise-cart-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("windrise-cart-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): CartItem[] {
  return readCart();
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [shippingId, setShippingId] = useState<string>(SHIPPING_OPTIONS[0].id);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const current = readCart();
    const id = makeItemId(item);
    const existing = current.find((i) => i.id === id);
    let next: CartItem[];
    if (existing) {
      next = current.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.min(10, i.quantity + item.quantity) }
          : i
      );
    } else {
      next = [...current, { ...item, id }];
    }
    writeCart(next);
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const current = readCart();
    const next = quantity <= 0
      ? current.filter((i) => i.id !== id)
      : current.map((i) => (i.id === id ? { ...i, quantity: Math.min(10, quantity) } : i));
    writeCart(next);
  }, []);

  const removeItem = useCallback((id: string) => {
    const current = readCart();
    const next = current.filter((i) => i.id !== id);
    writeCart(next);
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
  }, []);

  // Delivery rates are configured on the admin Settings page; fall back to
  // the defaults above if the request fails so checkout still works.
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [freeAbove, setFreeAbove] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPublicSettings()
      .then((s) => {
        if (cancelled) return;
        setRates(s.shipping);
        setFreeAbove(s.freeShippingThreshold);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const shippingOptions = useMemo(
    () =>
      SHIPPING_OPTIONS.map((option) => ({
        ...option,
        price: rates?.[option.id] ?? option.price,
      })),
    [rates]
  );

  const subtotalForShipping = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const shipping = useMemo(() => {
    const base =
      shippingOptions.find((o) => o.id === shippingId) ?? shippingOptions[0];
    // Free delivery once the order reaches the configured threshold.
    if (freeAbove !== null && subtotalForShipping >= freeAbove) {
      return { ...base, price: 0 };
    }
    return base;
  }, [shippingOptions, shippingId, freeAbove, subtotalForShipping]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const total = useMemo(() => subtotal + shipping.price, [subtotal, shipping]);

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      shippingId,
      setShippingId,
      shipping,
      subtotal,
      total,
    }),
    [items, itemCount, addItem, setQuantity, removeItem, clearCart, shippingId, shipping, subtotal, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
