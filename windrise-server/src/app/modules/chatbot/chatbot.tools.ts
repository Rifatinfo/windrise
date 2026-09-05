import { OrderStatus } from "@prisma/client";

import prisma from "../../../shared/prisma";
import { DELIVERY_CHARGE } from "../../../config/delivery.config";
import { orderService } from "../order/order.service";
import type { ToolSpec } from "./chatbot.ai";

/**
 * What Windee is allowed to do against the database.
 *
 * Two rules run through all of it:
 *
 *  1. **Ownership is proved by order number plus phone**, the same pair the
 *     public tracking page requires. A visitor is anonymous, so nothing may be
 *     read or changed on the strength of an order number alone.
 *  2. **The model cannot write.** `create_order` and `cancel_order` only price
 *     and validate a proposal, then park it on the session; the commit runs
 *     from `commitPending`, reached solely by an explicit confirm from the
 *     customer. Asking the model to make a second "confirm" tool call was not
 *     reliable in testing, and a mis-set flag would have meant a real order —
 *     so a misread conversation now cannot place or cancel anything.
 */

/** Last ten digits, matching how the order service compares phones. */
const normalizePhone = (value: string) => value.replace(/\D/g, "").slice(-10);

/**
 * Statuses a customer may still call off from chat.
 *
 * Everything past PROCESSED is deliberately absent. Once an order is
 * ON_THE_WAY it is with the courier: cancelling the record would leave a
 * parcel in the field against a cancelled order, and the stock restore would
 * count in goods nobody has back yet. DELIVERED is a return, not a
 * cancellation, and goes through the returns flow.
 */
export const CANCELLABLE: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSED,
];

const readableStatus = (status: OrderStatus) =>
  status.replace(/_/g, " ").toLowerCase();

/**
 * The single eligibility rule, checked when the cancellation is proposed and
 * again when it is committed.
 *
 * Checking twice is the point. Minutes can pass between Windee offering the
 * Confirm button and the customer pressing it, and an order that was
 * PROCESSED when the summary was drawn may be ON_THE_WAY by then. Without the
 * second check the restriction is only a UI suggestion.
 */
export const cancellationRefusal = (order: {
  orderStatus: OrderStatus;
}): string | null => {
  if (order.orderStatus === OrderStatus.CANCELED) {
    return "That order is already cancelled.";
  }

  if (!CANCELLABLE.includes(order.orderStatus)) {
    return `That order is already ${readableStatus(order.orderStatus)}, so it can't be cancelled from chat any more. Offer to connect the customer to the support team.`;
  }

  return null;
};

const money = (value: number) => `৳${Math.round(value)}`;

/** What the customer actually pays: the sale price when one is set. */
const effectivePrice = (p: { regularPrice: number; salePrice: number | null }) =>
  p.salePrice ?? p.regularPrice;

// --------------------------------------------------------------------------
// Tool schemas advertised to the model
// --------------------------------------------------------------------------

export const TOOLS: ToolSpec[] = [
  {
    type: "function",
    function: {
      name: "track_order",
      description:
        "Look up an order's status, items and delivery estimate. Requires both the order number and the phone number on the order.",
      parameters: {
        type: "object",
        properties: {
          orderNo: { type: "string", description: "Order number, e.g. WR-2026-12567" },
          phone: { type: "string", description: "Phone number used on the order" },
        },
        required: ["orderNo", "phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the catalogue by keywords. Use this for product questions and after describing an image the customer sent, passing what you can see (garment type, colour, style).",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keywords, e.g. 'twill joggers olive'" },
          limit: { type: "number", description: "Max results, 1-8. Default 6." },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Full detail for one product: price, description, and the sizes and colours actually in stock. Call before helping someone order it.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "Product id from search_products" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_store_info",
      description:
        "Live delivery charges per zone, delivery timeframes, and the store's support contacts. Use for shipping, delivery and returns questions instead of guessing.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description:
        "Put a product in the customer's shopping bag. If the product comes in sizes or colours you MUST pass the exact size and colour the customer chose — call get_product_details first and ask them if you don't know. This does not buy anything; it only fills the bag they check out with.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "Product id from search_products" },
          quantity: { type: "number", description: "How many. Defaults to 1." },
          size: { type: "string", description: "Exactly as listed by get_product_details" },
          color: { type: "string", description: "Exactly as listed by get_product_details" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_wishlist",
      description:
        "Save a product to the customer's wishlist for later. Use when they like something but aren't buying now. No size or colour needed.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "Product id from search_products" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_order",
      description:
        "Propose cancelling an order. This does NOT cancel anything — it returns a summary and the customer is shown Confirm/Cancel buttons. Call it once; do not call it again to confirm. Orders that have already left the warehouse (on the way, delivered) cannot be cancelled here; the tool will say so.",
      parameters: {
        type: "object",
        properties: {
          orderNo: { type: "string" },
          phone: { type: "string", description: "Phone number on the order" },
        },
        required: ["orderNo", "phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_order",
      description:
        "Propose a cash-on-delivery order. This does NOT place it — it prices the order and the customer is shown Confirm/Cancel buttons. Collect every field first by asking one question at a time, then call this once.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Products to order.",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "number" },
                size: { type: "string" },
                color: { type: "string" },
              },
              required: ["productId", "quantity"],
            },
          },
          name: { type: "string", description: "Recipient's full name" },
          phone: { type: "string" },
          state: { type: "string", description: "District or area" },
          address: { type: "string", description: "Full street address" },
          deliveryType: {
            type: "string",
            enum: ["DHAKA_CITY", "DHAKA_SUBURB", "OUTSIDE_DHAKA"],
          },
        },
        required: ["items", "name", "phone", "state", "address", "deliveryType"],
      },
    },
  },
];

