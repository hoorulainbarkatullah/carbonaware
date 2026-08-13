"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  Trophy,
  Users,
  ArrowRight,
  History,
  Sparkles,
  BookOpen,
  Leaf,
  Globe,
  CheckCircle2
} from "lucide-react";

export default function Features() {
  return (
    <div id="features" className="pt-12 pb-16 lg:pt-16 lg:pb-24 space-y-16 lg:space-y-20 bg-white">


      {/* 2. DASHBOARD SHOWCASE SECTION (IMAGE 1 SECTION 3 & IMAGE 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-5">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Your Personal Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              All Your Climate Actions in One Dashboard
            </h2>
            <p className="text-base text-gray-600 font-medium leading-relaxed">
              Track your footprint, monitor progress, get recommendations and see how your small steps make a big difference.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 cursor-pointer mt-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right Image Column (Image 3 Dashboard) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
              <img
                src="/dashboard_img.jpeg"
                alt="CarbonAware Personal Climate Dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

        </div>
      </section>


      {/* 3. CORE FEATURES 6-CARD GRID (MATCHING UI SCREENSHOT EXACTLY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-16 flex flex-col items-center">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 block">
            Our Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Everything You Need to Take Climate Action
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Feature 1: Calculator */}
          <Link href="/dashboard/calculator" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center text-center space-y-3 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">Calculator</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Calculate your emissions from transport and food activities.
            </p>
          </Link>

          {/* Feature 2: History Log */}
          <Link href="/dashboard/history" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center text-center space-y-3 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">History Log</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              View and track your past calculations and progress.
            </p>
          </Link>

          {/* Feature 3: AI Recommendations */}
          <Link href="/dashboard/ai-recommendations" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center text-center space-y-3 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">AI Recommendations</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Get personalized tips to reduce your carbon footprint.
            </p>
          </Link>

          {/* Feature 4: Challenges */}
          <Link href="/dashboard/challenges" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center text-center space-y-3 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">Challenges</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Take part in challenges and earn badges for your actions.
            </p>
          </Link>

          {/* Feature 5: Learning Hub */}
          <Link href="/dashboard/learning" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center text-center space-y-3 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">Learning Hub</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Learn about climate change with interactive lessons.
            </p>
          </Link>

          {/* Feature 6: Community */}
          <Link href="/dashboard/community" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center text-center space-y-3 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">Community</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Join discussions and share ideas with the community.
            </p>
          </Link>

        </div>
      </section>


      {/* 4. BOTTOM IMPACT BANNER (EXACT MATCH TO CROPPED UI SCREENSHOT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f7faf8] border border-gray-100 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content (Globe Graphic + Title + Description + Button) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
              
              {/* Green Earth Globe Graphic */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100/60 flex items-center justify-center">
                  <Globe className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-700 stroke-[1.75]" />
                </div>
                <Leaf className="w-6 h-6 text-emerald-600 absolute top-0 right-1" />
                <Leaf className="w-5 h-5 text-emerald-600 absolute bottom-1 left-0 transform -rotate-45" />
              </div>

              {/* Text Block & Get Started Button */}
              <div className="space-y-2.5 text-center sm:text-left flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">Small Actions, Big Impact</h3>
                <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-xs">
                  Every small step you take today helps build a sustainable and greener tomorrow.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 cursor-pointer mt-2"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right 3 Pure White Action Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Card 1: Reduce Emissions */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:shadow-md hover:border-emerald-200 transition-all">
                <Leaf className="w-8 h-8 text-emerald-700 flex-shrink-0 stroke-[1.75] mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight">Reduce Emissions</h4>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 leading-snug">Track and reduce your daily impact.</p>
                </div>
              </div>

              {/* Card 2: Build a Better Tomorrow */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:shadow-md hover:border-emerald-200 transition-all">
                <Users className="w-8 h-8 text-emerald-700 flex-shrink-0 stroke-[1.75] mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight">Build a Better Tomorrow</h4>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 leading-snug">Your actions today shape the future.</p>
                </div>
              </div>

              {/* Card 3: Together We Can */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:shadow-md hover:border-emerald-200 transition-all">
                <Users className="w-8 h-8 text-emerald-700 flex-shrink-0 stroke-[1.75] mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight">Together We Can</h4>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 leading-snug">Join hands with a community that cares.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
