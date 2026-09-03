
import Image from "next/image";
import Link from "next/link";

export default function WindriseHero() {
  return (
    <section
      style={{
    background: "linear-gradient(to top, #F4F1E9 63%, #FFFFFF 100%)",
  }}

    >
      {/*
        Centred in a 7xl container. `ml-50` used to cancel the `mx-auto` next to
        it — an auto margin cannot centre anything once the other side is pinned
        — so the row ran the full width of the screen with its contents shoved
        right, which squeezed the image to 188px on a tablet.
      */}
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-9 md:flex-row md:items-center md:justify-between md:gap-12 md:px-8 md:py-14 lg:gap-12 lg:px-8 md:pb-28">
      {/* Image — leads the row from md up, as in the reference */}
      <div
        className="
          order-1 w-full
          md:order-1 md:min-w-0 md:flex-1 md:pt-0 
        "
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden  bg-[#DAD5CF] sm:aspect-[880/450] ">
          <Image
            src="/assets/windrise-hero.png"
            alt="Windrise model wearing a striped shirt and jeans"
            width={880}
            height={450}
            priority
            sizes="(max-width: 768px) 100vw, 58vw"
            /* Fills its frame rather than being pinned to 880px: inside a
               narrower column that fixed width was simply cropped away by the
               parent's overflow. */
            className="h-full w-full object-cover object-[center_8%] sm:object-[center_15%]"
          />
        </div>
      </div>

      {/* Text content */}
      <div className="order-2 max-w-full pt-6 md:order-2 md:w-[220px] md:flex-none md:pt-0 lg:w-[300px] xl:w-[400px]">
        <h1 className="mb-5 text-[22px] font-medium leading-[1.15] tracking-tight text-[#1C1B1A] sm:text-[32px] lg:text-4xl">
          Simple forms
          <br />
          Endless versatility
        </h1>

        <p className="mb-5 max-w-full text-[13px] leading-[1.7] sm:mb-8 lg:max-w-[580px] lg:text-lg">
          Designed with premium materials and refined craftsmanship, each
          piece reflects the simplicity, comfort and confidence of Windrise.
        </p>

        <Link
          href="#"
          className="group inline-flex items-center gap-2  border-transparent pb-0.5 text-[13.5px] font-light  text-[#1C1B1A] transition-[gap] duration-200 hover:gap-3 hover:border-[#1C1B1A] sm:text-[15px] md:text-lg lg:text-lg"
        >
          Discover Collection
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path
              d="M6 3.5L10.5 8L6 12.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
      </div>
    </section>
  );
}