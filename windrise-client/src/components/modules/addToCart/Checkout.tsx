"use client";

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon, CreditCardIcon, PlusIcon, TruckIcon } from 'lucide-react'
import { Breadcrumb } from './Breadcrumb'
import { Stepper } from './Stepper'
import { OrderOverview } from './OrderOverview'
import { Combobox } from './Combobox'
import { disclaimers } from './data/cart'
import {
  divisionForDistrict,
  districtsForDivision,
  divisionNames,
  postcodesByDistrict,
  postcodesForDistrict,
} from './data/bangladesh'
import { useCart } from '@/contexts/CartContext'
import { createOrder } from '@/services/order/order'
import { validateCoupon } from '@/services/coupon/coupon'
import { trackEvent } from '@/lib/eventTracking'

const labelClass = 'block text-[12px] text-[#1a1a1a]'
const inputClass =
  'mt-2 h-[30px] w-full border border-[#dcdcdc] px-3 text-[11px] text-[#1a1a1a] outline-none placeholder:text-[#bdbdbd] focus:border-[#1a1a1a]'
function Required() {
  return (
    <span aria-hidden="true" className="text-[#e0322b]">
      {' '}
      *
    </span>
  )
}

export function Checkout() {
  const router = useRouter()
  const { items, shippingId, subtotal, clearCart } = useCart()
  const isPlacingOrderRef = useRef(false)
  const [payment, setPayment] = useState<'online' | 'cod'>('cod')
  const [sameAddress, setSameAddress] = useState(true)
  const [showBilling, setShowBilling] = useState(false)
  const [division, setDivision] = useState('')
  const [district, setDistrict] = useState('')
  const [zip, setZip] = useState('')
  const [billingDivision, setBillingDivision] = useState('')
  const [billingDistrict, setBillingDistrict] = useState('')
  const [billingZip, setBillingZip] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    trackEvent('CHECKOUT_START')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal)
      setAppliedCoupon({ code: result.coupon.code, discountAmount: result.discountAmount })
    } catch (err: unknown) {
      setAppliedCoupon(null)
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    address1: '',
    address2: '',
    notes: '',
  })

  const [billingForm, setBillingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    address1: '',
    address2: '',
  })

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateBillingForm = (field: keyof typeof billingForm, value: string) => {
    setBillingForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleDivisionChange(next: string) {
    setDivision(next)
    if (district && divisionForDistrict(district) !== next) {
      setDistrict('')
      setZip('')
    }
  }

  function handleDistrictChange(next: string) {
    setDistrict(next)
    const parent = divisionForDistrict(next)
    if (parent && parent !== division) setDivision(parent)
    const codes = postcodesByDistrict[next]
    if (codes && codes.length === 1) setZip(codes[0])
    else if (codes && !codes.includes(zip)) setZip('')
  }

  function handleBillingDivisionChange(next: string) {
    setBillingDivision(next)
    if (billingDistrict && divisionForDistrict(billingDistrict) !== next) {
      setBillingDistrict('')
      setBillingZip('')
    }
  }

  function handleBillingDistrictChange(next: string) {
    setBillingDistrict(next)
    const parent = divisionForDistrict(next)
    if (parent && parent !== billingDivision) setBillingDivision(parent)
    const codes = postcodesByDistrict[next]
    if (codes && codes.length === 1) setBillingZip(codes[0])
    else if (codes && !codes.includes(billingZip)) setBillingZip('')
  }

  async function handlePlaceOrder() {
    if (items.length === 0) {
      setError('Your bag is empty.')
      return
    }
    if (!form.firstName || !form.contact || !form.address1 || !division || !district) {
      setError('Please fill in all required shipping fields.')
      return
    }

    if (showBilling) {
      if (!billingForm.firstName || !billingForm.contact || !billingForm.address1 || !billingDivision || !billingDistrict) {
        setError('Please fill in all required billing fields.')
        return
      }
    }

    isPlacingOrderRef.current = true
    setIsSubmitting(true)
    setError('')

    try {
      const name = `${form.firstName} ${form.lastName}`.trim()
      const fullAddress = [form.address1, form.address2, district, zip]
        .filter(Boolean)
        .join(', ')

      const billingName = `${billingForm.firstName} ${billingForm.lastName}`.trim()
      const billingFullAddress = [billingForm.address1, billingForm.address2, billingDistrict, billingZip]
        .filter(Boolean)
        .join(', ')

      const payload = {
        deliveryInfo: {
          name,
          phone: form.contact,
          state: division,
          address: fullAddress,
        },
        ...(showBilling && {
          billingInfo: {
            name: billingName,
            phone: billingForm.contact,
            email: billingForm.email || null,
            state: billingDivision,
            address: billingFullAddress,
          },
        }),
        deliveryType: shippingId,
        cartItems: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          sku: item.sku,
        })),
        paymentMethod: payment === 'online' ? 'ONLINE' as const : 'COD' as const,
        checkoutEmail: form.email || undefined,
        ...(appliedCoupon && { couponCode: appliedCoupon.code }),
      }

      const result = await createOrder(payload)

      if (payment === 'online' && result.data.paymentUrl) {
        clearCart()
        if (typeof window !== 'undefined') {
          window.location.href = result.data.paymentUrl
        }
        return
      }

      await router.push(`/success?orderId=${result.data.order.id}`)
      clearCart()
    } catch (err: unknown) {
      isPlacingOrderRef.current = false
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (items.length === 0 && !isPlacingOrderRef.current) {
      router.push('/shoppingBag')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="w-full min-h-full bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-8 pb-16 sm:px-10 lg:px-14 lg:pt-10 lg:pb-24">
        <Breadcrumb current="Shopping Bag" />

        <main className="mx-auto mt-8 w-full max-w-[890px] lg:mt-20">
          <Stepper current={2} />

          <h1 className="mt-8 text-[19px] tracking-[0.02em] text-[#1a1a1a] lg:mt-14 lg:text-[17px]">
            CHECKOUT
          </h1>

          <div className="mt-6 grid grid-cols-1 gap-x-12 lg:mt-6 lg:grid-cols-[1fr_290px]">
            {/* Shipping details */}
            <form
              className="order-1"
              onSubmit={(event) => {
                event.preventDefault()
                handlePlaceOrder()
              }}
            >
              <h2 className="border-b border-[#e6e6e6] pb-3 text-[13px] tracking-[0.06em] text-[#1a1a1a]">
                SHIPPING DETAILS
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    First Name
                    <Required />
                  </label>
                  <input
                    id="firstName"
                    required
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    placeholder="Your First Name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    placeholder="Your Last Name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder="example.email.com"
                  className={inputClass}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="contact" className={labelClass}>
                  Contact Number
                  <Required />
                </label>
                <input
                  id="contact"
                  required
                  value={form.contact}
                  onChange={(e) => updateForm('contact', e.target.value)}
                  inputMode="tel"
                  placeholder="XXXXXXXXXX"
                  className={inputClass}
                />
              </div>

              <div className="mt-5">
                <label htmlFor="address1" className={labelClass}>
                  Address Line
                  <Required />
                </label>
                <input
                  id="address1"
                  required
                  value={form.address1}
                  onChange={(e) => updateForm('address1', e.target.value)}
                  className={inputClass}
                />
                <input
                  id="address2"
                  aria-label="Address line 2"
                  value={form.address2}
                  onChange={(e) => updateForm('address2', e.target.value)}
                  className={`${inputClass} mt-3`}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className={labelClass}>
                    Country
                  </label>
                  <input
                    id="country"
                    readOnly
                    value="Bangladesh"
                    aria-readonly="true"
                    className="mt-2 h-[30px] w-full cursor-default border border-[#dcdcdc] bg-[#fafafa] px-3 text-[11px] text-[#8f8f8f] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="division" className={labelClass}>
                    Division / Province
                    <Required />
                  </label>
                  <Combobox
                    id="division"
                    value={division}
                    onChange={handleDivisionChange}
                    options={divisionNames}
                    placeholder="Type or select your division"
                    emptyMessage="No division matches"
                  />
                </div>

                <div>
                  <label htmlFor="district" className={labelClass}>
                    District / City
                    <Required />
                  </label>
                  <Combobox
                    id="district"
                    value={district}
                    onChange={handleDistrictChange}
                    options={districtsForDivision(division)}
                    placeholder={
                      division ? `Type or select a district in ${division}` : 'Type your district or city'
                    }
                    emptyMessage="No district matches"
                    disabled={!division}
                    disabledHint="Select a division first"
                    hint={
                      division
                        ? undefined
                        : 'All 64 districts — picking one sets the division automatically'
                    }
                  />
                </div>

                <div>
                  <label htmlFor="zip" className={labelClass}>
                    Zip / Postal Code
                  </label>
                  <Combobox
                    id="zip"
                    value={zip}
                    onChange={(next) => setZip(next.split('—')[0].trim())}
                    options={postcodesForDistrict(district)}
                    placeholder={
                      district ? `Postal codes for ${district}` : 'Type your zip/postal code'
                    }
                    emptyMessage="No matching code — you can still use what you typed"
                    allowCustom
                    inputMode="numeric"
                    maxLength={12}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setSameAddress(checked)
                      setShowBilling(!checked)
                    }}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={[
                      'flex h-[15px] w-[15px] items-center justify-center rounded-[3px] border',
                      sameAddress ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-[#c9c9c9] bg-white',
                    ].join(' ')}
                  >
                    {sameAddress && <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[11px] text-[#8f8f8f]">
                    My billing and shipping addresses are the same
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setShowBilling((prev) => !prev)
                    setSameAddress((prev) => !prev)
                  }}
                  className="flex items-center gap-2 text-[11px] text-[#8f8f8f] transition-colors hover:text-[#1a1a1a]"
                >
                  <PlusIcon
                    className="h-[15px] w-[15px] rounded-full border border-[#b8b8b8] p-[2px]"
                    strokeWidth={1.5}
                  />
                  {showBilling ? 'Hide billing address' : 'Add billing address'}
                </button>
              </div>

              {showBilling && (
                <div className="mt-8">
                  <h2 className="border-b border-[#e6e6e6] pb-3 text-[13px] tracking-[0.06em] text-[#1a1a1a]">
                    BILLING DETAILS
                  </h2>

                  <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="billingFirstName" className={labelClass}>
                        First Name
                        <Required />
                      </label>
                      <input
                        id="billingFirstName"
                        required
                        value={billingForm.firstName}
                        onChange={(e) => updateBillingForm('firstName', e.target.value)}
                        placeholder="Your First Name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="billingLastName" className={labelClass}>
                        Last Name
                      </label>
                      <input
                        id="billingLastName"
                        value={billingForm.lastName}
                        onChange={(e) => updateBillingForm('lastName', e.target.value)}
                        placeholder="Your Last Name"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="billingEmail" className={labelClass}>
                      Email Address
                    </label>
                    <input
                      id="billingEmail"
                      type="email"
                      value={billingForm.email}
                      onChange={(e) => updateBillingForm('email', e.target.value)}
                      placeholder="example.email.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="billingContact" className={labelClass}>
                      Contact Number
                      <Required />
                    </label>
                    <input
                      id="billingContact"
                      required
                      value={billingForm.contact}
                      onChange={(e) => updateBillingForm('contact', e.target.value)}
                      inputMode="tel"
                      placeholder="XXXXXXXXXX"
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-5">
                    <label htmlFor="billingAddress1" className={labelClass}>
                      Address Line
                      <Required />
                    </label>
                    <input
                      id="billingAddress1"
                      required
                      value={billingForm.address1}
                      onChange={(e) => updateBillingForm('address1', e.target.value)}
                      className={inputClass}
                    />
                    <input
                      id="billingAddress2"
                      aria-label="Billing address line 2"
                      value={billingForm.address2}
                      onChange={(e) => updateBillingForm('address2', e.target.value)}
                      className={`${inputClass} mt-3`}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="billingCountry" className={labelClass}>
                        Country
                      </label>
                      <input
                        id="billingCountry"
                        readOnly
                        value="Bangladesh"
                        aria-readonly="true"
                        className="mt-2 h-[30px] w-full cursor-default border border-[#dcdcdc] bg-[#fafafa] px-3 text-[11px] text-[#8f8f8f] outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="billingDivision" className={labelClass}>
                        Division / Province
                        <Required />
                      </label>
                      <Combobox
                        id="billingDivision"
                        value={billingDivision}
                        onChange={handleBillingDivisionChange}
                        options={divisionNames}
                        placeholder="Type or select your division"
                        emptyMessage="No division matches"
                      />
                    </div>

                    <div>
                      <label htmlFor="billingDistrict" className={labelClass}>
                        District / City
                        <Required />
                      </label>
                      <Combobox
                        id="billingDistrict"
                        value={billingDistrict}
                        onChange={handleBillingDistrictChange}
                        options={districtsForDivision(billingDivision)}
                        placeholder={
                          billingDivision
                            ? `Type or select a district in ${billingDivision}`
                            : 'Type your district or city'
                        }
                        emptyMessage="No district matches"
                        disabled={!billingDivision}
                        disabledHint="Select a division first"
                      />
                    </div>

                    <div>
                      <label htmlFor="billingZip" className={labelClass}>
                        Zip / Postal Code
                      </label>
                      <Combobox
                        id="billingZip"
                        value={billingZip}
                        onChange={(next) => setBillingZip(next.split('—')[0].trim())}
                        options={postcodesForDistrict(billingDistrict)}
                        placeholder={
                          billingDistrict
                            ? `Postal codes for ${billingDistrict}`
                            : 'Type your zip/postal code'
                        }
                        emptyMessage="No matching code — you can still use what you typed"
                        allowCustom
                        inputMode="numeric"
                        maxLength={12}
                      />
                    </div>
                  </div>
                </div>
              )}

              <fieldset className="mt-8">
                <legend className="text-[12px] tracking-[0.06em] text-[#1a1a1a]">
                  PAYMENT METHOD
                </legend>
                <div className="mt-3 space-y-3">
                  {[
                    { id: 'online' as const, label: 'Pay Online', Icon: CreditCardIcon },
                    { id: 'cod' as const, label: 'Cash on Delivery', Icon: TruckIcon },
                  ].map(({ id, label, Icon }) => {
                    const checked = payment === id
                    return (
                      <label key={id} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value={id}
                          checked={checked}
                          onChange={() => setPayment(id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={[
                            'flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full border',
                            checked ? 'border-[#1a1a1a]' : 'border-[#c9c9c9]',
                          ].join(' ')}
                        >
                          {checked && (
                            <span className="h-[7px] w-[7px] rounded-full bg-[#1a1a1a]" />
                          )}
                        </span>
                        <Icon
                          aria-hidden="true"
                          className="h-[15px] w-[15px] text-[#1a1a1a]"
                          strokeWidth={1.4}
                        />
                        <span className="text-[12px] text-[#1a1a1a]">{label}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <div className="mt-7">
                <label htmlFor="notes" className="block text-[12px] text-[#1a1a1a]">
                  Add Instructions/Notes for Delivery{' '}
                  <span className="text-[#a3a3a3]">(Optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  placeholder="Your message"
                  className="mt-3 w-full resize-none border border-[#dcdcdc] p-3 text-[11px] text-[#1a1a1a] outline-none placeholder:text-[#bdbdbd] focus:border-[#1a1a1a]"
                />
              </div>

              <div className="mt-8 hidden justify-end lg:flex">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="h-[30px] w-[92px] border border-[#d6d6d6] text-[10px] tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
                >
                  BACK
                </button>
              </div>
            </form>

            {/* Order overview */}
            <aside className="order-2 mt-10 lg:mt-0">
              <OrderOverview />

              <div className="mt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between border border-[#e6e6e6] px-3 py-2 text-[11px]">
                    <span className="text-[#1a1a1a]">
                      Coupon <strong>{appliedCoupon.code}</strong> applied · −৳{appliedCoupon.discountAmount}
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[#8f8f8f] underline hover:text-[#1a1a1a]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className={`${inputClass} mt-0 flex-1`}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-[30px] shrink-0 border border-[#1a1a1a] px-3 text-[10px] tracking-[0.06em] text-[#1a1a1a] transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking…' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="mt-1.5 text-[10.5px] text-[#e0322b]">{couponError}</p>}
              </div>

              {error && (
                <p className="mt-4 text-[11px] text-[#e0322b]">{error}</p>
              )}
              <div className="mt-8">
                <h2 className="text-[12px] font-medium text-[#1a1a1a]">Disclaimers:</h2>
                <ul className="mt-2 space-y-1 text-[10.5px] leading-[1.6] text-[#3d3d3d]">
                  {disclaimers.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
                <p className="mt-4 text-[10.5px] leading-[1.6] text-[#3d3d3d]">
                  By clicking “Place Order” you agree to Windrise’s Terms of use, Return and
                  Exchange and Cancellation policies.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4 lg:block">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="h-[34px] flex-1 border border-[#d6d6d6] text-[10px] tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] lg:hidden"
                >
                  BACK
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="h-[34px] flex-1 bg-[#0b0b0b] text-[10px] tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 lg:h-[30px] lg:w-full"
                >
                  {isSubmitting ? "PLACING..." : "PLACE ORDER"}
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