// --------------------------------------------------------------------------
// Implementations
// --------------------------------------------------------------------------

type ToolOutput = { result: unknown; card?: unknown };

export type ToolContext = {
  sessionId: string;
  userId?: string;
  userEmail?: string;
};

const trackOrder = async (args: Record<string, unknown>): Promise<ToolOutput> => {
  const order = await orderService.trackOrderService(
    String(args.orderNo ?? ""),
    String(args.phone ?? ""),
  );

  return {
    result: {
      ok: true,
      orderNo: order.orderNo,
      status: order.orderStatus,
      placedAt: order.placedAt,
      estimatedDeliveryAt: order.estimatedDeliveryAt,
      deliveredAt: order.deliveredAt,
      total: order.totalAmount,
      items: order.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
    },
    // Rendered as the order card in the transcript.
    card: {
      kind: "order",
      orderNo: order.orderNo,
      status: order.orderStatus,
      placedAt: order.placedAt,
      totalAmount: order.totalAmount,
      paymentMethod: "Cash on Delivery",
      items: order.items,
    },
  };
};

const searchProducts = async (args: Record<string, unknown>): Promise<ToolOutput> => {
  const query = String(args.query ?? "").trim();
  const take = Math.min(Math.max(Number(args.limit) || 6, 1), 8);

  if (!query) return { result: { ok: false, error: "Empty search" } };

  const terms = query.split(/\s+/).slice(0, 6);

  /** Everywhere a single word may match, variants included. */
  const matches = (term: string) => ({
    OR: [
      { name: { contains: term, mode: "insensitive" as const } },
      { shortDescription: { contains: term, mode: "insensitive" as const } },
      { fullDescription: { contains: term, mode: "insensitive" as const } },
      { sku: { contains: term, mode: "insensitive" as const } },
      // Colour and size live on variants — "olive green" is found nowhere else.
      {
        variants: {
          some: {
            OR: [
              { color: { contains: term, mode: "insensitive" as const } },
              { size: { contains: term, mode: "insensitive" as const } },
            ],
          },
        },
      },
      // Categories are join relations here, not columns on the product.
      {
        categories: {
          some: { category: { name: { contains: term, mode: "insensitive" as const } } },
        },
      },
      {
        subCategories: {
          some: { subCategory: { name: { contains: term, mode: "insensitive" as const } } },
        },
      },
      { tags: { some: { name: { contains: term, mode: "insensitive" as const } } } },
    ],
  });

  const base = { isDeleted: false, isActive: true };
  const include = {
    images: { take: 1 },
    variants: true,
    // Needed to build a product link: the storefront route is
    // /{category}/{subCategory}/{slug}, so a card carrying only the slug
    // cannot link anywhere valid.
    categories: { take: 1, include: { category: { select: { name: true } } } },
    subCategories: { take: 1, include: { subCategory: { select: { name: true } } } },
  };

  // Every word first, so "olive joggers" cannot match a shirt that merely
  // mentions olive. A conversational query often carries a word the catalogue
  // has never heard of, though, and returning nothing sends the model down a
  // dead end — so widen to any word rather than give up.
  let products = await prisma.product.findMany({
    where: { ...base, AND: terms.map(matches) },
    include,
    take,
  });

  if (products.length === 0 && terms.length > 1) {
    products = await prisma.product.findMany({
      where: { ...base, OR: terms.map(matches) },
      include,
      take,
    });
  }

  const shaped = products.map((p) => ({
    productId: p.id,
    name: p.name,
    sku: p.sku,
    price: effectivePrice(p),
    slug: p.slug,
    category: p.categories[0]?.category?.name ?? null,
    subCategory: p.subCategories[0]?.subCategory?.name ?? null,
    image: p.thumbnailImage ?? p.images[0]?.url ?? null,
    inStock: p.variants.length
      ? p.variants.some((v) => v.quantity > 0)
      : (p.stockQuantity ?? 0) > 0,
  }));

  return {
    result: { ok: true, count: shaped.length, products: shaped },
    card: shaped.length
      ? { kind: "products", title: query, products: shaped }
      : undefined,
  };
};

