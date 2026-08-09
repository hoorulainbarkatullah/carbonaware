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
  Globe,
  X,
  AlertCircle,
  BookOpen,
  RotateCcw
} from "lucide-react";

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "leaderboard">("active");
  const [leaderboardFilter, setLeaderboardFilter] = useState<"weekly" | "monthly" | "all">("all");

  // Quiz & Detail Modal states
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    earnedPoints: number;
    earnedXp: number;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    points: 1280,
    xp: 450,
    level: 1,
    streak: 3,
    challenges: [],
    featuredChallenge: null,
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
    leaderboard: [],
    stats: {
      challengesCompleted: 2,
      averageScore: 85,
      currentStreak: 3,
    },
    completedChallenges: [],
  });

  const getUserId = () => {
    let uid = "demo-user";
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          uid = u.id || u.email || uid;
        } catch (e) {}
      }
    }
    return uid;
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const uid = getUserId();
      const res = await fetch(`/api/challenges?userId=${encodeURIComponent(uid)}&timeframe=${leaderboardFilter}`);
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
  }, [leaderboardFilter]);

  const openQuizModal = async (challengeItem?: any) => {
    const target = challengeItem || data.featuredChallenge || data.challenges[0];
    setSelectedChallenge(target);
    setIsQuizModalOpen(true);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setQuizResult(null);

    // Fetch dynamic questions for selected challenge from MongoDB
    if (target?.id) {
      try {
        setLoadingQuestions(true);
        const uid = getUserId();
        const res = await fetch(`/api/challenges?userId=${encodeURIComponent(uid)}&challengeId=${target.id}`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.questions && resData.questions.length > 0) {
            setQuizQuestions(resData.questions);
          } else {
            // fallback questions if db questions not loaded
            setQuizQuestions([
              {
                id: "q1",
                question: "Which sector is typically the largest contributor to personal carbon footprints?",
                options: ["Transportation and fossil fuel travel", "Digital messaging and emails", "Clothing manufacturing", "Paper consumption"],
                correctIndex: 0,
                explanation: "Transportation makes up over 40% of an average individual's carbon footprint.",
              },
              {
                id: "q2",
                question: "How many kilograms of CO₂ are emitted per liter of gasoline burned?",
                options: ["0.5 kg", "2.31 kg", "5.0 kg", "10.2 kg"],
                correctIndex: 1,
                explanation: "Burning 1 liter of gasoline releases ~2.31 kg of CO₂.",
              },
            ]);
          }
        }
      } catch (e) {
        console.error("Error fetching questions:", e);
      } finally {
        setLoadingQuestions(false);
      }
    }
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    const nextAnswers = [...userAnswers, selectedOption];
    setUserAnswers(nextAnswers);

    if (currentQIndex < quizQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
    } else {
      // Calculate score
      let correct = 0;
      nextAnswers.forEach((ans, idx) => {
        if (ans === quizQuestions[idx].correctIndex) correct++;
      });
      const calculatedScore = Math.round((correct / quizQuestions.length) * 100);
      submitQuizResults(calculatedScore, nextAnswers);
    }
  };

  const submitQuizResults = async (score: number, answers: number[]) => {
    setSubmittingQuiz(true);
    try {
      const uid = getUserId();
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          action: "submit_quiz",
          challengeId: selectedChallenge?.id || data.featuredChallenge?.id,
          score: score,
          userAnswers: answers,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        setQuizResult({
          score: score,
          passed: resData.passed,
          earnedPoints: resData.earnedPoints || 0,
          earnedXp: resData.earnedXp || 0,
        });
        fetchChallenges();
        window.dispatchEvent(new Event("userUpdated"));
      }
    } catch (err) {
      console.error("Failed to submit quiz results:", err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const activeChallenge = selectedChallenge || data.featuredChallenge || data.challenges[0];
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
                      {data.featuredChallenge?.deadline || "Ends in 6d 12h 30m"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight">
                      {data.featuredChallenge?.title || "Eco Quiz Challenge"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                      {data.featuredChallenge?.description || "Test your knowledge about climate change, sustainability, and eco-friendly living."}
                    </p>
                  </div>

                  {/* Badges row */}
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{data.featuredChallenge?.totalQuestions || 10} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{data.featuredChallenge?.estimatedTime || "5 min"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="font-extrabold">{data.featuredChallenge?.rewardPoints || 100} Points</span>
                    </div>
                  </div>
                </div>

                {/* Start / Continue Button */}
                <div className="self-stretch md:self-center flex items-center">
                  <button
                    onClick={() => openQuizModal(data.featuredChallenge)}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition cursor-pointer text-xs whitespace-nowrap text-center"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>

              {/* ALL AVAILABLE CHALLENGES SELECTION LIST */}
              {data.challenges && data.challenges.length > 1 && (
                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-3">
                  <h4 className="text-xs font-black text-gray-900">Explore More Challenges</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.challenges.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => openQuizModal(c)}
                        className="p-3.5 rounded-xl border border-gray-150 hover:border-emerald-300 hover:bg-emerald-50/30 transition cursor-pointer flex items-center justify-between space-x-3 group"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {c.category} • {c.difficulty}
                          </span>
                          <h5 className="text-xs font-black text-gray-900 group-hover:text-emerald-700 transition">
                            {c.title}
                          </h5>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{c.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  <span>💡 Keep going! Complete the quiz to earn {data.featuredChallenge?.rewardPoints || 100} points.</span>
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
                      Answer multiple choice questions.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center space-y-2 relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      2
                    </div>
                    <h5 className="text-xs font-bold text-gray-800">Score Points</h5>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                      Get points & XP for each correct answer.
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
                          {data.featuredChallenge?.topicsCovered || "Climate change, renewable energy, waste management, sustainable living and more."}
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
                          {data.featuredChallenge?.rewardPoints || 100} points + {data.featuredChallenge?.xpReward || 150} XP + Chance to earn exclusive badges.
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
                {data.completedChallenges?.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-xl border border-gray-150 flex items-center justify-between bg-emerald-50/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-gray-900">{item.title}</h5>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          {item.category} • Score: {item.score}% • Completed on {item.completedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
                        +{item.points} Points
                      </span>
                    </div>
                  </div>
                ))}

                {(!data.completedChallenges || data.completedChallenges.length === 0) && (
                  <div className="py-8 text-center text-gray-400 font-semibold text-xs">
                    No completed challenges yet. Complete a quiz to log your achievements!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h4 className="text-sm font-extrabold text-gray-900">Regional Leaderboard Rankings</h4>
                
                {/* Weekly / Monthly / All Time Filter */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-[10px] font-extrabold">
                  <button
                    onClick={() => setLeaderboardFilter("weekly")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      leaderboardFilter === "weekly" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setLeaderboardFilter("monthly")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      leaderboardFilter === "monthly" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setLeaderboardFilter("all")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      leaderboardFilter === "all" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {data.leaderboard?.map((item: any) => (
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
                        <div className="flex items-center gap-2">
                          <span className="block">{item.name}</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">
                            Lvl {item.level}
                          </span>
                        </div>
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
              {data.badges.map((b: any) => {
                const getIcon = () => {
                  if (b.name.includes("Beginner")) return <CheckCircle className="w-6 h-6" />;
                  if (b.name.includes("Explorer")) return <Globe className="w-6 h-6" />;
                  if (b.name.includes("Expert")) return <Shield className="w-6 h-6" />;
                  return <Trophy className="w-6 h-6" />;
                };

                const getColor = () => {
                  if (b.color === "emerald") return "bg-emerald-50/30 border-emerald-100 text-emerald-600 bg-emerald-100";
                  if (b.color === "blue") return "bg-blue-50/30 border-blue-100 text-blue-600 bg-blue-100";
                  if (b.color === "purple") return "bg-purple-50/30 border-purple-100 text-purple-600 bg-purple-100";
                  return "bg-amber-50/30 border-amber-100 text-amber-600 bg-amber-100";
                };

                return (
                  <div
                    key={b.id}
                    className={`border p-3 rounded-2xl flex flex-col items-center text-center space-y-1.5 ${
                      b.unlocked ? getColor() : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${b.unlocked ? "" : "bg-gray-200 text-gray-400"}`}>
                      {getIcon()}
                    </div>
                    <span className="text-xs font-black text-gray-900 leading-tight">{b.name}</span>
                    <span className="text-[9px] text-gray-400 font-bold">{b.req}</span>
                  </div>
                );
              })}
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
                <span className="text-gray-900 font-black">{data.stats?.challengesCompleted || 0}</span>
              </div>

              {/* Average Score */}
              <div className="flex justify-between items-center py-1 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Average Score</span>
                </div>
                <span className="text-gray-900 font-black">{data.stats?.averageScore || 85}%</span>
              </div>

              {/* Current Streak */}
              <div className="flex justify-between items-center py-1 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Current Streak</span>
                </div>
                <span className="text-gray-900 font-black">{data.stats?.currentStreak || 3} Days</span>
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

      {/* ================= INTERACTIVE QUIZ MODAL ================= */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn space-y-4">
            
            <button
              onClick={() => setIsQuizModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingQuestions ? (
              <div className="py-12 text-center text-xs font-bold text-gray-400 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading questions from MongoDB...</p>
              </div>
            ) : quizResult === null ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                      {activeChallenge?.title || "Sustainability Quiz"}
                    </span>
                    <h3 className="text-sm font-black text-gray-900">
                      Question {currentQIndex + 1} of {quizQuestions.length}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    +{activeChallenge?.rewardPoints || 100} Points
                  </span>
                </div>

                {/* MODAL QUESTION PROGRESS BAR */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.round(((currentQIndex + 1) / (quizQuestions.length || 1)) * 100)}%` }}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    {quizQuestions[currentQIndex]?.question}
                  </p>

                  <div className="space-y-2 pt-2">
                    {quizQuestions[currentQIndex]?.options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                          selectedOption === idx
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedOption === idx && (
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {currentQIndex > 0 ? (
                    <button
                      onClick={() => {
                        const prevIdx = currentQIndex - 1;
                        setCurrentQIndex(prevIdx);
                        setSelectedOption(userAnswers[prevIdx] ?? null);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Previous
                    </button>
                  ) : <div />}

                  <button
                    disabled={selectedOption === null || submittingQuiz}
                    onClick={handleNextQuestion}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer flex items-center gap-2"
                  >
                    {submittingQuiz ? (
                      <span>Saving attempt...</span>
                    ) : currentQIndex === quizQuestions.length - 1 ? (
                      "Submit Quiz"
                    ) : (
                      "Next Question"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl border border-emerald-200">
                  {quizResult.passed ? "🏆" : "💡"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {quizResult.passed ? "Challenge Passed!" : "Attempt Recorded"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    You scored <span className="font-extrabold text-emerald-600">{quizResult.score}%</span> on {activeChallenge?.title}.
                  </p>
                </div>

                {quizResult.passed ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs font-bold text-emerald-900 space-y-1">
                    <p>🎉 +{quizResult.earnedPoints} Points & +{quizResult.earnedXp} XP awarded!</p>
                    <p className="text-[10px] text-emerald-700 font-normal">
                      Badge & completion status updated in your MongoDB profile.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-xs font-bold text-amber-900 space-y-1">
                    <p>Passing score is {activeChallenge?.passingScore || 70}%.</p>
                    <p className="text-[10px] text-amber-700 font-normal">
                      Attempt saved in MongoDB. Review the topics and retry anytime!
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  {!quizResult.passed && (
                    <button
                      onClick={() => openQuizModal(activeChallenge)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Quiz
                    </button>
                  )}
                  <button
                    onClick={() => setIsQuizModalOpen(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer"
                  >
                    View Leaderboard & Badges
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
