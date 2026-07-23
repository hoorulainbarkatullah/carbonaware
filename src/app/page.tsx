import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AboutPage from "@/components/about-us";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Navbar */}
      <Navbar />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Features Section */}
        <Features />

        {/* 4. How It Works Section */}
        <HowItWorks />

        {/* 5. Statistics Section */}
        <Stats />

        {/* About Us Section (To fulfill the Navbar Menu item) */}
        <AboutPage />

        {/* 6. Call To Action Section */}
        <CTA />
      </main>

      {/* 7. Footer Section */}
      <Footer />
    </div>
  );
}
