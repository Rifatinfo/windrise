import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

export function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
      <path
        fill="#fff"
        d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.643H7.078v3.47h3.047v8.385a12.09 12.09 0 003.75 0v-8.385h2.796z"
      />
    </svg>
  )
}

export function AppleIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 384 512" aria-hidden="true">
      <path
        fill="#000"
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
      />
    </svg>
  )
}

type LoginFormProps = {
  onSignUp: () => void
}

export function LoginForm({ onSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="text-center">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
          Welcome Back!
        </h1>
        <p className="mt-2 text-[13px] leading-snug text-gray-500">
          Sign in to explore your account, orders and
          <br className="hidden sm:block" /> personalized experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-gray-800 mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Example@email.com"
            className="w-full h-11 rounded-lg bg-gray-100 border border-transparent px-3.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-gray-800 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full h-11 rounded-lg bg-gray-100 border border-transparent px-3.5 pr-10 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOffIcon className="w-[18px] h-[18px]" />
              ) : (
                <EyeIcon className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
          <div className="mt-2 text-right">
            <a
              href="#"
              className="text-[12px] font-medium text-gray-700 hover:text-gray-900"
            >
              Forgotten Password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-full bg-black text-white text-[14px] font-semibold hover:bg-gray-900 transition"
        >
          Sign In
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="flex-1 h-px bg-gray-200" />
        <span className="text-[12px] text-gray-400">Or sign in with</span>
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="mt-5 flex items-center justify-center gap-3.5">
        {[<GoogleIcon key="g" />, <FacebookIcon key="f" />, <AppleIcon key="a" />].map(
          (icon, i) => (
            <button
              key={i}
              type="button"
              aria-label="Social sign in"
              className="flex-1 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            >
              {icon}
            </button>
          ),
        )}
      </div>

      <p className="mt-6 text-center text-[13px] text-gray-800">
        Don&apos;t you have an account?{' '}
        <button
          type="button"
          onClick={onSignUp}
          className="font-semibold text-gray-900 hover:underline focus:outline-none focus:underline"
        >
          Sign Up
        </button>
      </p>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-gray-400">
        By continuing, you agree to our{' '}
        <a href="#" className="font-semibold text-gray-600">
          Terms of Use
        </a>{' '}
        and
        <br />
        <a href="#" className="font-semibold text-gray-600">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}