const getProductDetails = async (args: Record<string, unknown>): Promise<ToolOutput> => {
  const product = await prisma.product.findFirst({
    where: { id: String(args.productId ?? ""), isDeleted: false, isActive: true },
    include: { images: true, variants: true },
  });

  if (!product) return { result: { ok: false, error: "No such product" } };

  const available = product.variants.filter((v) => v.quantity > 0);
  const inStock = product.variants.length
    ? available.length > 0
    : (product.stockQuantity ?? 0) > 0;

  return {
    result: {
      ok: true,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: effectivePrice(product),
      regularPrice: product.regularPrice,
      onSale: product.salePrice !== null,
      description: (product.shortDescription ?? product.fullDescription ?? "").slice(0, 600),
      // Real combinations, not independent lists of sizes and colours. Given
      // those separately the model happily offers a size from one variant with
      // a colour from another and the order then fails at checkout.
      available: available.map((v) => ({
        size: v.size,
        color: v.color,
        quantity: v.quantity,
      })),
      // Named explicitly so the model says "out of stock" rather than offering it.
      inStock,
    },
  };
};

/**
 * The bag and the wishlist live in the shopper's own browser, alongside every
 * item they added by hand — there is no server-side cart, and a guest has no
 * account to hang one off. So these two tools do not write: they resolve the
 * product against the catalogue, prove the variant is real and in stock, price
 * it from the database, and hand the widget a card carrying exactly the line
 * the storefront's own "Add to cart" would have produced. The widget applies
 * it to the same store the header count and checkout read.
 *
 * That keeps one cart rather than two, and keeps the model out of the numbers:
 * it chooses *which* product, never what it costs or whether it is available.
 */
const sameOption = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

const addToCart = async (args: Record<string, unknown>): Promise<ToolOutput> => {
  const productId = String(args.productId ?? "").trim();
  if (!productId) return { result: { ok: false, error: "No product id given." } };

  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false, isActive: true },
    include: { images: { take: 1 }, variants: true },
  });

  if (!product) {
    return { result: { ok: false, error: "That product isn't available any more." } };
  }

  // A quantity is a small integer; anything else is the model guessing.
  const quantity = Math.min(
    10,
    Math.max(1, Math.floor(Number(args.quantity) || 1)),
  );

  const requestedSize = args.size ? String(args.size) : undefined;
  const requestedColor = args.color ? String(args.color) : undefined;

  let size: string | undefined;
  let color: string | undefined;

  if (product.variants.length > 0) {
    const inStock = product.variants.filter((v) => v.quantity > 0);

    // Refusing to guess is the whole point: a bag line whose size and colour
    // were invented fails at checkout, long after Windee said "added".
    if (!requestedSize && !requestedColor) {
      return {
        result: {
          ok: false,
          error:
            "This product needs a size and colour. Ask the customer which they want, then call this again.",
          available: inStock.map((v) => ({ size: v.size, color: v.color })),
        },
      };
    }

    const variant = product.variants.find(
      (v) =>
        (!requestedSize || sameOption(v.size, requestedSize)) &&
        (!requestedColor || sameOption(v.color, requestedColor)),
    );

    if (!variant) {
      return {
        result: {
          ok: false,
          error: "That size and colour combination doesn't exist for this product.",
          available: inStock.map((v) => ({ size: v.size, color: v.color })),
        },
      };
    }

    if (variant.quantity < quantity) {
      return {
        result: {
          ok: false,
          error:
            variant.quantity > 0
              ? `Only ${variant.quantity} left in that size and colour.`
              : "That size and colour is out of stock.",
          available: inStock.map((v) => ({ size: v.size, color: v.color })),
        },
      };
    }

    // Stored as the catalogue spells it, not as the customer typed it, so the
    // line matches at checkout.
    size = variant.size ?? undefined;
    color = variant.color ?? undefined;
  } else if ((product.stockQuantity ?? 0) < quantity) {
    return { result: { ok: false, error: `${product.name} doesn't have that many in stock.` } };
  }

  const price = effectivePrice(product);

  return {
    result: {
      ok: true,
      added: true,
      message:
        "The item is in the customer's bag. Say so in one short sentence — the card on screen already shows the product, price and options.",
      product: { name: product.name, quantity, size, color, price },
    },
    card: {
      kind: "cart-added",
      // Everything the storefront cart needs for a line, and nothing more.
      item: {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        size,
        color,
        price,
        image: product.thumbnailImage ?? product.images[0]?.url ?? "",
        quantity,
      },
    },
  };
};

