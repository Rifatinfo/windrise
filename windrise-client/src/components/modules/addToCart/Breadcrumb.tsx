import React from 'react'
import Link from 'next/link'

type BreadcrumbProps = {
  current: string
}

export function Breadcrumb({ current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-[11px] sm:text-[13px] md:text-[16px] text-[#9a9a9a]">
      <ol className="flex items-center gap-1">
        <li>
          <Link href="/" className="transition-colors hover:text-[#1a1a1a]">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-[#9a9a9a]">{current}</li>
      </ol>
    </nav>
  )
}
