import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar (Preserved As-Is) */}
      <Navbar />

      <main className="flex-grow space-y-6 lg:space-y-8">
        {/* Redesigned Hero Section */}
        <Hero />

        {/* Redesigned Features & Dashboard Showcase Sections */}
        <Features />
      </main>

      {/* Footer (Preserved As-Is) */}
      <Footer />
    </div>
  );
}
