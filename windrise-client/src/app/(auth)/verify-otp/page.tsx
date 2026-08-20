import { Suspense } from 'react'
import type { Metadata } from 'next'

import { OtpLayout } from '@/components/modules/auth/OtpLayout'

export const metadata: Metadata = {
  title: 'Enter Your OTP | Windrise',
  description: 'Enter the code sent to your email to finish signing in.',
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <OtpLayout />
    </Suspense>
  )
}
