"use client";

import Link from "next/link";
import { useState } from "react";
import { Leaf, Send } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-forest text-white/90 pt-16 pb-8 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col space-y-4 lg:col-span-1">
            <Link href="#home" className="flex items-center space-x-2 self-start">
              <div className="bg-white/10 p-2 rounded-lg text-secondary-green">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Carbon<span className="text-secondary-green">Aware</span>
              </span>
            </Link>
            <p className="text-xs text-white/70 font-medium leading-relaxed">
              Empowering the world to track carbon footprint output using state-of-the-art AI. Let&apos;s create a greener future together.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3 pt-2">
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-white/80" aria-label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-white/80" aria-label="Twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-white/80" aria-label="Instagram">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-white/80" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-green">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/70">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Challenges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Recommendations</a></li>
            </ul>
          </div>

          {/* Column 3: Company Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-green">
              Company
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/70">
              <li><Link href="#about-us" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Support Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-green">
              Support
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="flex flex-col space-y-4 lg:col-span-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-green">
              Newsletter
            </h4>
            <p className="text-xs text-white/70 font-medium leading-relaxed">
              Subscribe to stay updated with latest carbon news and tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder-white/40 focus:outline-none focus:border-secondary-green transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 bg-secondary-green hover:bg-primary text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>{subscribed ? "Subscribed!" : "Subscribe"}</span>
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/60 font-semibold space-y-4 md:space-y-0">
          <p>© {currentYear} CarbonAware. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">💚</span>
            <span>for a Dash Dash.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
