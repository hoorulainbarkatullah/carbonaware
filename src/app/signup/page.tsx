"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Footprints,
  Bot,
  Award,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-[#f4f8f5]">
      {/* Left illustration / features panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#f0f9f3] flex-col p-12">

        {/* Background Decoration */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-green-100/60 blur-3xl" />

        {/* ================= Logo ================= */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#12603c]/10">
              <Leaf className="w-5 h-5 text-[#12603c]" strokeWidth={2.5} />
            </span>

            <h1 className="text-xl font-semibold tracking-tight text-[#0f4a2f]">
              Carbon<span className="text-green-600">Aware</span>
            </h1>
          </div>

          <p className="ml-11 mt-1 text-sm text-gray-500">
            Track. Reduce. Sustain.
          </p>
        </div>

        {/* ================= Content ================= */}
        <div className="relative z-10 mt-20">
          <div className="flex-col  ">

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Create Account 🌿
            </h2>

            <p className="text-gray-500 text-[16px] leading-relaxed mb-8">
              Join CarbonAware and start your journey towards a sustainable life.
            </p>

            {/* Features + Phone */}
            <div className="flex flex-row w-full" >

              {/* Feature Rows */}
              <div className="flex-1 space-y-5">

                <FeatureRow
                  icon={<Footprints className="w-5 h-5 text-green-700" />}
                  title="Track Your Footprint"
                  desc="Calculate and monitor your carbon emissions easily."
                />

                <FeatureRow
                  icon={<Bot className="w-5 h-5 text-green-700" />}
                  title="Get AI Recommendations"
                  desc="Personalized tips to reduce your carbon footprint."
                />

                <FeatureRow
                  icon={<Award className="w-5 h-5 text-green-700" />}
                  title="Earn Rewards"
                  desc="Complete challenges and earn badges while making an impact."
                />

              </div>

              {/* Phone */}
              <div className="flex items-center justify-center self-stretch min-w-[220px]">
                <PhoneIllustration />
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
            Create Your Account 🌿
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Fill in the details below to get started
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-650 text-xs font-black">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition font-bold"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500/40"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-green-600 font-medium hover:text-green-700"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-green-600 font-medium hover:text-green-700"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#22a559] to-[#3fbf6b] shadow-lg shadow-green-600/20 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account"}
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
            Already have an account?
            <Link
              href="/signin"
              className="text-green-600 font-medium hover:text-green-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl p-3.5 border border-green-100/80 shadow-sm">
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PhoneIllustration() {
  return (
    <svg viewBox="0 0 220 260" className="w-48 h-auto" fill="none">
      <rect x="35" y="5" width="150" height="250" rx="24" fill="#0f1720" />
      <rect x="43" y="16" width="134" height="228" rx="16" fill="#ffffff" />
      <text
        x="110"
        y="42"
        textAnchor="middle"
        fontSize="11"
        fill="#374151"
        fontWeight="600"
      >
        Your Impact
      </text>
      <circle
        cx="110"
        cy="105"
        r="42"
        fill="none"
        stroke="#e5f5ea"
        strokeWidth="10"
      />
      <circle
        cx="110"
        cy="105"
        r="42"
        fill="none"
        stroke="#2fb463"
        strokeWidth="10"
        strokeDasharray="264"
        strokeDashoffset="66"
        strokeLinecap="round"
        transform="rotate(-90 110 105)"
      />
      <text
        x="110"
        y="100"
        textAnchor="middle"
        fontSize="20"
        fill="#111827"
        fontWeight="700"
      >
        2.4
      </text>
      <text x="110" y="116" textAnchor="middle" fontSize="9" fill="#6b7280">
        tons CO₂e
      </text>
      <text
        x="110"
        y="168"
        textAnchor="middle"
        fontSize="11"
        fill="#25b35cff"
        fontWeight="700"
      >
        ↓ 10%
      </text>
      <text x="110" y="182" textAnchor="middle" fontSize="8" fill="#9ca3af">
        from last month
      </text>
      <path
        d="M60 220 L85 208 L105 218 L130 200 L155 210"
        stroke="#2fb463"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* badge */}
      <circle cx="195" cy="70" r="18" fill="#f5b731" />
      <path
        d="M195 60 l3.5 7.2 8 1.1-5.8 5.6 1.4 8-6.6-4-6.6 4 1.4-8-5.8-5.6 8-1.1z"
        fill="#fff"
      />
    </svg>
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
