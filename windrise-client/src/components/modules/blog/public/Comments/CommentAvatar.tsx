"use client";

import { UserIcon } from "lucide-react";

/**
 * The commenter's picture.
 *
 * A signed-in reader shows their account avatar; everyone else gets the same
 * neutral placeholder, which is what the design specifies — no coloured
 * initials that would imply an identity a guest never gave us.
 */
export function CommentAvatar({
  src,
  size = 34,
  className = "",
}: {
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const dimension = { width: size, height: size };

  if (src) {
    return (
      // Avatars come from /uploads and from external providers, so next/image
      // would need every one of those hosts declared up front.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={dimension}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      style={dimension}
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-[#E6E4DC] text-[#A5A296] ${className}`}
    >
      <UserIcon style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.6} />
    </span>
  );
}
