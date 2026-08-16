import { OrderTracking } from "@/components/modules/order/OrderTracking";

const OrderTrackingPage = async ({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) => {
  const { orderId } = await params;
  return (
    <div>
      <OrderTracking orderId={orderId} />
    </div>
  );
};

export default OrderTrackingPage;
