"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Leaf, LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About Us", href: "#about-us" },
];

export default function Navbar() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("Home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const syncUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) { }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    window.addEventListener("userUpdated", syncUser);
    return () => window.removeEventListener("userUpdated", syncUser);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }

      const scrollPosition = window.scrollY + 100;
      for (const item of navItems) {
        const el = document.querySelector(item.href);
        if (el) {
          const top = (el as HTMLElement).offsetTop;
          const height = (el as HTMLElement).offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveItem(item.label);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowProfileDropdown(false);
    router.push("/signin");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${hasScrolled
        ? "bg-white/95 backdrop-blur-md shadow-md border-b border-border-gray/50 py-3"
        : "bg-white py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="#home" className="flex items-center space-x-2 group">
            <div className="bg-accent-green p-2 rounded-lg text-primary transition-transform group-hover:scale-110">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-heading tracking-tight block leading-none">
                Carbon<span className="text-primary">Aware</span>
              </span>
              <span className="text-[10px] text-body block font-medium uppercase tracking-wider leading-none mt-1">
                Track. Reduce. Sustain.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveItem(item.label)}
                className={`relative px-1 py-2 text-sm font-semibold transition-colors duration-200 hover:text-primary ${activeItem === item.label ? "text-primary" : "text-body"
                  }`}
              >
                {item.label}
                {activeItem === item.label && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* Desktop Action / Profile Dropdown Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 bg-white pl-2.5 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-emerald-500 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center border border-emerald-200 shadow-sm text-xs uppercase">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-xs font-black text-gray-800">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 text-xs font-bold text-gray-700 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-extrabold text-gray-900 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition"
                    >
                      <Settings className="w-4 h-4 text-emerald-600" />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition border-t border-gray-100 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-primary border border-primary hover:bg-accent-green/30 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburg Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-body hover:text-primary transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-border-gray animate-fadeIn">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActiveItem(item.label);
                  setIsMobileMenuOpen(false);
                }}
                className={`block px-4 py-2.5 rounded-lg text-base font-semibold transition-colors ${activeItem === item.label
                  ? "bg-accent-green text-primary"
                  : "text-body hover:bg-section-bg hover:text-primary"
                  }`}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border-gray/50 flex flex-col space-y-3 px-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg text-base font-semibold text-white bg-primary hover:bg-primary-hover shadow-md transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg text-base font-semibold text-primary border border-primary hover:bg-accent-green/30 transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-center py-2.5 rounded-lg text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg text-base font-semibold text-primary border border-primary hover:bg-accent-green/30 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg text-base font-semibold text-white bg-primary hover:bg-primary-hover shadow-md transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
