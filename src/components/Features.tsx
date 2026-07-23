"use client";

import { motion } from "framer-motion";
import { Footprints, BarChart3, BrainCircuit, Trophy } from "lucide-react";

const features = [
  {
    icon: Footprints,
    title: "Track Emissions",
    description:
      "Connect utilities, scan receipts, or log daily commute routines to seamlessly track your household and footprint carbon emissions in real-time.",
  },
  {
    icon: BarChart3,
    title: "Visualize Impact",
    description:
      "Deep-dive into your climate journey with interactive dynamic dashboards that plot trends, highlight high-impact areas, and show progress over time.",
  },
  {
    icon: BrainCircuit,
    title: "AI Recommendations",
    description:
      "Receive personalized, actionable, and hyper-targeted suggestions from our AI engine to swap habits, reduce utility loads, and optimize your budget.",
  },
  {
    icon: Trophy,
    title: "Gamified Challenges",
    description:
      "Join community challenges, complete carbon savings missions, level up your profile, and redeem eco-friendly badges and real rewards.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Features() {
  return (
    <section
      id="features"
      className="py-20 md:py-28 bg-section-bg relative overflow-hidden"
    >
      {/* Visual background details */}
      <div className="absolute top-1/2 left-0 -z-10 w-96 h-96 bg-accent-green/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
            Key Features
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight">
            Comprehensive Tools to Shrink Your Footprint
          </h3>
          <p className="text-base text-body font-medium">
            Discover a complete suite of carbon tracking features designed to
            make environmental sustainability simple, insightful, and engaging.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
                }}
                className="bg-white p-8 rounded-2xl border border-border-gray/50 shadow-sm transition-all duration-300 flex flex-col items-start text-left"
              >
                {/* Circular Green Icon Container */}
                <div className="p-4 bg-accent-green rounded-2xl text-primary mb-6 transition-transform hover:scale-105 duration-300">
                  <Icon className="h-7 w-7" />
                </div>
                {/* Feature Title */}
                <h4 className="text-xl font-bold text-heading mb-3 tracking-tight">
                  {feature.title}
                </h4>
                {/* Description */}
                <p className="text-sm leading-relaxed text-body font-medium">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
