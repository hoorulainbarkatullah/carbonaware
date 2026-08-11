"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, Eye, EyeOff, X, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-dismiss error alert after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-[#f4f8f5]">
      {/* Left illustration panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden text-white flex-col p-12"
        style={{
          backgroundImage: `
      linear-gradient(
        135deg,
        rgba(13,59,38,0.88),
        rgba(15,74,47,0.82),
        rgba(18,96,60,0.88)
      ),
      url('/hero-illustration.png')
    `,
          backgroundSize: "cover",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Decorative Background */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0a2e1e]/60 to-transparent" />

        {/* ================= Logo ================= */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-2 group self-start">
            <div className="bg-emerald-500/20 p-2 rounded-lg text-green-400 transition-transform group-hover:scale-110">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight block leading-none">
                Carbon<span className="text-green-400">Aware</span>
              </span>
              <span className="text-[10px] text-white/70 block font-medium uppercase tracking-wider leading-none mt-1">
                Track. Reduce. Sustain.
              </span>
            </div>
          </Link>
        </div>

        {/* ================= Hero + Stats ================= */}
        <div className="relative z-10 flex-2 flex flex-col justify-center">
          {/* Hero */}
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold leading-tight">
              Small actions today,
              <br />
              <span className="text-green-400">big impact</span> tomorrow.
            </h2>

            <p className="mt-6 text-[16px] leading-8 text-white/80">
              Track your carbon footprint, discover sustainable habits, receive
              AI-powered recommendations, and make every action count toward
              building a cleaner, greener future.
            </p>
          </div>

          {/* Stats Card */}
          <div className="mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md px-10 py-6 shadow-xl">
            <div className="flex items-center gap-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-400/20">
                <Leaf className="h-5 w-5 text-green-400" />
              </span>

              <div>
                <p className="text-sm text-white/80">Together we've saved</p>

                <h4 className="text-xl font-bold text-green-400">
                  12,450 kg CO₂
                </h4>

                <p className="text-sm text-white/60">Keep going! 🌱</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0f4a2f]/10">
              <Leaf className="w-5 h-5 text-[#12603c]" strokeWidth={2.5} />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-[#0f4a2f]">
              Carbon<span className="text-green-600">Aware</span>
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome Back! 
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to continue your journey
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-black flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-700 transition p-1 rounded-lg hover:bg-red-100 cursor-pointer"
                title="Close error message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-green-600 hover:text-green-700"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#22a559] to-[#3fbf6b] shadow-lg shadow-green-600/20 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <FacebookIcon />
                Facebook
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account?
            <Link
              href="/signup"
              className="text-green-600 font-medium hover:text-green-700"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16 4 9.1 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.6 26.9 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9 39.4 15.9 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.6 5.4C41.6 36.1 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"
      />
    </svg>
  );
}
