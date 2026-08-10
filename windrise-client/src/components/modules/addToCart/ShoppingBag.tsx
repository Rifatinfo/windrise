"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XIcon } from 'lucide-react'
import { Breadcrumb } from './Breadcrumb'
import { Stepper } from './Stepper'
import { QuantityInput } from './QuantityInput'
import { shippingOptions } from './data/cart'
import { useCart } from '@/contexts/CartContext'


export function ShoppingBag() {
  const router = useRouter()
  const { items, setQuantity, removeItem, shippingId, setShippingId, shipping, subtotal, total } =
    useCart()
  const [coupon, setCoupon] = useState('')

  return (
    <div className="w-full min-h-full bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-8 pb-16 sm:px-10 lg:px-14 lg:pt-10 lg:pb-24">
        <Breadcrumb current="Shopping Bag" />

        <main className="mx-auto mt-8 w-full max-w-[890px] lg:mt-20">
          <Stepper current={1} />

          <div className="mt-5 border-t border-[#e6e6e6] lg:mt-11" />

          <h1 className="mt-6 text-[15px] tracking-[0.02em] text-[#1a1a1a] lg:mt-10 lg:text-[17px]">
            MY BAG{' '}
            <span className="text-[#1a1a1a]">
              ({items.length} ITEM{items.length === 1 ? '' : 'S'})
            </span>
          </h1>

          {/* Desktop / tablet table */}
          <section className="mt-6 hidden md:block" aria-label="Bag items">
            <div className="grid grid-cols-[1fr_110px_130px_120px_60px] items-center border-b border-[#e6e6e6] pb-2 text-[11px] tracking-[0.08em] text-[#4a4a4a]">
              <span>PRODUCT</span>
              <span>PRICE</span>
              <span>QUANTITY</span>
              <span>TOTAL</span>
              <span className="text-right">DELETE</span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_110px_130px_120px_60px] items-start border-b border-[#ededed] py-6"
              >
                <div className="flex gap-5 pr-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[134px] w-[100px] shrink-0 bg-[#f4f4f4] object-cover"
                  />
                  <div className="pt-1">
                    <h2 className="text-[14px] font-medium text-[#1a1a1a]">{item.name}</h2>
                    <dl className="mt-3 space-y-2 text-[12px]">
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
                    </dl>
                  </div>
                </div>
                <span className="pt-1 text-[15px] text-[#1a1a1a]">৳ {item.price}</span>
                <span className="pt-1">
                  <QuantityInput
                    value={item.quantity}
                    onChange={(value) => setQuantity(item.id, value)}
                    label={item.name}
                  />
                </span>
                <span className="pt-1 text-[15px] text-[#1a1a1a]">
                  ৳ {item.price * item.quantity}
                </span>
                <span className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from bag`}
                    className="flex h-[26px] w-[26px] items-center justify-center border border-[#dcdcdc] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
                  >
                    <XIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </span>
              </div>
            ))}
          </section>

          {/* Mobile list */}
          <section className="mt-4 md:hidden" aria-label="Bag items">
            {items.map((item) => (
              <div key={item.id} className="border-t border-[#ededed] py-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[120px] w-[92px] shrink-0 bg-[#f4f4f4] object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="text-[13px] font-medium text-[#1a1a1a]">{item.name}</h2>
                    <dl className="mt-2 space-y-1 text-[11px]">
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
                    </dl>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <span className="text-[14px] text-[#1a1a1a]">৳ {item.price}</span>
                      <div className="flex items-center gap-2">
                        <QuantityInput
                          value={item.quantity}
                          onChange={(value) => setQuantity(item.id, value)}
                          label={item.name}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from bag`}
                          className="flex h-[22px] w-[22px] items-center justify-center text-[#1a1a1a]"
                        >
                          <XIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Discount + shipping */}
          <div className="mt-2 grid grid-cols-1 gap-8 border-t border-[#ededed] pt-6 md:mt-0 md:grid-cols-[228px_1fr] md:gap-10 md:border-t-0">
            <div>
              <h2 className="text-[11px] tracking-[0.08em] text-[#4a4a4a]">DISCOUNT CODE</h2>
              <div className="mt-3 flex items-center gap-3">
                <label htmlFor="coupon" className="sr-only">
                  Enter Coupon
                </label>
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Enter Coupon"
                  className="h-[34px] w-full flex-1 border border-[#dcdcdc] px-3 text-[12px] text-[#1a1a1a] outline-none placeholder:text-[#b5b5b5] focus:border-[#1a1a1a] md:w-[152px] md:flex-none"
                />
                <button
                  type="button"
                  className="h-[34px] w-[68px] shrink-0 border border-[#dcdcdc] text-[11px] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
                >
                  Apply
                </button>
              </div>
            </div>

            <fieldset>
              <legend className="text-[11px] tracking-[0.08em] text-[#4a4a4a]">
                SHIPPING OPTIONS
              </legend>
              <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4">
                {shippingOptions.map((option) => {
                  const checked = option.id === shippingId
                  return (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-start gap-2 md:gap-2"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={checked}
                        onChange={() => setShippingId(option.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={[
                          'mt-[2px] flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full border',
                          checked ? 'border-[#1a1a1a]' : 'border-[#c9c9c9]',
                        ].join(' ')}
                      >
                        {checked && <span className="h-[7px] w-[7px] rounded-full bg-[#1a1a1a]" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12px] text-[#1a1a1a]">{option.label}</span>
                        <span className="mt-1 block text-[15px] text-[#1a1a1a]">
                          ৳ {option.price}
                        </span>
                        <span className="mt-1 block text-[11px] text-[#1a1a1a]">
                          {option.method}
                        </span>
                        <span className="mt-[2px] block text-[10px] text-[#b0b0b0]">
                          {option.note}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="mt-7 border-t border-[#ededed] pt-6">
            <div className="ml-auto w-full md:w-[320px]">
              <dl className="text-[12px]">
                <div className="flex items-center justify-between py-2">
                  <dt className="text-[#1a1a1a]">Subtotal</dt>
                  <dd className="text-[#1a1a1a]">৳ {subtotal}</dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-[#1a1a1a]">Shipping</dt>
                  <dd className="text-[#1a1a1a]">৳ {shipping.price}</dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-[13px] tracking-[0.06em] text-[#1a1a1a]">TOTAL</dt>
                  <dd className="text-[19px] text-[#1a1a1a]">৳ {total}</dd>
                </div>
              </dl>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="h-[38px] w-full border border-[#d6d6d6] text-[11px] tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] sm:w-[130px]"
                >
                  CONITUE SOPPING
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="h-[38px] w-full bg-[#0b0b0b] text-[11px] tracking-[0.08em] text-white transition-opacity hover:opacity-90 sm:w-[152px]"
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
