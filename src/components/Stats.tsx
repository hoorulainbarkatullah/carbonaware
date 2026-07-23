"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Cloud, Users, Award, Trees } from "lucide-react";

const stats = [
  {
    icon: Cloud,
    number: "125,450",
    label: "kg CO₂ Reduced",
    description:
      "Total net carbon emissions offset directly by community actions.",
  },
  {
    icon: Users,
    number: "10,250+",
    label: "Active Users",
    description: "Environmentally conscious citizens participating daily.",
  },
  {
    icon: Award,
    number: "3,200+",
    label: "Challenges Completed",
    description: "Gamified sustainability challenges completed successfully.",
  },
  {
    icon: Trees,
    number: "15,800+",
    label: "Trees Equivalent",
    description: "Equivalent absorption value of mature trees planted.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

function AnimatedNumber({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const numericValue = Number(value.replace(/[^\d]/g, ""));
  const suffix = value.replace(/\d/g, "");

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const duration = 2400;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 3);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(numericValue * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, numericValue]);

  return (
    <span
      ref={ref}
      className="text-3xl md:text-4xl font-extrabold text-heading tracking-tight mb-1"
    >
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="py-16 md:py-24 bg-section-bg border-y border-border-gray/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="bg-white p-6 rounded-2xl border border-border-gray/50 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-all duration-300"
              >
                {/* Green Icon */}
                <div className="h-12 w-12 bg-accent-green rounded-full flex items-center justify-center text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                {/* Large Number */}
                <AnimatedNumber value={stat.number} />
                {/* Small Label */}
                <span className="text-sm font-bold text-primary mb-2">
                  {stat.label}
                </span>
                {/* Description */}
                <p className="text-xs text-body font-medium leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
