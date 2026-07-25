



import { StoriesSection } from "@/components/modules/home/blog/StoriesSection";
import { Hero } from "@/components/modules/home/hero/Hero";
import { MiniquinHero } from "@/components/modules/home/miniquinSlide/MiniquinHero";
import { CollectionShowcase } from "@/components/modules/home/showCase/CollectionShowcase";
import WindriseHero from "@/components/modules/home/showCase/WindriseHero";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>windrise  - Trendy Fashion & Lifestyle Products Online</title>
        <meta
          name="description"
          content="Shop the latest fashion trends at windrise. Discover stylish clothing, accessories, and lifestyle products at great prices with fast and secure online shopping."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Hero/>
        <MiniquinHero />
        <CollectionShowcase/>
        <WindriseHero/>
        <StoriesSection/>
      </main>
    </>
  );
}

