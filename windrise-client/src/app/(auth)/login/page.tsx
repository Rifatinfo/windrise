import { Suspense } from 'react'
import { LoginLayout } from '@/components/modules/auth/LoginLayout'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginLayout />
    </Suspense>
  )
}
