/**
 * Applying what Windee added, exactly once.
 *
 * The bag and the wishlist live in this browser, so a card that says "added"
 * has to actually write to them on arrival. The transcript, though, is
 * refetched — on reload, on reconnect, after a support handoff — and every
 * past `cart-added` card comes back with it. Re-applying on render would
 * multiply a customer's bag every time they reopened the widget.
 *
 * So each card is applied against its message id and that id is remembered in
 * localStorage. The ledger has to outlive the page for the same reason the
 * bag does: a reload is precisely when the duplicates would appear.
 */

import type { CartItem } from "@/contexts/CartContext";
import type { CartLine, WishlistProduct } from "@/services/chatbot/chatbot";

const LEDGER_KEY = "windee.appliedActions";
/** Trimmed so a long-lived visitor doesn't grow this without bound. */
const LEDGER_MAX = 200;

/** The key the storefront's own wishlist button uses. */
const WISHLIST_KEY = "windrise-wishlist";

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    // Private windows and blocked site data throw on access.
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing persists; the action still applied for this page.
  }
};

const alreadyApplied = (messageId: string) =>
  readJson<string[]>(LEDGER_KEY, []).includes(messageId);

const markApplied = (messageId: string) => {
  const ledger = readJson<string[]>(LEDGER_KEY, []).filter((id) => id !== messageId);
  ledger.push(messageId);
  writeJson(LEDGER_KEY, ledger.slice(-LEDGER_MAX));
};

/**
 * Adds the line to the bag, unless this message's line is already in it.
 *
 * Returns whether it did anything, so a caller can tell "just added" from
 * "this is a card from an earlier session".
 */
export function applyCartCard(
  messageId: string,
  item: CartLine,
  addItem: (item: Omit<CartItem, "id">) => void,
): boolean {
  if (!messageId || alreadyApplied(messageId)) return false;

  // Marked first: if adding throws, a retry loop must not be able to add the
  // same line repeatedly.
  markApplied(messageId);

  addItem({
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    size: item.size,
    color: item.color,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
  });

  return true;
}

/** Saves the product id into the same list the product page reads. */
export function applyWishlistCard(
  messageId: string,
  product: WishlistProduct,
): boolean {
  if (!messageId || alreadyApplied(messageId)) return false;

  markApplied(messageId);

  const wishlist = readJson<string[]>(WISHLIST_KEY, []);
  if (!wishlist.includes(product.productId)) {
    writeJson(WISHLIST_KEY, [...wishlist, product.productId]);
  }

  return true;
}

export function isInWishlist(productId: string): boolean {
  return readJson<string[]>(WISHLIST_KEY, []).includes(productId);
}

export function removeFromWishlist(productId: string) {
  writeJson(
    WISHLIST_KEY,
    readJson<string[]>(WISHLIST_KEY, []).filter((id) => id !== productId),
  );
}