const addToWishlist = async (args: Record<string, unknown>): Promise<ToolOutput> => {
  const productId = String(args.productId ?? "").trim();
  if (!productId) return { result: { ok: false, error: "No product id given." } };

  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false, isActive: true },
    include: {
      images: { take: 1 },
      categories: { take: 1, include: { category: { select: { name: true } } } },
      subCategories: { take: 1, include: { subCategory: { select: { name: true } } } },
    },
  });

  if (!product) {
    return { result: { ok: false, error: "That product isn't available any more." } };
  }

  return {
    result: {
      ok: true,
      saved: true,
      message:
        "Saved to their wishlist. Confirm it in one short sentence; the card already shows the product.",
      product: { name: product.name, price: effectivePrice(product) },
    },
    card: {
      kind: "wishlist-added",
      product: {
        productId: product.id,
        name: product.name,
        price: effectivePrice(product),
        slug: product.slug,
        category: product.categories[0]?.category?.name ?? null,
        subCategory: product.subCategories[0]?.subCategory?.name ?? null,
        image: product.thumbnailImage ?? product.images[0]?.url ?? null,
      },
    },
  };
};

const getStoreInfo = async (): Promise<ToolOutput> => {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "singleton" },
  });

  return {
    result: {
      ok: true,
      currency: "BDT",
      delivery: {
        DHAKA_CITY: settings?.shippingDhakaCity ?? DELIVERY_CHARGE.DHAKA_CITY,
        DHAKA_SUBURB: settings?.shippingDhakaSuburb ?? DELIVERY_CHARGE.DHAKA_SUBURB,
        OUTSIDE_DHAKA: settings?.shippingOutsideDhaka ?? DELIVERY_CHARGE.OUTSIDE_DHAKA,
      },
      freeShippingThreshold: settings?.freeShippingThreshold ?? null,
      support: {
        email: settings?.supportEmail ?? null,
        phone: settings?.supportPhone ?? null,
      },
      returns:
        "Returns and exchanges are requested against a delivered order and reviewed by the team; approved returns are restocked automatically. The exact eligibility window is not configured in the system — hand the customer to support for it rather than quoting a number.",
    },
  };
};

