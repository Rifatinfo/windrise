"use client";

import Image from "next/image";
import Link from "next/link";

const BlackLogo = () => {
   return (
        <Link href="/">
            <Image  src="/assets/Logo_Black.png" width={200} height={120} alt='Black Logo'></Image>
        </Link>
    );
};

export default BlackLogo;