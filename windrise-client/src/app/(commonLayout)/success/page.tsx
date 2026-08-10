import { Suspense } from "react";
import { OrderComplete } from "@/components/modules/addToCart/OrderComplete";

const OrderSuccessPage = () => {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-white" />}>
      <OrderComplete />
    </Suspense>
  );
};

export default OrderSuccessPage;
