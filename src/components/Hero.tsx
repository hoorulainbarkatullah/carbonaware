"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden py-16 lg:py-24"
      style={{
        backgroundImage: `url('/hero-illustration.png')`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
        backgroundSize: "58%",
      }}
    >
      {/* Background Blur */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent-green/20 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-secondary-green/10 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-green px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Sustainability Platform</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-heading">
            Track Your Carbon.
            <span className="block mt-2 text-primary">Change Your Future.</span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-lg text-lg leading-8 text-body">
            Measure your carbon footprint, receive AI-powered recommendations,
            and take meaningful steps toward a greener, more sustainable
            tomorrow.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="#features"
              className="inline-flex items-center rounded-xl border border-border-gray bg-white px-8 py-4 text-base font-bold text-heading shadow-md transition-all duration-300 hover:bg-section-bg"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