const cancelOrder = async (
  args: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolOutput> => {
  const orderNo = String(args.orderNo ?? "").trim().replace(/^#+/, "");
  const phone = normalizePhone(String(args.phone ?? ""));

  if (!orderNo || !phone) {
    return { result: { ok: false, error: "Both the order number and phone are required." } };
  }

  const order = await prisma.order.findFirst({
    where: { OR: [{ orderNo }, { id: orderNo }] },
    include: { items: true },
  });

  // Same wording whether the order is missing or the phone does not match, so
  // the tool cannot be used to probe which order numbers exist.
  if (!order || normalizePhone(order.phone) !== phone) {
    return {
      result: {
        ok: false,
        error: "No order matches that order number and phone number.",
      },
    };
  }

  const refusal = cancellationRefusal(order);
  if (refusal) {
    return { result: { ok: false, error: refusal, status: order.orderStatus } };
  }

  const summary = {
    orderNo: order.orderNo,
    status: order.orderStatus,
    total: money(order.totalAmount),
    items: order.items.map((i) => `${i.quantity} x ${i.productName}`),
  };

  // Parked for the customer to approve. Nothing is cancelled here. The phone
  // that proved ownership is stored with it so the commit can re-prove it
  // rather than trusting an order id sitting on the session.
  await savePending(context.sessionId, {
    kind: "cancel_order",
    payload: { orderId: order.id, phone },
    summary,
  });

  return {
    result: {
      ok: true,
      requiresConfirmation: true,
      message:
        "Nothing has been cancelled. The customer now has Confirm and Cancel buttons on screen — tell them briefly what will be cancelled and ask them to use those buttons. Do not call this tool again.",
      order: summary,
    },
    card: {
      kind: "confirm-cancel",
      requiresConfirmation: true,
      orderNo: summary.orderNo,
      total: order.totalAmount,
      items: summary.items,
    },
  };
};

const createOrder = async (
  args: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolOutput> => {
  const rawItems = Array.isArray(args.items) ? args.items : [];

  if (rawItems.length === 0) {
    return { result: { ok: false, error: "No items given." } };
  }

  const deliveryType = String(args.deliveryType ?? "");
  const deliveryCharge = DELIVERY_CHARGE[deliveryType];

  if (deliveryCharge === undefined) {
    return { result: { ok: false, error: "Pick a delivery zone first." } };
  }

  // Price and stock are read from the database, never from the model's
  // arguments — otherwise a hallucinated price would become a real order.
  const items = rawItems as { productId: string; quantity: number; size?: string; color?: string }[];
  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((i) => i.productId) },
      isDeleted: false,
      isActive: true,
    },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: { name: string; quantity: number; unit: number; total: number; size?: string; color?: string }[] = [];

  /**
   * The cart as the order service will receive it, with size and colour taken
   * from the matched variant rather than from the model.
   *
   * The lookup here is deliberately forgiving about case and spacing, but
   * `createOrderService` matches variants exactly — so passing the customer's
   * "olive green" straight through validates here and then fails at commit
   * with "Variant not found".
   */
  const resolved: { productId: string; quantity: number; size?: string; color?: string }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return { result: { ok: false, error: `Product ${item.productId} not found.` } };
    }

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

    // Case- and space-insensitive: the model relays whatever the customer
    // typed ("olive green", "M "), and an exact comparison rejects a variant
    // that is plainly in stock.
    const sameOption = (a?: string | null, b?: string | null) =>
      (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

    const variant = product.variants.find(
      (v) =>
        (!item.size || sameOption(v.size, item.size)) &&
        (!item.color || sameOption(v.color, item.color)),
    );

    if (product.variants.length > 0 && (!variant || variant.quantity < quantity)) {
      return {
        result: {
          ok: false,
          error: `${product.name} isn't available in that size/colour at the quantity asked for.`,
        },
      };
    }

    if (product.variants.length === 0 && (product.stockQuantity ?? 0) < quantity) {
      return {
        result: { ok: false, error: `${product.name} doesn't have that many in stock.` },
      };
    }

    const unitPrice = effectivePrice(product);
    const total = unitPrice * quantity;
    subtotal += total;
    lines.push({
      name: product.name,
      quantity,
      unit: unitPrice,
      total,
      size: variant?.size ?? item.size,
      color: variant?.color ?? item.color,
    });

    resolved.push({
      productId: product.id,
      quantity,
      size: variant?.size ?? item.size,
      color: variant?.color ?? item.color,
    });
  }

  const summary = {
    items: lines,
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    deliverTo: {
      name: String(args.name ?? ""),
      phone: String(args.phone ?? ""),
      state: String(args.state ?? ""),
      address: String(args.address ?? ""),
    },
    paymentMethod: "Cash on Delivery",
  };

  // Parked for the customer to approve. Nothing is ordered here. The payload
  // stored is the one that will run verbatim, so the price they approve is
  // exactly the price that gets charged.
  await savePending(context.sessionId, {
    kind: "create_order",
    payload: {
      deliveryInfo: summary.deliverTo,
      deliveryType,
      cartItems: resolved,
    },
    summary,
  });

  return {
    result: {
      ok: true,
      requiresConfirmation: true,
      message:
        "Nothing has been ordered. The customer now has Confirm and Cancel buttons on screen — read the total back briefly and ask them to use those buttons. Do not call this tool again.",
      summary,
    },
    card: { kind: "confirm-order", requiresConfirmation: true, ...summary },
  };
};

// --------------------------------------------------------------------------
// Commit path — reached only by an explicit customer action, never the model
// --------------------------------------------------------------------------

