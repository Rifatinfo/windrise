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
  "Delivery charge is calculated based on your selected shipping location.",
  "Orders are processed within 1-2 business days.",
  "Cash on Delivery is available for selected locations.",
];
