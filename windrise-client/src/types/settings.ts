export type StoreSettings = {
  id: string;

  storeName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  storeAddress: string | null;

  shippingDhakaCity: number;
  shippingDhakaSuburb: number;
  shippingOutsideDhaka: number;
  freeShippingThreshold: number | null;

  lowStockThreshold: number;
  orderNumberPrefix: string;

  notifyOrderPlaced: boolean;
  notifyOrderStatus: boolean;
  notifyLowStock: boolean;

  updatedAt: string;
};

export type StoreSettingsPatch = Partial<
  Omit<StoreSettings, "id" | "updatedAt">
>;

/** Subset the storefront reads without authentication. */
export type PublicSettings = {
  storeName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  storeAddress: string | null;
  shipping: {
    DHAKA_CITY: number;
    DHAKA_SUBURB: number;
    OUTSIDE_DHAKA: number;
  };
  freeShippingThreshold: number | null;
};
