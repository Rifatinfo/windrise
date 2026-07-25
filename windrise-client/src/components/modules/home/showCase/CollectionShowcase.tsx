import { ArrowRight, ChevronRight } from 'lucide-react'


const LIFESTYLE_IMAGE_URL ='/assets/young-boy.png'
const MANNEQUIN_IMAGE_URL ='/assets/Mannequin.png'

export function CollectionShowcase() {
  return (
    <section 
    className="relative w-full bg-warmwhite" 
    
    aria-label="Windrise collection showcase" >
       {/* Fade to white */}

      <div className="grid grid-cols-1  lg:grid-cols-[62%_38%]">

        <article className="relative mx-[15px] mt-[15px]  h-[317px] overflow-hidden rounded-[3px] lg:mx-0 -ml-8 lg:mt-0 lg:h-[1080px] lg:rounded-[9px]">
          <img
            src={LIFESTYLE_IMAGE_URL}
            alt="Man carrying a leather bag while wearing a linen shirt and light denim"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute bottom-[46px] right-[2px] w-[123px] text-white lg:bottom-[208px] lg:right-[16.5%] lg:w-[255px]">
            <div className="h-px w-6 bg-white lg:hidden lg:w-[54px]" aria-hidden="true" />
            <h2 className="mt-2.5 text-[15px] lg:leading-[1.24] w-[80px] lg:w-auto tracking-[-0.03em] lg:mt-5 lg:text-5xl font-dm-sans">
              Defining comfort in its purest form.
            </h2>
            <a
              href="#collection"
              className="mt-2.5 inline-flex items-center font-dm-sans gap-2 bg-[#312f2c]/90 px-1.5 py-1.5 text-[8px] font-light text-white transition-colors hover:bg-[#1f1e1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:mt-5 lg:gap-3 lg:px-4 lg:py-2.5 lg:text-lg font-dam-sans"
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
            </a>
          </div>
        </article>

        <article className="relative mx-[15px] h-[405px] overflow-hidden  -ml-8 md:ml-0 lg:mx-0 lg:h-[1233px] font-dm-sans "
        >
          <img
            src={MANNEQUIN_IMAGE_URL}
            alt="Mannequin in a gray sweatshirt and joggers"
            className="absolute bottom-0 left-[19%] h-[364px]  lg:left-[17%] lg:h-[1030px]"
          />
          <div className="absolute bottom-[122px] right-[36px] w-[92px] lg:bottom-[410px] lg:right-[56%] lg:w-[226px]">
            <h2 className="text-[14px] font-medium leading-none tracking-[-0.025em] text-black lg:text-[32px]">
              Built to last.
            </h2>
           
            <p className="mt-5 text-[8px] leading-[1.35] w-[120px] lg:w-auto text-black lg:mt-6 lg:text-[16px] ">
              Rich, earthy shade essentials with a classic, timeless feel.
            </p>

            <a
            href="#collection"
            className="mt-2.5 inline-flex items-center gap-2 bg-black px-1.5 py-1.5 text-[8px] font-light text-white transition-colors hover:bg-neutral-800 lg:mt-5 lg:gap-3 lg:px-3 lg:py-1.5 lg:text-lg font-dm-sans"
            >
            Explore
            <ChevronRight
                className="h-3 w-3 lg:h-5 lg:w-5"
                strokeWidth={1.5}
                aria-hidden="true"
            />
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}
