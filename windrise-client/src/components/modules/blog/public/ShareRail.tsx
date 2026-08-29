"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CheckIcon } from "lucide-react";
// lucide dropped its brand marks, so the social glyphs come from react-icons,
// which this project already uses elsewhere in the nav config.
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaXTwitter,
} from "react-icons/fa6";

/**
 * Share controls under the byline.
 *
 * The canonical URL is read from the browser rather than passed in, so the
 * links are correct on any domain the storefront is served from. Instagram has
 * no web share intent, so that button copies the link instead of pretending to
 * post — a dead link would be worse than an honest copy action.
 */
/** The address never changes for the life of a rendered post. */
const subscribe = () => () => {};
const getUrl = () => window.location.href;
/** Empty during SSR, which keeps the first client render identical. */
const getServerUrl = () => "";

export function ShareRail({ title }: { title: string }) {
  const url = useSyncExternalStore(subscribe, getUrl, getServerUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      key: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FaFacebookF,
    },
    {
      key: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: FaXTwitter,
    },
    {
      key: "pinterest",
      label: "Share on Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      Icon: FaPinterestP,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
    } catch {
      /* Clipboard blocked — the button simply does nothing visible. */
    }
  };

  const buttonClass =
    "inline-flex size-6 items-center justify-center rounded-full text-[#1C1B1A] transition-opacity hover:opacity-60";

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.12em]">Share:</p>
      <div className="mt-2 flex items-center gap-1.5">
        {links.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={buttonClass}
          >
            <Icon className="size-3.5" />
          </a>
        ))}

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Link copied" : "Copy link"}
          className={buttonClass}
        >
          {copied ? <CheckIcon className="size-3.5" /> : <FaInstagram className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}

