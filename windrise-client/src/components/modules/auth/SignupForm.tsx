import React, { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { AppleIcon, FacebookIcon, GoogleIcon } from "./LoginForm";

type SignupFormProps = {
  onSignIn: () => void;
};

export function SignupForm({ onSignIn }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="text-center">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
          Create Account
        </h1>
        <p className="mt-2 text-[13px] leading-snug text-gray-500">
          Sign up to explore your account, orders and
          <br className="hidden sm:block" /> personalized experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-[13px] font-medium text-gray-800 mb-1.5"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your Name"
            className="w-full h-11 rounded-lg bg-white/75 border border-white px-3.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block text-[13px] font-medium text-gray-800 mb-1.5"
          >
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Example@email.com"
            className="w-full h-11 rounded-lg bg-white/75 border border-white px-3.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-[13px] font-medium text-gray-800 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="w-full h-11 rounded-lg bg-white/75 border border-white px-3.5 pr-10 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((isVisible) => !isVisible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOffIcon className="w-[18px] h-[18px]" />
              ) : (
                <EyeIcon className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-full bg-black text-white text-[14px] font-semibold hover:bg-gray-900 transition"
        >
          Sign Up
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="flex-1 h-px bg-gray-300/70" />
        <span className="text-[12px] text-gray-600">Or sign up with</span>
        <span className="flex-1 h-px bg-gray-300/70" />
      </div>

      <div className="mt-5 flex items-center justify-center gap-3.5">
        {[
          <GoogleIcon key="g" />,
          <FacebookIcon key="f" />,
          <AppleIcon key="a" />,
        ].map((icon, i) => (
          <button
            key={i}
            type="button"
            aria-label="Social sign in"
            className="flex-1 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            {icon}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-[13px] text-gray-800">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="font-semibold text-gray-900 hover:underline focus:outline-none focus:underline"
        >
          Sign In
        </button>
      </p>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-gray-400">
        By continuing, you agree to our{" "}
        <a href="#" className="font-semibold text-gray-600">
          Terms of Use
        </a>{" "}
        and
        <br />
        <a href="#" className="font-semibold text-gray-600">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
