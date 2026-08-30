"use client";

import Image from "next/image";
import { useState } from "react";

import { CountryPhoneSelect, DEFAULT_COUNTRY } from "./CountryPhoneField";


/** The five shortcuts on the menu screen, each mapped to an opening message. */
export const QUICK_ACTIONS = [
  {
    id: "track",
    icon: "/assets/order-track-icon.png",
    label: "Track my order",
    hint: "Check your order status",
    prompt: "I'd like to track my order.",
  },
  {
    id: "returns",
    icon: "/assets/return-exchange-icon.png",
    label: "Returns & exchange",
    hint: "Learn about return policy",
    prompt: "How do returns and exchanges work?",
  },
  {
    id: "product",
    icon: "/assets/product-information-Icon.png",
    label: "Product information",
    hint: "Get details about products",
    prompt: "I have a question about a product.",
  },
  {
    id: "shipping",
    icon: "/assets/shiping-Icon.png",
    label: "Shipping & delivery",
    hint: "Delivery time and charges",
    prompt: "What are your delivery charges and timeframes?",
  },
  {
    id: "other",
    icon: "/assets/other-question-Icon.png",
    label: "Other questions",
    hint: "Anything else?",
    prompt: "I have another question.",
  },
] as const;

const PRIMARY =
  "w-full rounded-full bg-[#6B4EE6] py-2.5 mx-auto text-[13px] md:text-[16px] font-medium text-white transition-colors hover:bg-[#5B3FD6] disabled:opacity-60 cursor-pointer";

/**
 * Windee 01 — the cover.
 *
 * The artwork supplies its own gradient, so it is laid in as a background
 * rather than recreated in CSS; the bubbles are positioned as a share of the
 * panel so they hold their arrangement at any height.
 */
export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <Image
        src="/assets/Windee _Cover_BG2.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none select-none object-cover"
      />

      <div className="relative flex h-full flex-col px-6 pb-6 pt-5">
        <div className="flex items-center gap-1.5">
          <Image
            src="/assets/Windee-Logo.png"
            alt=""
            width={26}
            height={18}
            className="h-[18px] w-[26px] select-none"
          />
          <span className="text-lg font-semibold text-[#6B4EE6]">Windee</span>
        </div>

        <div className="mt-7">
          <h2 className="text-[28px] font-semibold leading-tight text-[#141024]">
            Hey there!
            <br />
            <span className="text-4xl">I&apos;m</span>
            <span className="text-[#4B6BFB] text-4xl">  Windee</span>
          </h2>
          <p className="mt-3  text-[16px] leading-relaxed text-[#5A5E71]">
            Your AI assistant from Windrise.
            <br />
            I&apos;m here to help you 24/7.
          </p>
        </div>

        {/* The robot and its bubbles fill whatever height is left. */}
        <div className="relative min-h-0 flex-1">
          {/* <Image
            src="/assets/Windee _Cover_BG2.png"
            alt=""
            width={297}
            height={533}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 select-none object-contain"
          /> */}

          {[
            { src: "/assets/Bubble-Love.png", size: 58, style: { top: "2%", right: "8%" } },
            { src: "/assets/Bubble-1.png", size: 47, style: { top: "22%", left: "4%" } },
            { src: "/assets/Bubble-2.png", size: 47, style: { bottom: "26%", left: "4%" } },
            { src: "/assets/Bubble-3.png", size: 47, style: { bottom: "18%", right: "8%" } },
          ].map((bubble) => (
            <Image
              key={bubble.src}
              src={bubble.src}
              alt=""
              width={bubble.size}
              height={bubble.size}
              aria-hidden="true"
              style={{ ...bubble.style, width: bubble.size, height: bubble.size }}
              className="pointer-events-none absolute select-none"
            />
          ))}
        </div>

       
        <button type="button" onClick={onStart} className={PRIMARY}>
          Start Conversation
        </button>
        <p className="mt-6 text-center font-medium text-[15px] text-[#6E6A82]">
          Let&apos;s make things easier together.
        </p>
        <p className="mt-8 text-center ">
         <Image
            src="/assets/Powered-by.png"
            alt=""
            width={123}
            height={15}
            className="h-[15px] w-[123px] mx-auto select-none"
          />
        </p>
        </div>
      </div>
    
  );
}

