"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  BookOpen,
  Trophy,
  Users,
  Calculator,
  BarChart3,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function Hero() {
  return (
    <div id="home" className="relative bg-white overflow-hidden pb-6 lg:pb-8">

      {/* 1. HERO MAIN CONTAINER WITH IMAGE ON RIGHT */}
      <section className="relative min-h-[540px] lg:min-h-[620px] flex items-center bg-white">

        {/* Background Image Container (Right Side with Left Gradient Fade) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-full lg:w-[70%] h-full bg-no-repeat bg-cover bg-center lg:bg-right-top"
            style={{ backgroundImage: `url('/hero-illustration.png')` }}
          />
          {/* Soft Left White Fade Overlay */}
          <div className="absolute top-0 left-0 w-full lg:w-[50%] h-full bg-gradient-to-r from-white via-white/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="max-w-xl flex flex-col items-start">

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight"
            >
              Track Your Carbon. <br />
              <span className="text-emerald-700">Change Your Future.</span>
            </motion.h1>

            {/* Sub-headline Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-lg"
            >
              Calculate your carbon footprint, understand your impact, learn with interactive lessons, take challenges and be part of a community working for a greener tomorrow.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex flex-wrap gap-4 items-center"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-800/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white/90 backdrop-blur-sm hover:bg-gray-50 px-6 py-3.5 text-sm font-bold text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Learn How It Works</span>
              </a>
            </motion.div>

            {/* 4 Quick Feature Pills Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md"
            >
              <Link href="/dashboard/calculator" className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center text-emerald-700 group-hover:bg-emerald-50 group-hover:border-emerald-300 transition-all">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="mt-2 text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight group-hover:text-emerald-800">Track Emissions</span>
              </Link>

              <Link href="/dashboard/learning" className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center text-emerald-700 group-hover:bg-emerald-50 group-hover:border-emerald-300 transition-all">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="mt-2 text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight group-hover:text-emerald-800">Learn & Grow</span>
              </Link>

              <Link href="/dashboard/challenges" className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center text-emerald-700 group-hover:bg-emerald-50 group-hover:border-emerald-300 transition-all">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="mt-2 text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight group-hover:text-emerald-800">Take Challenges</span>
              </Link>

              <Link href="/dashboard/community" className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center text-emerald-700 group-hover:bg-emerald-50 group-hover:border-emerald-300 transition-all">
                  <Users className="w-5 h-5" />
                </div>
                <span className="mt-2 text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight group-hover:text-emerald-800">Join Community</span>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>


      {/* 2. FLOATING ACTION BAR CARD (MATCHING IMAGE SECTION 2) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:-mt-12">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-7 shadow-[0_12px_35px_rgb(0,0,0,0.06)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">

          {/* Item 1: Calculate Your Footprint */}
          <Link href="/dashboard/calculator" className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:bg-emerald-900 transition-all">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">Calculate Your Footprint</h4>
              <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">Easily measure your daily activities impact.</p>
            </div>
          </Link>

          {/* Item 2: Understand Your Impact */}
          <Link href="/dashboard" className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:bg-emerald-900 transition-all">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">Understand Your Impact</h4>
              <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">View insights and track your emissions over time.</p>
            </div>
          </Link>

          {/* Item 3: Take Challenges & Earn Badges */}
          <Link href="/dashboard/challenges" className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:bg-emerald-900 transition-all">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">Take Challenges & Earn Badges</h4>
              <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">Complete sustainability challenges and earn rewards.</p>
            </div>
          </Link>

          {/* Item 4: Join a Community */}
          <Link href="/dashboard/community" className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:bg-emerald-900 transition-all">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">Join a Community</h4>
              <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">Connect with like-minded people and share climate actions.</p>
            </div>
          </Link>

        </div>
      </section>

    </div>
  );
}
