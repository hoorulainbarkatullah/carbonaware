"use client";

import { motion } from "framer-motion";
import { ClipboardList, Calculator, Leaf, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Enter Your Data",
    description: "Input details of your energy bills, daily commute, food habits, and travel logs easily into our app.",
  },
  {
    number: "02",
    icon: Calculator,
    title: "Get Your Footprint",
    description: "Our AI-powered engine immediately computes your exact carbon usage metrics and categorizes emission sources.",
  },
  {
    number: "03",
    icon: Leaf,
    title: "Take Action",
    description: "Follow customized recommendations, complete sustainable challenges, and reduce your global impact.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative details */}
      <div className="absolute top-10 right-10 -z-10 w-48 h-48 bg-accent-green/20 rounded-full blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
            Process Flow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight">
            How It Works
          </h3>
          <p className="text-base text-body font-medium">
            Three simple steps to starting your carbon reduction journey and unlocking sustainable habits.
          </p>
        </div>

        {/* Steps Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-8"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex-1 flex flex-col lg:flex-row items-center lg:items-start w-full relative">
                {/* Step Item */}
                <motion.div
                  variants={stepVariants}
                  className="flex flex-col items-center text-center px-4 w-full"
                >
                  {/* Icon Container with Step Number Badge */}
                  <div className="relative mb-6">
                    <div className="h-20 w-20 bg-accent-green rounded-full flex items-center justify-center text-primary shadow-md hover:scale-105 transition-transform duration-300">
                      <Icon className="h-9 w-9" />
                    </div>
                    {/* Floating Step Number */}
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-xs font-extrabold h-7 w-7 rounded-full flex items-center justify-center border-2 border-white shadow">
                      {step.number}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-bold text-heading mb-3 tracking-tight">
                    {step.title}
                  </h4>
                  {/* Description */}
                  <p className="text-sm text-body leading-relaxed max-w-xs font-medium">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow / Line Connector between steps (Desktop) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-10 left-[75%] w-[50%] h-[2px] items-center justify-center">
                    {/* Dashed line */}
                    <div className="w-full border-t-2 border-dashed border-primary/30" />
                    <ArrowRight className="h-5 w-5 text-primary/45 absolute right-0" />
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
