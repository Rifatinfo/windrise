import { ArrowRightIcon, ArrowUpRight, ArrowUpRightIcon } from "lucide-react";

const OUTFIT_IMAGE_URL = "/assets/Left Section.png";
const SEATED_MODEL_IMAGE_URL = "/assets/right-section.png";

const DetailsContactSection = () => {
  return (
    <section
      className="w-full overflow-hidden  text-black"
      aria-labelledby="details-heading"
    >
      <div className="relative z-50">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[248px] mb-20  md:mb-20  bg-[linear-gradient(to_right,#F8F9F6_0%,#D7D5C9_100%)] md:h-[417px] mt-30  md:mt-20 ">
            <img
              src={OUTFIT_IMAGE_URL}
              alt="Windrise outfit with shirt, denim, loafers, and shopping bag"
              className="absolute z-50 bottom-[-66px] left-1/2  lg:-ml-30 md:h-auto w-[252px] h-[370px] -translate-x-1/2 md:bottom-[-128px] md:w-[452px] "
            />

            <h1
              className="
              absolute right-[7%] bottom-[280px] lg:bottom-0 lg:top-[27%] z-10 
              max-w-[43%]
              text-right

              text-[24px]
              lg:text-[55px]
              font-medium
              leading-[115%]
              tracking-[-0.02em]
              sm:block
              font-dm-sans
            "
              style={{
                background: "linear-gradient(180deg, #BDBAAE 0%, #44433F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Designed <span className="block">beyond the</span>
              <span> </span>
              <span>surface</span>
            </h1>
          </div>

          <div className="relative h-[349px]   px-[15px] bg-[#FFFFFF] text-center lg:text-start  md:h-[417px]  md:px-0 md:pt-[45px] md:mt-20 ">
            <div className="md:ml-[66px] ">
              <h2
                id="details-heading"
                className="mt-6  md:mt-0 text-xl font-medium  leading-[115%] font-dm-sans
                 tracking-[-0.02em] md:text-[45px] "
              >
                The beauty lies in
                <br />
                the details.
              </h2>
              <p className="mt-[20px] max-w-[320px] text-[11px] leading-[140%] text-[#616161] md:mt-[15px] md:max-w-[462px] md:text-[25px] lg:text-[25px]">
                Premium fabrics, refined construction and thoughtful details
                define every Windrise essential.
              </p>
              <a
                href="#details"
                className="group mt-[18px] inline-flex items-center gap-1 font-light text-[11px] leading-none transition-opacity hover:opacity-65 focus-visible:outline-offset-4 md:mt-[38px] md:gap-2 md:text-xl"
              >
                <span>Explore</span>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 md:h-4 md:w-4"
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
            <img
              src={SEATED_MODEL_IMAGE_URL}
              alt="Seated model wearing a white shirt and olive trousers"
              className="absolute bottom-[-150px] left-[20px] z-10 md:h-auto h-[324px] w-[324px] md:bottom-[-255px] md:left-auto md:right-[1%] md:w-[549px]"
            />
          </div>
        </div>

        <section
          className="relative mx-0 mt-10 min-h-[350px] overflow-hidden rounded-none bg-[#fbfbfa] px-7 pb-14 pt-32 sm:mx-[4.5%] sm:mt-[80px] sm:min-h-[315px] sm:rounded-[32px] sm:px-[9%] sm:pb-10 sm:pt-8 lg:mt-[92px] lg:min-h-[340px]"
          aria-labelledby="connect-title"
        >
          <div className="relative z-10 grid max-w-[1120px] grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:gap-20 sm:text-left ">
            <div className="lg:ml-6">
              <h2
                id="connect-title"
                className="text-[28px] lg:text-[40px] font-medium leading-none tracking-[-0.06em] text-[#151411] sm:text-[clamp(1.7rem,2.4vw,3rem)]"
              >
                Let’s Connect
              </h2>
              <p className="mt-2 text-[11px] text-[#55524d] lg:text-[20px]">
                We’re here whenever you need us.
              </p>
            </div>
            <div className="mx-auto max-w-[430px]  sm:mx-0  lg:ml-40 ">
              <p className="text-[11px]  text-[#868686] md:text-[15px] lg:text-xl lg:w-[450px]">
                We believe in thoughtful connections. Reach out to our team for
                styling advice, order inquiries or to learn more about the world
                of Windrise.
              </p>

              <a
                href="#contact"
                className="mt-[22px] inline-flex items-center gap-1 text-[12px] font-medium text-black transition-opacity hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black md:mt-[10px] md:text-[15px]"
              >
                Get in Touch
                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
              </a>
            </div>
          </div>

          <img
            src="https://cdn.magicpatterns.com/uploads/qrNPXWagLxBErYu3oqEsjg/connect.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute -bottom-[4%] left-1/2 lg:left-  z-0 w-[100%] max-w-none -translate-x-1/2 select-none  sm:-bottom-[26%] lg:w-[78%]"
          />
        </section>
      </div>
    </section>
  );
};

export default DetailsContactSection;
