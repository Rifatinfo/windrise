import Image from "next/image";

export type HeaderIconName = "search" | "wishlist" | "cart" | "account";

/** Light artwork for dark headers, dark artwork for light ones. */
export type HeaderIconTone = "white" | "black";

const ICONS: Record<
  HeaderIconName,
  { white: string; black: string; width: number; height: number; label: string }
> = {
  search: {
    white: "/assets/Search.png",
    black: "/assets/Search-black.png",
    width: 18,
    height: 18,
    label: "Search",
  },
  wishlist: {
    white: "/assets/Love.png",
    black: "/assets/Love-black.png",
    width: 19,
    height: 18,
    label: "Wishlist",
  },
  cart: {
    white: "/assets/Cart.png",
    black: "/assets/Cart-black.png",
    width: 16,
    height: 19,
    label: "Shopping bag",
  },
  account: {
    white: "/assets/Account.png",
    black: "/assets/Account-black.png",
    width: 18,
    height: 18,
    label: "Account",
  },
};

/**
 * A header action drawn from the artwork in `public/assets` rather than a
 * font icon.
 *
 * Both tones are rendered stacked in one grid cell and cross-faded, so the
 * icon changes colour on the same beat as the header's background instead of
 * snapping between two files. They keep their natural sizes — the set is not
 * uniformly square (the bag is 16x19, the heart 19x18) and stretching them to
 * a common box would distort them.
 */
export function HeaderIconButton({
  name,
  tone,
  onClick,
  className = "",
}: {
  name: HeaderIconName;
  tone: HeaderIconTone;
  onClick?: () => void;
  className?: string;
}) {
  const icon = ICONS[name];

  return (
    <button
      type="button"
      aria-label={icon.label}
      onClick={onClick}
      // `translate-y-*` compiles to the `translate` property in Tailwind v4,
      // so it has to be named alongside opacity or the hover lift won't ease.
      className={`grid h-9 w-9 place-items-center rounded-full transition-[opacity,translate] duration-200 hover:translate-y-0.5 hover:opacity-60 ${className}`}
    >
      {(["white", "black"] as const).map((variant) => (
        <Image
          key={variant}
          src={icon[variant]}
          alt=""
          aria-hidden="true"
          width={icon.width}
          height={icon.height}
          className={`pointer-events-none col-start-1 row-start-1 select-none transition-opacity duration-300 ${
            tone === variant ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </button>
  );
}
