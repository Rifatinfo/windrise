export const shippingOptions = [
  {
    id: "DHAKA_CITY" as const,
    label: "Inside Dhaka",
    price: 60,
    method: "Home Delivery",
    note: "2-3 business days",
  },
  {
    id: "DHAKA_SUBURB" as const,
    label: "Dhaka Suburb",
    price: 100,
    method: "Home Delivery",
    note: "3-4 business days",
  },
  {
    id: "OUTSIDE_DHAKA" as const,
    label: "Outside Dhaka",
    price: 130,
    method: "Courier Delivery",
    note: "5-7 business days",
  },
];

export const disclaimers = [
  "Please accept only properly sealed and intact packages. Do not accept damaged or tampered packages.",
  "For Cash on Delivery (COD), make payment only after receiving your package.",
  "While we strive for accuracy, any errors or discrepancies on our website are unintentional and subject to correction.",
];
