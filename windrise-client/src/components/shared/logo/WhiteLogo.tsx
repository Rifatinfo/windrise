"use client";

import Image from "next/image";
import Link from "next/link";

const WhiteLogo = () => {
   return (
        <Link href="/">
            <Image className="w-32 h-auto"  src="/assets/Logo_White.svg" width={140} height={26} alt=''></Image>
        </Link>
    );
};

export default WhiteLogo;