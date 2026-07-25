
import Image from "next/image";
import Link from "next/link";

export default function WindriseHero() {
  return (
    <section
      style={{
    background: "linear-gradient(to top, #EAE4DF 63%, #FFFFFF 100%)",
  }}

    >
      <div className="mx-auto flex flex-col px-6 pb-9 lg:pb-16 lg:-mt-14 md:-mt-14 md:flex-row md:items-center md:justify-between md:gap-10 lg:gap-20 lg:px-19 md:px-19">
      {/* Image */}
      <div
        className="
          order-1 w-full 
          md:order-2 md:w-1/2 md:pt-0  
        "
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px] md:rounded-[9px] lg:rounded-[9px] bg-[#DAD5CF] sm:aspect-[880/450] ">
          <Image
            src="/assets/three-person-2.png"
            alt="Windrise model wearing a striped shirt and jeans"
            width={880}
            height={450}
            priority
            // sizes="(max-width: 640px) 100vw, 60vw"
            className="object-cover object-[center_8%] sm:object-[center_15%] md:w-[880px] lg:w-[880px] h-full"
          />
        </div>
      </div>

      {/* Text content */}
      <div className="order-2 max-w-full pt-6 md:order-1 md:w-1/2 md:max-w-[560px] md:pt-0 lg:ml-50 md:ml-50">
        <h1 className="mb-5 text-[22px] font-medium leading-[1.15] tracking-tight text-[#1C1B1A] sm:text-[32px] lg:text-[40px]">
          Simple forms
          <br />
          Endless versatility
        </h1>

        <p className="mb-5 max-w-full text-[13.5px] leading-[1.7] text-[#7A7670] sm:mb-8 lg:max-w-[580px] lg:text-[25px]">
          Designed with premium materials and refined craftsmanship, each
          piece reflects the simplicity, comfort and confidence of Windrise.
        </p>

        <Link
          href="#"
          className="group inline-flex items-center gap-2  border-transparent pb-0.5 text-[13.5px] font-light  text-[#1C1B1A] transition-[gap] duration-200 hover:gap-3 hover:border-[#1C1B1A] sm:text-[15px] md:text-xl lg:text-xl"
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