/** Windee 02 — name and phone, so orders can be looked up without asking twice. */
export function DetailsScreen({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (details: { name: string; phone: string }) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);

  const ready = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 9;

  const field =
    "mt-1.5 h-10 w-full rounded-lg  px-3 text-[13px] bg-white text-[#1B1830] outline-none transition-colors placeholder:text-[#B4B1C4] focus:border-[#6B4EE6]";

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#FCFBFE_0%,#F0E9FC_100%)] px-6 pb-6 pt-2">
      <div className="mt-6 text-center">
        <Image
          src="/assets/Windee-Chatbot.png"
          alt=""
          width={66}
          height={66}
          className="mx-auto h-[66px] w-[66px] select-none"
        />
        <h2 className="mt-3 text-[18px] font-semibold text-[#141024]">Welcome to Windee</h2>
        <p className="mt-1 text-[14px] font-medium text-[#6E6A82]">Let&apos;s get you started!</p>
      </div>

      <form
        className="mt-9 flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (!ready || busy) return;

          // Sent in international form, with the national trunk "0" dropped —
          // "01711223344" under +880 becomes "+8801711223344". The server
          // matches orders on the last ten digits, so this still lines up with
          // numbers stored the local way at checkout.
          const local = phone.replace(/\D/g, "").replace(/^0+/, "");
          onSubmit({ name: name.trim(), phone: `${country.dial}${local}` });
        }}
      >
        <label className="block">
          <span className="text-[11px] text-[#4A4660]">Your Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            maxLength={80}
            className={field}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-[11px] text-[#4A4660]">Phone Number</span>
          <div className="mt-1.5 flex h-10 items-center gap-2 rounded-lg bg-white px-3 focus-within:border-[#6B4EE6]">
            <CountryPhoneSelect value={country} onChange={setCountry} />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="XXXX-XXXXXX"
              inputMode="tel"
              maxLength={24}
              className="h-full w-full bg-transparent text-[13px] text-[#1B1830] outline-none placeholder:text-[#B4B1C4] "
            />
          </div>
        </label>

        <div className="mt-auto pt-8 mb-[94px]">
          <button type="submit" disabled={!ready || busy} className={PRIMARY}>
            {busy ? "Just a moment…" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Windee 03 — the greeting and the five shortcuts. */
export function MenuScreen({
  name,
  onPick,
  onFreeChat,
}: {
  name: string | null;
  onPick: (prompt: string) => void;
  onFreeChat: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <div className="relative bg-gradient-to-b from-[#F2EFFE] to-white px-5 pb-4 pt-5">
        <div className="max-w-[62%]">
          <p className="text-[17px] font-semibold text-[#6B4EE6]">
            Hi {name?.split(" ")[0] || "there"}! 👋
          </p>
          <p className="mt-1 text-[12px] leading-snug text-[#4A4660]">
            How can I help you today?
          </p>
        </div>

        <Image
          src="/assets/windee-bot.png"
          alt=""
          width={297}
          height={533}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 right-2 h-[104px] w-auto select-none object-contain"
        />
      </div>

      <div className="space-y-2 px-5 pt-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onPick(action.prompt)}
            className="flex w-full items-center gap-3 rounded-xl border border-[#ECEAF4] bg-white px-3 py-2.5 text-left transition-colors hover:border-[#DCD8F0] hover:bg-[#FAF9FF]"
          >
            <Image
              src={action.icon}
              alt=""
              width={30}
              height={30}
              className="h-[30px] w-[30px] shrink-0 select-none"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-[#1B1830]">
                {action.label}
              </span>
              <span className="block truncate text-[10px] text-[#9B98AC]">{action.hint}</span>
            </span>
            <span aria-hidden="true" className="shrink-0 text-[#C6C3D4]">
              ›
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 px-5 pb-6">
        <div className="flex items-center gap-2 text-[10px] text-[#B4B1C4]">
          <span className="h-px flex-1 bg-[#EEECF6]" />
          or
          <span className="h-px flex-1 bg-[#EEECF6]" />
        </div>

        <button type="button" onClick={onFreeChat} className={`${PRIMARY} mt-3`}>
          Start a conversation
        </button>
        <p className="mt-2.5 text-center text-[10px] text-[#9B98AC]">
          We&apos;re here to help you 24/7
        </p>
      </div>
    </div>
  );
}
