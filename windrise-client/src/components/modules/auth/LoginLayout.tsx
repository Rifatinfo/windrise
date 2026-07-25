'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/modules/auth/LoginForm'

const LOGIN_HERO_IMAGE =
  'https://cdn.magicpatterns.com/uploads/eFCa3v1zHKsZr8swfVvk8K/login-image.png'

export function LoginLayout() {
  const router = useRouter()

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      <aside className="relative hidden lg:block lg:w-1/2 xl:w-[52%]">
        <img
          src={LOGIN_HERO_IMAGE}
          alt="Two men in streetwear leaning against a vintage red car"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <h2 className="absolute bottom-12 left-10 text-white font-bold text-[40px] leading-[1.05] tracking-tight drop-shadow">
          Made for
          <br />
          the life
          <br />
          you live.
        </h2>
      </aside>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#CCD2D4] to-white">
        <main className="flex-1 flex items-center justify-center px-6 py-10 sm:py-14">
          <LoginForm onSignUp={() => router.push('/register')} />
        </main>

        <div className="relative lg:hidden h-64 sm:h-72 w-full">
          <img
            src={LOGIN_HERO_IMAGE}
            alt="Two men in streetwear leaning against a vintage red car"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <h2 className="absolute bottom-5 right-5 text-white font-bold text-3xl leading-[1.05] tracking-tight text-right drop-shadow">
            Made for
            <br />
            the life
            <br />
            you live.
          </h2>
        </div>
      </div>
    </div>
  )
}
