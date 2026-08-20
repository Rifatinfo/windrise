import type { Metadata } from "next";

import { OrderTrackingLookup } from "@/components/modules/order/OrderTrackingLookup";

export const metadata: Metadata = {
  title: "Order Tracking | Windrise",
  description:
    "Track a Windrise order with your Order ID and the phone number on the order.",
};

const OrderTrackingPage = () => <OrderTrackingLookup />;

export default OrderTrackingPage;