export type PendingAction =
  | {
      kind: "cancel_order";
      payload: { orderId: string; phone?: string };
      summary: unknown;
    }
  | {
      kind: "create_order";
      payload: {
        deliveryInfo: { name: string; phone: string; state: string; address: string };
        deliveryType: string;
        cartItems: { productId: string; quantity: number; size?: string; color?: string }[];
      };
      summary: unknown;
    };

const savePending = async (sessionId: string, action: PendingAction) => {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { pendingAction: action as never },
  });
};

/**
 * Executes what the customer approved.
 *
 * Called from the confirm endpoint with the payload that was stored when the
 * summary was shown — so what runs is what they saw, not a fresh
 * interpretation of the conversation.
 */
export const commitPending = async (
  action: PendingAction,
  context: { userId?: string; userEmail?: string },
) => {
  if (action.kind === "cancel_order") {
    // Re-read rather than trust the summary. The proposal was drawn some time
    // ago; the order may have shipped, been cancelled already, or — in the
    // case of a session whose stored action outlived its context — not belong
    // to this caller at all.
    const current = await prisma.order.findUnique({
      where: { id: action.payload.orderId },
      select: { id: true, orderNo: true, orderStatus: true, totalAmount: true, phone: true },
    });

    if (!current) {
      return { kind: "cancel-refused" as const, orderNo: null, total: null, reason: "I couldn't find that order any more." };
    }

    if (
      action.payload.phone &&
      normalizePhone(current.phone) !== normalizePhone(action.payload.phone)
    ) {
      return {
        kind: "cancel-refused" as const,
        orderNo: null,
        total: null,
        reason: "I couldn't confirm that order belongs to this phone number.",
      };
    }

    if (current.orderStatus === OrderStatus.CANCELED) {
      return {
        kind: "cancel-refused" as const,
        orderNo: current.orderNo,
        total: null,
        reason: "That order was already cancelled.",
      };
    }

    if (!CANCELLABLE.includes(current.orderStatus)) {
      return {
        kind: "cancel-refused" as const,
        orderNo: current.orderNo,
        total: null,
        reason: `That order is already ${readableStatus(current.orderStatus)}, so it can no longer be cancelled from chat. I can put you through to our support team.`,
      };
    }

    // The same service an admin uses, so the status event is recorded and any
    // downstream handling behaves identically.
    const order = await orderService.updateOrderStatusService(
      action.payload.orderId,
      OrderStatus.CANCELED,
    );
    return {
      kind: "order-cancelled" as const,
      orderNo: (order as { orderNo?: string }).orderNo ?? null,
      total: (order as { totalAmount?: number }).totalAmount ?? null,
    };
  }

  const order = await orderService.createOrderService({
    payload: {
      deliveryInfo: action.payload.deliveryInfo,
      deliveryType: action.payload.deliveryType as never,
      cartItems: action.payload.cartItems,
      // Card payment needs a gateway redirect the chat cannot complete, so
      // Windee only ever places cash-on-delivery orders.
      paymentMethod: "COD",
      checkoutEmail: context.userEmail,
    },
    userId: context.userId,
    userEmail: context.userEmail,
  });

  // createOrderService wraps the record: `{ order, deliveryCharge }`. Reading
  // orderNo off the top level silently yields undefined, which is how the
  // confirmation ended up saying "order  is placed. You'll pay ৳0".
  const { order: placed } = order as {
    order: { orderNo?: string; totalAmount?: number };
  };

  return {
    kind: "order-placed" as const,
    orderNo: placed?.orderNo ?? null,
    total: placed?.totalAmount ?? null,
    deliverTo: action.payload.deliveryInfo,
  };
};

/** Dispatches a tool call from the model to its implementation. */
export const runTool = (context: ToolContext) =>
  async (name: string, args: Record<string, unknown>): Promise<ToolOutput> => {
    switch (name) {
      case "track_order":
        return trackOrder(args);
      case "search_products":
        return searchProducts(args);
      case "get_product_details":
        return getProductDetails(args);
      case "get_store_info":
        return getStoreInfo();
      case "add_to_cart":
        return addToCart(args);
      case "add_to_wishlist":
        return addToWishlist(args);
      case "cancel_order":
        return cancelOrder(args, context);
      case "create_order":
        return createOrder(args, context);
      default:
        return { result: { ok: false, error: `Unknown tool ${name}` } };
    }
  };
