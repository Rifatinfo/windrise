"use client";

import { useCart } from '@/contexts/CartContext'

export function OrderOverview() {
  const { items, shipping, subtotal, total } = useCart()

  return (
    <section aria-labelledby="order-overview-title">
      <h2
        id="order-overview-title"
        className="border-b border-[#e6e6e6] pb-3 text-[13px] tracking-[0.06em] text-[#1a1a1a]"
      >
        ORDER OVERVIEW
      </h2>

      <ul>
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 border-b border-[#ededed] py-4">
            <img
              src={item.image}
              alt={item.name}
              className="h-[92px] w-[68px] shrink-0 bg-[#f4f4f4] object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="text-[12px] font-medium text-[#1a1a1a]">{item.name}</h3>
              <dl className="mt-1.5 space-y-[3px] text-[10px]">
                <div className="flex gap-1">
                  <dt className="text-[#a3a3a3]">Product SKU:</dt>
                  <dd className="text-[#1a1a1a]">{item.sku}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-[#a3a3a3]">Size:</dt>
                  <dd className="text-[#1a1a1a]">{item.size}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-[#a3a3a3]">Color:</dt>
                  <dd className="text-[#1a1a1a]">{item.color}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-[#a3a3a3]">Quantity:</dt>
                  <dd className="text-[#1a1a1a]">{item.quantity}</dd>
                </div>
              </dl>
              <p className="mt-auto self-end pt-2 text-[13px] text-[#1a1a1a]">
                ৳ {item.price * item.quantity}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="text-[11px]">
        <div className="flex items-center justify-between border-b border-[#ededed] py-3">
          <dt className="text-[#1a1a1a]">Subtotal</dt>
          <dd className="text-[#1a1a1a]">৳ {subtotal}</dd>
        </div>
        <div className="flex items-center justify-between border-b border-[#ededed] py-3">
          <dt className="text-[#1a1a1a]">Shipping</dt>
          <dd className="text-[#1a1a1a]">৳ {shipping.price}</dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-[12px] tracking-[0.06em] text-[#1a1a1a]">TOTAL</dt>
          <dd className="text-[18px] text-[#1a1a1a]">৳ {total}</dd>
        </div>
      </dl>
    </section>
  )
}
