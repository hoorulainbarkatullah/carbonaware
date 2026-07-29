"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  Calculator,
  History,
  Lightbulb,
  Trophy,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Bell,
  MapPin,
  Sun,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  CheckCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  label: string;
  icon: React.ComponentType<any>;
  href: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ id?: string; name: string; email: string; location: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Weather state
  const [weatherTemp, setWeatherTemp] = useState<string>("26°C");

  // Notifications state & dropdown toggle
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Profile dropdown toggle
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const syncUserSession = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/signin");
    } else {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // Fetch Weather
        fetch(`/api/weather?location=${encodeURIComponent(parsed.location || "Peshawar, KP")}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.temp) setWeatherTemp(data.temp);
          })
          .catch(() => {});

        // Fetch Notifications
        const uid = parsed.id || parsed.email;
        fetch(`/api/user/notifications?userId=${encodeURIComponent(uid)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setNotifications(data.notifications || []);
              setUnreadCount(data.unreadCount || 0);
            }
          })
          .catch(() => {});

      } catch (err) {
        console.error("Failed to parse user session", err);
        router.replace("/signin");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    syncUserSession();
    window.addEventListener("userUpdated", syncUserSession);
    return () => window.removeEventListener("userUpdated", syncUserSession);
  }, [router]);

  // Outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && unreadCount > 0 && user) {
      setUnreadCount(0);
      try {
        const uid = user.id || user.email;
        await fetch("/api/user/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid }),
        });
      } catch (e) {}
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/signin");
  };

  // Helper to extract user initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Navigation Items
  const navItems: NavItem[] = [
    { label: "Dashboard", icon: Leaf, href: "/dashboard" },
    { label: "Calculator", icon: Calculator, href: "/dashboard/calculator" },
    { label: "History", icon: History, href: "/dashboard/history" },
    { label: "AI Recommendations", icon: Lightbulb, href: "/dashboard/recommendations" },
    { label: "Challenges", icon: Trophy, href: "/dashboard/challenges" },
    { label: "Learning Hub", icon: BookOpen, href: "/dashboard/learning" },
    { label: "Community", icon: Users, href: "/dashboard/community" },
    { label: "Insights (For Orgs)", icon: BarChart3, href: "/dashboard/insights" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  // Dynamic header details based on path and user name
  const getHeaderDetails = () => {
    if (!user) return { title: "Welcome back!", subtitle: "Track your carbon footprint.", isWelcome: true };

    switch (pathname) {
      case "/dashboard/calculator":
        return {
          title: "Carbon Footprint Calculator",
          subtitle: "Calculate your transport and food impact to understand your total footprint.",
          isWelcome: false
        };
      case "/dashboard/history":
        return {
          title: "Footprint History",
          subtitle: "Browse and download past carbon calculation reports and progress history.",
          isWelcome: false
        };
      case "/dashboard/insights":
        return {
          title: "Organizational Insights",
          subtitle: "Real-time carbon footprint audits and department-level efficiency benchmarks.",
          isWelcome: false
        };
      case "/dashboard/settings":
        return {
          title: "Account Settings",
          subtitle: "Update profile configurations, targets thresholds, and carbon notification rules.",
          isWelcome: false
        };
      case "/dashboard/recommendations":
        return {
          title: "AI Recommendations Feed",
          subtitle: "Smart suggestions to reduce your footprint.",
          isWelcome: false
        };
      case "/dashboard/challenges":
        return {
          title: "Eco Challenges",
          subtitle: "Join local sustainability challenges and win rewards.",
          isWelcome: false
        };
      case "/dashboard/learning":
        return {
          title: "Learning Hub",
          subtitle: "Grow your sustainability knowledge and offset skills.",
          isWelcome: false
        };
      case "/dashboard/community":
        return {
          title: "Community Portal",
          subtitle: "Engage with Peshawar local clean air initiatives.",
          isWelcome: false
        };
      default:
        return {
          title: `Welcome back, ${user.name}! 🌿`,
          subtitle: "Track your carbon footprint and make every action count.",
          isWelcome: true
        };
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center font-bold text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  const header = getHeaderDetails();

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-row overflow-x-hidden font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#031c12] text-white flex flex-col justify-between p-6 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col space-y-7">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight block leading-none">
                  Carbon<span className="text-[#22c55e]">Aware</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 block font-medium uppercase tracking-wider mt-1.5">
                  Track. Reduce. Sustain.
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-emerald-100 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-900/30"
                      : "text-emerald-100/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-105 ${
                    isActive ? "text-white" : "text-emerald-100/50 group-hover:text-emerald-400"
                  }`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="flex flex-col space-y-6 mt-6">
          <div
            className="relative rounded-2xl overflow-hidden p-5 border border-white/5 shadow-xl text-white group flex flex-col justify-end min-h-[140px]"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(3, 28, 18, 0.95), rgba(3, 28, 18, 0.45)), url('/sidebar-eco.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10">
              <h4 className="text-sm font-bold leading-snug">
                Small actions today
                <br />
                big impact tomorrow.
              </h4>
              <button className="mt-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto lg:px-8 px-4 py-6">
        
        {/* ================= HEADER ================= */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              {pathname === "/dashboard/calculator" && (
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
                  <Leaf className="w-5.5 h-5.5" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {header.title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {header.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Topbar widgets */}
          <div className="flex items-center gap-3.5 self-stretch sm:self-auto justify-end">
            {header.isWelcome ? (
              <>
                {/* Real Location */}
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200/85 shadow-sm text-sm font-semibold text-gray-700 flex-1 sm:flex-none justify-center">
                  <MapPin className="w-4.5 h-4.5 text-emerald-600" />
                  <span>{user.location || "Peshawar, KP"}</span>
                </div>

                {/* Real Weather */}
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200/85 shadow-sm text-sm font-semibold text-gray-700 flex-1 sm:flex-none justify-center">
                  <Sun className="w-4.5 h-4.5 text-amber-500" />
                  <span>{weatherTemp}</span>
                </div>
              </>
            ) : null}

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleToggleNotifications}
                className="relative p-2.5 rounded-xl bg-white border border-gray-200/85 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <h3 className="text-xs font-black text-gray-900">Notifications</h3>
                    <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {notifications.length} alerts
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                          n.read ? "bg-white border-gray-100" : "bg-emerald-50/40 border-emerald-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-gray-900">{n.title}</span>
                          <span className="text-[9px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Recently
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Card Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 bg-white pl-2.5 pr-4 py-1.5 rounded-full border border-gray-200/80 shadow-sm hover:border-emerald-500 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center border border-emerald-200 shadow-sm text-xs uppercase">
                  {getInitials(user.name)}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <p className="text-xs font-black text-gray-900">{user.name}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Eco Warrior</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 text-xs font-bold text-gray-700 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-extrabold text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition border-t border-gray-100 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page specific contents render here */}
        <main className="flex-grow">
          {children}
        </main>

      </div>
    </div>
  );
}
