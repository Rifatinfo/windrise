"use client";

import React, { useState } from "react";

import { ConsentState } from "@/lib/cookie-consent";

type CookiePreferencesProps = {
  consent: ConsentState;
  onSave: (consent: ConsentState) => void;
  onClose: () => void;
};

export function CookiePreferences({ consent, onSave, onClose }: CookiePreferencesProps) {
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[440px] flex-col gap-5 rounded-[14px] bg-white px-6 py-6 shadow-[0_8px_34px_rgba(0,0,0,0.16)]"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[15px] font-medium text-[#111111]">Cookie Preferences</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[13px] text-[#111111] transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            &times;
          </button>
        </div>

        <p className="text-[12px] leading-[1.45] text-[#4b4b4b]">
          Choose which cookies you allow. Necessary cookies keep the site working and
          can&apos;t be turned off.
        </p>

        <div className="flex flex-col gap-4">
          <PreferenceRow
            title="Necessary Cookies"
            description="Required for core features like login, cart, and checkout."
            checked
            disabled
            statusLabel="Always active"
          />
          <PreferenceRow
            title="Analytics"
            description="Helps us understand site usage via Google Analytics."
            checked={analytics}
            onChange={setAnalytics}
          />
          <PreferenceRow
            title="Marketing"
            description="Used for Meta Pixel ad measurement and personalization."
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSave({ necessary: true, analytics, marketing })}
            className="rounded-full bg-[#0b0b0b] px-8 py-[9px] text-[12px] font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Save Preferences
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#0b0b0b] px-8 py-[9px] text-[12px] font-medium text-[#0b0b0b] transition-colors hover:bg-[#0b0b0b] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

type PreferenceRowProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  statusLabel?: string;
  onChange?: (checked: boolean) => void;
};

function PreferenceRow({
  title,
  description,
  checked,
  disabled,
  statusLabel,
  onChange,
}: PreferenceRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[13px] font-medium text-[#111111]">{title}</p>
        <p className="mt-1 text-[11px] leading-[1.4] text-[#6b6b6b]">{description}</p>
      </div>

      {disabled ? (
        <span className="shrink-0 pt-0.5 text-[11px] font-medium text-[#6b6b6b]">
          {statusLabel}
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          onClick={() => onChange?.(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
            checked ? "bg-[#0b0b0b]" : "bg-[#d9d9d9]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      )}
    </div>
  );
}
