"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  HelpCircle,
  Users,
  Award,
  Flame,
  Leaf,
  ChevronRight,
  Shield,
  Zap,
  Check,
  TrendingUp,
  Globe
} from "lucide-react";

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "leaderboard">("active");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    points: 1280,
    streak: 3,
    progress: {
      completedQuestions: 3,
      totalQuestions: 10,
      score: 85,
      isCompleted: false,
    },
    badges: [
      { id: "b1", name: "Eco Beginner", req: "Score 70% or more", color: "emerald", unlocked: true },
      { id: "b2", name: "Eco Explorer", req: "Score 80% or more", color: "blue", unlocked: true },
      { id: "b3", name: "Eco Expert", req: "Score 90% or more", color: "purple", unlocked: false },
      { id: "b4", name: "Eco Champion", req: "Score 100%", color: "amber", unlocked: false },
    ],
    leaderboard: [
      { rank: 1, name: "Sara Khan", points: 1450, location: "Peshawar, KP", isUser: false },
      { rank: 2, name: "Ali Khan (You)", points: 1280, location: "Peshawar, KP", isUser: true },
      { rank: 3, name: "Hamza Bilal", points: 1120, location: "Lahore, PB", isUser: false },
      { rank: 4, name: "Ayesha Noor", points: 980, location: "Islamabad, ICT", isUser: false },
      { rank: 5, name: "Bilal Ahmed", points: 850, location: "Karachi, SD", isUser: false },
    ],
    stats: {
      challengesCompleted: 2,
      averageScore: 85,
      currentStreak: 3,
    },
    completedChallenges: [
      { id: "cc1", title: "No Car Day Challenge", category: "Transport", points: 150, completedDate: "12 May 2026" },
      { id: "cc2", title: "Zero Plastic Week", category: "Lifestyle", points: 200, completedDate: "04 June 2026" },
    ],
  });

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      let uid = "demo-user";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            uid = u.id || u.email;
          } catch (e) {}
        }
      }

      const res = await fetch(`/api/challenges?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleStartOrContinueQuiz = async () => {
    try {
      let uid = "demo-user";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            uid = u.id || u.email;
          } catch (e) {}
        }
      }

      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, action: "progress" }),
      });

      if (res.ok) {
        fetchChallenges();
      }
    } catch (err) {
      console.error("Failed to advance quiz:", err);
    }
  };

  const completedQuestions = data.progress?.completedQuestions ?? 3;
  const totalQuestions = data.progress?.totalQuestions ?? 10;
  const progressPct = Math.round((completedQuestions / totalQuestions) * 100);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* TABS & POINTS HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-150 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-xs font-black transition cursor-pointer relative ${
              activeTab === "active" ? "text-emerald-700" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span>Active Challenges</span>
            {activeTab === "active" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-3 text-xs font-black transition cursor-pointer relative ${
              activeTab === "completed" ? "text-emerald-700" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span>Completed Challenges</span>
            {activeTab === "completed" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`pb-3 text-xs font-black transition cursor-pointer relative ${
              activeTab === "leaderboard" ? "text-emerald-700" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span>Leaderboard</span>
            {activeTab === "leaderboard" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        </div>

        {/* My Points Badge */}
        <div className="bg-[#f0fdf4] border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm self-end sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">My Points</span>
            <span className="text-base font-black text-gray-900 leading-none">{data.points.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT MATCHING REFERENCE IMAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: FEATURED CHALLENGE & DETAILS (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === "active" && (
            <>
              {/* FEATURED CHALLENGE CARD */}
              <div className="bg-[#f2fcf5] border border-emerald-100 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Left Illustration */}
                <div className="w-32 h-32 flex-shrink-0 bg-white rounded-2xl border border-emerald-100 p-3 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xl mb-1 border border-emerald-100">
                    📋
                  </div>
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">QUIZ</span>
                </div>

                {/* Challenge Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                      FEATURED CHALLENGE
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-150 shadow-sm">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      Ends in 6d 12h 30m
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight">Eco Quiz Challenge</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                      Test your knowledge about climate change, sustainability, and eco-friendly living.
                    </p>
                  </div>

                  {/* Badges row */}
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>10 Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>5 min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="font-extrabold">100 Points</span>
                    </div>
                  </div>
                </div>

                {/* Start / Continue Button */}
                <div className="self-stretch md:self-center flex items-center">
                  <button
                    onClick={handleStartOrContinueQuiz}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition cursor-pointer text-xs whitespace-nowrap text-center"
                  >
                    {completedQuestions === 0 ? "Start Quiz" : completedQuestions >= 10 ? "Retake Quiz" : "Continue Quiz"}
                  </button>
                </div>
              </div>

              {/* YOUR PROGRESS CARD */}
              <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-3">
                <h4 className="text-xs font-black text-gray-900">Your Progress</h4>
                
                <div className="flex items-center gap-4">
                  <div className="h-2.5 bg-emerald-50 rounded-full flex-grow overflow-hidden border border-emerald-100">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
                    {completedQuestions} / {totalQuestions} Questions Completed
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold pt-1">
                  <span>💡 Keep going! Complete the quiz to earn 100 points.</span>
                </div>
              </div>

              {/* HOW IT WORKS */}
              <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
                <h4 className="text-xs font-black text-gray-900">How It Works</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center space-y-2 relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      1
                    </div>
                    <h5 className="text-xs font-bold text-gray-800">Start the Quiz</h5>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                      Answer 10 multiple choice questions.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center space-y-2 relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      2
                    </div>
                    <h5 className="text-xs font-bold text-gray-800">Score Points</h5>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                      Get 10 points for each correct answer.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      3
                    </div>
                    <h5 className="text-xs font-bold text-gray-800">Earn Badges</h5>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                      Score 70% or more to earn exciting badges.
                    </p>
                  </div>
                </div>
              </div>

              {/* CHALLENGE DETAILS */}
              <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden">
                <h4 className="text-xs font-black text-gray-900 mb-4">Challenge Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5 border border-emerald-100">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-gray-800 block">Topics Covered</span>
                        <span className="text-gray-500 text-[11px] font-medium leading-relaxed">
                          Climate change, renewable energy, waste management, sustainable living and more.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5 border border-emerald-100">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-gray-800 block">Who Can Join?</span>
                        <span className="text-gray-500 text-[11px] font-medium leading-relaxed">
                          All CarbonAware users can participate.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5 border border-emerald-100">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-gray-800 block">Reward</span>
                        <span className="text-gray-500 text-[11px] font-medium leading-relaxed">
                          100 points + Chance to earn exclusive badges.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Graphic */}
                  <div className="flex justify-center">
                    <div className="w-28 h-28 bg-[#f2fcf5] rounded-full flex items-center justify-center text-4xl border border-emerald-100 text-emerald-600 shadow-inner">
                      ❓
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "completed" && (
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
              <h4 className="text-sm font-extrabold text-gray-900">Completed Challenges Log</h4>
              <div className="space-y-3">
                {data.completedChallenges.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-xl border border-gray-150 flex items-center justify-between bg-emerald-50/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-gray-900">{item.title}</h5>
                        <p className="text-[10px] text-gray-400 font-semibold">{item.category} • Completed on {item.completedDate}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
                      +{item.points} Points
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
              <h4 className="text-sm font-extrabold text-gray-900">Regional Leaderboard Rankings</h4>
              <div className="space-y-2">
                {data.leaderboard.map((item: any) => (
                  <div
                    key={item.rank}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                      item.isUser ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-black" : "bg-white border-gray-150 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black text-gray-400">#{item.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="block">{item.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{item.location}</span>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-black">{item.points.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: BADGES, STATS & DID YOU KNOW (1 Col) */}
        <div className="space-y-6">
          
          {/* CHALLENGE BADGES GRID (IMAGE MATCH) */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-gray-900">Challenge Badges</h4>
                <p className="text-[10px] text-gray-400 font-medium">Earn badges by completing the challenge.</p>
              </div>
              <button className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Badge 1: Eco Beginner */}
              <div className="bg-emerald-50/30 border border-emerald-100 p-3 rounded-2xl flex flex-col items-center text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-gray-900 leading-tight">Eco Beginner</span>
                <span className="text-[9px] text-gray-400 font-bold">Score 70% or more</span>
              </div>

              {/* Badge 2: Eco Explorer */}
              <div className="bg-blue-50/30 border border-blue-100 p-3 rounded-2xl flex flex-col items-center text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-gray-900 leading-tight">Eco Explorer</span>
                <span className="text-[9px] text-gray-400 font-bold">Score 80% or more</span>
              </div>

              {/* Badge 3: Eco Expert */}
              <div className="bg-purple-50/30 border border-purple-100 p-3 rounded-2xl flex flex-col items-center text-center space-y-1.5 opacity-80">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-gray-900 leading-tight">Eco Expert</span>
                <span className="text-[9px] text-gray-400 font-bold">Score 90% or more</span>
              </div>

              {/* Badge 4: Eco Champion */}
              <div className="bg-amber-50/30 border border-amber-100 p-3 rounded-2xl flex flex-col items-center text-center space-y-1.5 opacity-80">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-gray-900 leading-tight">Eco Champion</span>
                <span className="text-[9px] text-gray-400 font-bold">Score 100%</span>
              </div>
            </div>
          </div>

          {/* YOUR CHALLENGE STATS */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
            <h4 className="text-xs font-black text-gray-900">Your Challenge Stats</h4>

            <div className="space-y-3 text-xs font-bold">
              {/* Challenges Completed */}
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Challenges Completed</span>
                </div>
                <span className="text-gray-900 font-black">{data.stats.challengesCompleted}</span>
              </div>

              {/* Average Score */}
              <div className="flex justify-between items-center py-1 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Average Score</span>
                </div>
                <span className="text-gray-900 font-black">{data.stats.averageScore}%</span>
              </div>

              {/* Current Streak */}
              <div className="flex justify-between items-center py-1 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Current Streak</span>
                </div>
                <span className="text-gray-900 font-black">{data.stats.currentStreak} Days</span>
              </div>
            </div>
          </div>

          {/* DID YOU KNOW CARD */}
          <div className="bg-[#f2fcf5] border border-emerald-100 p-4.5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex items-start gap-3.5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-gray-900 leading-tight">Did You Know?</h5>
              <p className="text-[10px] text-gray-600 leading-relaxed font-semibold mt-1">
                Small daily actions can lead to big changes for our planet!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
