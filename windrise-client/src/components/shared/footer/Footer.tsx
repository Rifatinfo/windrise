'use client';
import { ChevronDownIcon } from 'lucide-react';
import  { useState } from 'react'
import { FormEvent } from 'react' 
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import WhiteLogo from '../logo/WhiteLogo';
type FooterGroup = {
  title: string
  links: string[]
}
const WR_LOGO_URL =
  '/assets/Logo-icon.svg'
const PAYMENT_GATEWAY_URL =
  '/assets/Payment-Gateway.svg'
const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: 'Help',
    links: [
      'Order Status',
      'Shipping and Delivery',
      'Returns and Exchange',
      'FAQs',
    ],
  },
  {
    title: 'Company',
    links: [
      'About Windrise',
      'Careers',
      'Press Center',
      'Contact Us',
      'Sustainability',
    ],
  },
  {
    title: 'Resources',
    links: ['Windrise Stories', 'Promotions and Sale', 'Voucher'],
  },
  {
    title: 'Payments',
    links: [],
  },
]
export function Footer() {
  const [email, setEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setNewsletterMessage('Enter a valid email address to subscribe.')
      return
    }
    setNewsletterMessage('Thank you — you’re on the list.')
    setEmail('')
  }
  function toggleGroup(title: string) {
    setOpenGroup((currentGroup) => (currentGroup === title ? null : title))
  }
  return (
    <footer className="w-full bg-[#050505] text-white">
      <div className="hidden px-6 py-20 md:block md:px-20 lg:px-20 lg:pt-28 lg:pb-16">
        <div className="grid grid-cols-[minmax(220px,1.8fr)_repeat(4,minmax(110px,1fr))] gap-x-12 xl:gap-x-38">
          <BrandPanel
            compact
            email={email}
            newsletterMessage={newsletterMessage}
            onEmailChange={setEmail}
            onSubmit={handleNewsletterSubmit}
          />
          {FOOTER_GROUPS.map((group) => (
            <DesktopLinkGroup key={group.title} group={group} />
          ))}
        </div>
      </div>

      <div className="hidden border-t border-[#272727]/70 px-6 py-5 md:flex md:items-center md:justify-between md:px-20 lg:px-20  font-dm-sans mb-8">
        <p className="text-xs text-zinc-500">
          © 2026 Windrise. All rights reserved.
        </p>
        <div className="mt-5 flex items-center gap-10 text-xs text-zinc-500 md:mt-0 md:gap-14">
          <SocialLinks />
          <div className="flex items-center gap-10 md:gap-14  font-dm-sans">
            <a className="transition-colors hover:text-white" href="#privacy">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-white" href="#terms">
              Terms of Use
            </a>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="px-6 pt-12">
          <BrandPanel
            email={email}
            newsletterMessage={newsletterMessage}
            onEmailChange={setEmail}
            onSubmit={handleNewsletterSubmit}
          />
        </div>

        <div className="mt-10">
          {FOOTER_GROUPS.map((group, index) => {
            const isOpen = openGroup === group.title
            const panelId = `footer-group-${group.title.toLowerCase()}`
            const isPayments = index === FOOTER_GROUPS.length - 1
            return (
              <section
                key={group.title}
                className={
                  isPayments
                    ? 'relative border-b border-[#272727]/70 before:absolute before:top-0 before:left-6 before:right-6 before:border-t before:border-[#272727]/70'
                    : 'relative before:absolute before:top-0 before:left-6 before:right-6 before:border-t before:border-[#272727]/70'
                }
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleGroup(group.title)}
                >
                  {group.title}
                  <ChevronDownIcon
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    strokeWidth={1.25}
                  />
                </button>
                {isOpen && (
                  <div id={panelId} className="px-6 pb-4 font-dm-sans">
                    {group.links.length > 0 ? (
                      <ul className="space-y-3">
                        {group.links.map((link) => (
                          <li key={link}>
                            <a
                              href="#"
                              className="text-xs text-zinc-100 transition-colors hover:text-zinc-400"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <img
                        src={PAYMENT_GATEWAY_URL}
                        alt="Accepted payment methods"
                        className="h-auto w-40  mx-auto"
                      />
                    )}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <div className="px-6 py-7 text-center  font-dm-sans mb-10">
          <p className="text-[10px] text-zinc-500">
            © 2026 Windrise. All rights reserved.
          </p>
          <div className="mt-5 flex flex-col items-center gap-3 text-[10px] text-zinc-500  font-dm-sans">
            <a className="transition-colors hover:text-white" href="#privacy">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-white" href="#terms">
              Terms of Use
            </a>
          </div>
          <div className="mt-5 flex justify-center">
            <SocialLinks />
          </div>
        </div>
      </div>
    </footer>
  )
}
type BrandPanelProps = {
  compact?: boolean
  email?: string
  newsletterMessage?: string
  onEmailChange?: (email: string) => void
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
}
function BrandPanel({
  compact = false,
  email = '',
  newsletterMessage = '',
  onEmailChange,
  onSubmit,
}: BrandPanelProps) {
  const isMobile = !compact
  return (
    <div className={compact ? 'max-w-[240px]' : ''}>
      {isMobile ? (
        <WhiteLogo/>
      ) : (
        <img src={WR_LOGO_URL} alt="Windrise" className="h-12 w-auto" />
      )}
      <p
        className={`${isMobile ? 'mt-4' : 'mt-5'} max-w-[250px] text-xs md:text-[15px] leading-[1.45] text-zinc-500`}
      >
        A curated blend of refined essentials for a life well-lived.
      </p>
      {onEmailChange && onSubmit && (
        <form
          className={isMobile ? 'mt-8' : 'mt-16'}
          onSubmit={onSubmit}
          noValidate
        >
          <div className="flex items-center border-b-2 border-[#272727]/70 pb-2  font-dm-sans">
            <label
              className="sr-only"
              htmlFor={isMobile ? 'footer-email' : 'footer-desktop-email'}
            >
              Email address
            </label>
            <input
              id={isMobile ? 'footer-email' : 'footer-desktop-email'}
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="Email address"
              className="min-w-0 flex-1 bg-transparent text-[10px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="text-[10px] text-zinc-100 transition-colors hover:text-zinc-400"
            >
              Send
            </button>
          </div>
          <p
            aria-live="polite"
            className="mt-2 min-h-3 text-[10px] text-zinc-500"
          >
            {newsletterMessage}
          </p>
        </form>
      )}
    </div>
  )
}
function DesktopLinkGroup({ group }: { group: FooterGroup }) {
  return (
    <section>
      <h2 className="text-sm font-normal text-zinc-500">{group.title}</h2>
      {group.links.length > 0 ? (
        <ul className="mt-4 space-y-3  font-dm-sans">
          {group.links.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-sm text-zinc-200 transition-colors hover:text-zinc-500"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <img
          src={PAYMENT_GATEWAY_URL}
          alt="Accepted payment methods"
          className="mt-4 h-auto w-[198px]"
        />
      )}
    </section>
  )
}
function SocialLinks() {
  const socialLinks = [
    {
    label: "Facebook",
    icon: FaFacebookF,
  },
  {
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    label: "WhatsApp",
    icon: FaWhatsapp,
  },
  {
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  ]
  return (
    <div className="flex items-center gap-4 text-zinc-400">
      {socialLinks.map(({ label, icon: Icon }) => (
        <a
          key={label}
          href="#"
          aria-label={label}
          className="transition-colors hover:text-white"
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </a>
      ))}
    </div>
  )
}
