"use client";

import { motion } from "framer-motion";
import { Leaf, Target, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <section
      id="about-us"
      className="relative overflow-hidden bg-white py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center space-x-1.5 rounded-full bg-accent-green px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary"
            >
              <span>Our Mission</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold leading-tight tracking-tight text-heading sm:text-5xl"
            >
              Empowering Actions for a Greener Tomorrow
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="text-base font-medium leading-relaxed text-body"
            >
              At CarbonAware, we believe that small, daily modifications can
              lead to massive global changes. Our goal is to democratize carbon
              footprint tracking and make environmental accountability
              accessible, rewarding, and transparent for everyone on Earth.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-base font-medium leading-relaxed text-body"
            >
              Through cutting-edge machine learning and predictive AI models, we
              convert complex utility and consumption data into real,
              actionable recommendations that fit your unique lifestyle.
            </motion.p>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            className="grid grid-cols-1 gap-6"
          >
            {/* Card 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 40 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.6 }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="flex items-start space-x-4 rounded-2xl border border-border-gray p-5 transition-all duration-300 hover:border-primary/30 hover:bg-section-bg hover:shadow-xl"
            >
              <div className="rounded-xl bg-accent-green p-3 text-primary shrink-0">
                <Target className="h-6 w-6" />
              </div>

              <div>
                <h4 className="mb-1 text-lg font-bold text-heading">
                  AI Accuracy
                </h4>

                <p className="text-sm font-medium text-body">
                  Hyper-accurate tracking matching certified environmental
                  index protocols.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 40 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.6 }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="flex items-start space-x-4 rounded-2xl border border-border-gray p-5 transition-all duration-300 hover:border-primary/30 hover:bg-section-bg hover:shadow-xl"
            >
              <div className="rounded-xl bg-accent-green p-3 text-primary shrink-0">
                <Globe className="h-6 w-6" />
              </div>

              <div>
                <h4 className="mb-1 text-lg font-bold text-heading">
                  Global Community
                </h4>

                <p className="text-sm font-medium text-body">
                  Join a growing network of global citizens sharing rewards and
                  insights.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 40 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.6 }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="flex items-start space-x-4 rounded-2xl border border-border-gray p-5 transition-all duration-300 hover:border-primary/30 hover:bg-section-bg hover:shadow-xl"
            >
              <div className="rounded-xl bg-accent-green p-3 text-primary shrink-0">
                <Leaf className="h-6 w-6" />
              </div>

              <div>
                <h4 className="mb-1 text-lg font-bold text-heading">
                  Measurable Offsets
                </h4>

                <p className="text-sm font-medium text-body">
                  Translate digital challenges directly into verified physical
                  trees planted.
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}