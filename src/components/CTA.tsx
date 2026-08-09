"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-dark-forest shadow-xl">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-green/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-[35%_40%_25%] items-stretch">
            {/* Left Side Image */}
            <div
              className="min-h-[220px] w-full bg-cover bg-center bg-no-repeat rounded-l-3xl"
              style={{
                backgroundImage: "url('/cta-illustration.png')",
              }}
            />

            {/* Center Content */}
            <div className="flex items-center px-6 py-10 lg:px-10">
              <div>
                <h2 className="text-3xl md:text-3xl font-extrabold text-white leading-tight">
                  Ready to make a difference?
                </h2>

                <p className="mt-5 text-base leading-7 text-white/80 max-w-md">
                  Join thousands of individuals and organizations tracking their
                  carbon footprint, receiving AI-powered recommendations, and
                  contributing to a cleaner and greener future.
                </p>
              </div>
            </div>

            {/* Right Side Button */}
            <div className="flex items-center justify-center lg:justify-end px-6 py-10 lg:pr-10">
              <Link
                href="/signup"
                className="group inline-flex items-center rounded-xl bg-white px-5 py-4 gap-2 text-base text-dark-forest shadow-lg transition-all duration-300 hover:bg-accent-green hover:-translate-y-1"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
