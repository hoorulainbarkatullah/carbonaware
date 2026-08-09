"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  CheckCircle,
  Award,
  ArrowRight,
  Plus,
  MessageSquare,
  ThumbsUp,
  X,
  Trophy,
  User,
  Leaf,
  Globe,
  Footprints,
  Calculator,
  Zap,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  Clock,
  Sparkles
} from "lucide-react";

export default function LearningPage() {
  // Global search input
  const [searchTerm, setSearchTerm] = useState("");

  // Tab filters for Top Questions & Discussions
  const [activeTab, setActiveTab] = useState<"Recent" | "Trending" | "Unanswered" | "My Activity">("Recent");

  // Ask Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTopic, setNewTopic] = useState("Climate Change 101");
  const [newTag, setNewTag] = useState("Question");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Topic Details Modal State (Open Topic separately with lessons & close button)
  const [selectedTopicModal, setSelectedTopicModal] = useState<any | null>(null);
  const [topicLessons, setTopicLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);

  // Dynamic state from MongoDB APIs
  const [topics, setTopics] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({
    topicsCompleted: 0,
    lessonsCompleted: 0,
    certificatesEarned: 0,
    progressPercentage: 0,
    completedTopicIds: [],
    completedLessonIds: [],
  });
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to resolve user ID safely
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

  // Fetch topics
  const fetchTopics = async (search = "") => {
    try {
      const res = await fetch(`/api/topics?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (err) {
      console.error("Fetch topics error:", err);
    }
  };

  // Fetch questions
  const fetchQuestions = async (tab = activeTab, search = "") => {
    try {
      const uid = getUserId();
      const res = await fetch(
        `/api/questions?tab=${encodeURIComponent(tab)}&search=${encodeURIComponent(search)}&userId=${encodeURIComponent(uid)}`
      );
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
    }
  };

  // Fetch progress and highlights
  const fetchProgressAndHighlights = async () => {
    try {
      const uid = getUserId();
      const res = await fetch(`/api/learning-progress?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (data.success && data.progress) {
        setProgress({
          topicsCompleted: data.progress.topicsCompleted || 0,
          lessonsCompleted: data.progress.lessonsCompleted || 0,
          certificatesEarned: data.progress.certificatesEarned || 0,
          progressPercentage: data.progress.progressPercentage || 0,
          completedTopicIds: data.progress.completedTopicIds || [],
          completedLessonIds: data.progress.completedLessonIds || [],
        });
        setHighlights(data.highlights || []);
      }
    } catch (err) {
      console.error("Fetch learning progress error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchQuestions();
    fetchProgressAndHighlights();
  }, []);

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchTopics(val);
    fetchQuestions(activeTab, val);
  };

  // Tab change handler
  const handleTabChange = (tab: "Recent" | "Trending" | "Unanswered" | "My Activity") => {
    setActiveTab(tab);
    fetchQuestions(tab, searchTerm);
  };

  // Open Topic Modal & fetch lessons
  const handleOpenTopicModal = async (topic: any) => {
    setSelectedTopicModal(topic);
    setActiveLessonIndex(0);
    setLoadingLessons(true);
    try {
      const res = await fetch(`/api/topics/lessons?topicId=${encodeURIComponent(topic.id || topic.slug)}`);
      const data = await res.json();
      if (data.success && data.lessons) {
        setTopicLessons(data.lessons);
      }
    } catch (err) {
      console.error("Error fetching topic lessons:", err);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Close Topic Modal without forcing completion (shows actual DB real data)
  const handleCloseTopicModal = () => {
    setSelectedTopicModal(null);
    setTopicLessons([]);
    setActiveLessonIndex(null);
  };

  // Mark lesson as complete
  const handleCompleteLesson = async (lesson: any) => {
    try {
      setCompletingLessonId(lesson.id);
      const uid = getUserId();
      const res = await fetch("/api/learning-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          action: "complete_lesson",
          lessonId: lesson.id,
        }),
      });

      if (res.ok) {
        await fetchProgressAndHighlights();
        window.dispatchEvent(new Event("userUpdated"));
      }
    } catch (err) {
      console.error("Complete lesson error:", err);
    } finally {
      setCompletingLessonId(null);
    }
  };

  // Complete whole topic
  const handleCompleteTopic = async () => {
    if (!selectedTopicModal) return;
    try {
      const uid = getUserId();
      const res = await fetch("/api/learning-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          action: "complete_topic",
          topicId: selectedTopicModal.id,
        }),
      });

      if (res.ok) {
        await fetchProgressAndHighlights();
        window.dispatchEvent(new Event("userUpdated"));
      }
    } catch (err) {
      console.error("Complete topic error:", err);
    }
  };

  // Handle Question Like
  const handleLikeQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
      if (res.ok) {
        fetchQuestions(activeTab, searchTerm);
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Submit Ask Question
  const handleAskQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    try {
      setIsSubmitting(true);
      const uid = getUserId();
      let authorName = "Demo User";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            authorName = JSON.parse(stored).name || authorName;
          } catch (err) {}
        }
      }

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          topic: newTopic,
          difficultyTag: newTag,
          author: authorName,
          userId: uid,
          categoryTab: activeTab,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setIsModalOpen(false);
        fetchQuestions(activeTab, searchTerm);
        fetchTopics();
        window.dispatchEvent(new Event("userUpdated"));
      }
    } catch (err) {
      console.error("Submit question error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic icon helper
  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case "climate":
        return <Globe className="w-5 h-5 text-emerald-600" />;
      case "footprint":
        return <Footprints className="w-5 h-5 text-emerald-600" />;
      case "calculator":
        return <Calculator className="w-5 h-5 text-emerald-600" />;
      case "solutions":
        return <Zap className="w-5 h-5 text-emerald-600" />;
      case "sustainability":
        return <Leaf className="w-5 h-5 text-emerald-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
    }
  };

  const isTopicCompleted = (topicId: string) => {
    return (progress.completedTopicIds || []).includes(topicId);
  };

  const isLessonCompleted = (lessonId: string) => {
    return (progress.completedLessonIds || []).includes(lessonId);
  };

  return (
    <div className="flex flex-col space-y-6">

      {/* TOP HEADER CONTROLS (SEARCH & ASK QUESTION BUTTON) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-grow max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search learning topics, questions, discussions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-150 bg-white text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-[0_2px_10px_rgb(0,0,0,0.01)]"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer text-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: HERO BANNER, EXPLORE TOPICS & DISCUSSIONS (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* HERO LEARNING BANNER */}
          <div className="bg-[#f2fcf5] border border-emerald-100 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 max-w-md">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                RECOMMENDED LESSON
              </span>
              <h2 className="text-xl font-black text-gray-900 leading-tight">
                Understanding Your Carbon Footprint: A Complete Beginner's Guide
              </h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Learn the core fundamentals of emissions, measurement metrics, and actionable daily choices to minimize your footprint.
              </p>
              <button
                onClick={() => {
                  if (topics.length > 0) handleOpenTopicModal(topics[0]);
                }}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Start Learning (+20 Pts)
              </button>
            </div>

            {/* Illustrative Graphic */}
            <div className="relative w-48 h-36 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-600 text-5xl">
                🌱
              </div>
            </div>
          </div>

          {/* EXPLORE TOPICS CARDS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-gray-900">Explore Topics</h3>
              <span className="text-[11px] font-extrabold text-gray-400">
                Click any topic to open lessons
              </span>
            </div>

            {/* Topic Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 overflow-x-auto">
              {topics.map((topic) => {
                const completed = isTopicCompleted(topic.id || topic.slug);
                return (
                  <div
                    key={topic.id || topic.slug}
                    onClick={() => handleOpenTopicModal(topic)}
                    className={`bg-white rounded-2xl border p-4 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex flex-col justify-between items-center text-center space-y-3 hover:border-emerald-400 transition cursor-pointer min-h-[220px] relative ${
                      completed ? "border-emerald-300 bg-emerald-50/10" : "border-gray-150"
                    }`}
                  >
                    {completed && (
                      <span className="absolute top-2 right-2 text-emerald-600">
                        <CheckCircle className="w-4 h-4 fill-emerald-100" />
                      </span>
                    )}

                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-center">
                      {getTopicIcon(topic.icon)}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-gray-900 leading-snug">{topic.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed line-clamp-2">
                        {topic.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      {topic.lessonsCount || 10} lessons
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP QUESTIONS & DISCUSSIONS */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.015)] space-y-5">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Top Questions & Discussions</h3>
                <p className="text-[11px] text-gray-400 font-medium">Join the community discussion and get answers from experts.</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                {(["Recent", "Trending", "Unanswered", "My Activity"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === tab ? "bg-white text-emerald-700 shadow-sm font-black" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3.5">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-gray-150 hover:border-emerald-200 transition space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {q.topic}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">
                          {q.difficultyTag}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-gray-900 leading-snug">{q.title}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
                        {q.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-black">
                        {q.author.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-700">{q.author}</span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                      <button
                        onClick={() => handleLikeQuestion(q.id)}
                        className="flex items-center gap-1 hover:text-emerald-600 transition cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{q.likes}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{q.replies}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="py-8 text-center text-gray-400 font-semibold text-xs space-y-2">
                  <p>No questions found in this tab.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-emerald-600 font-extrabold hover:underline"
                  >
                    Be the first to ask a question!
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: LEARNING PROGRESS, CERTIFICATES & HIGHLIGHTS (1 Col) */}
        <div className="space-y-6">
          
          {/* LEARNING PROGRESS CARD */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.015)] space-y-4">
            <h3 className="text-xs font-black text-gray-900">Learning Progress</h3>

            {/* Overall Progress Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500">Overall Completion</span>
                <span className="text-emerald-700 font-black">{progress.progressPercentage}%</span>
              </div>
              <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                <span className="text-xs font-black text-gray-900 block">{progress.topicsCompleted}</span>
                <span className="text-[9px] text-gray-400 font-bold block leading-tight">Topics</span>
              </div>
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                <span className="text-xs font-black text-gray-900 block">{progress.lessonsCompleted}</span>
                <span className="text-[9px] text-gray-400 font-bold block leading-tight">Lessons</span>
              </div>
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                <span className="text-xs font-black text-gray-900 block">{progress.certificatesEarned}</span>
                <span className="text-[9px] text-gray-400 font-bold block leading-tight">Certs</span>
              </div>
            </div>
          </div>

          {/* CERTIFICATES & ACHIEVEMENTS */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.015)] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-gray-900">Certificates Earned</h3>
              <span className="text-[10px] font-bold text-emerald-600">View All</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight">Sustainability Specialist</h4>
                  <span className="text-[9px] text-gray-400 font-medium">Issued on CarbonAware • 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* COMMUNITY HIGHLIGHTS */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.015)] space-y-4">
            <h3 className="text-xs font-black text-gray-900">Community Leaderboard</h3>

            <div className="space-y-3">
              {highlights.map((h, idx) => (
                <div key={h.id || idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-gray-400 w-4 text-center">#{h.rank}</span>
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-[10px]">
                      {h.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-700 uppercase block">{h.badge}</span>
                      <span className="text-gray-900 font-extrabold block leading-tight">{h.name}</span>
                      <span className="text-[9px] text-gray-400 font-medium">{h.subTitle}</span>
                    </div>
                  </div>
                  <span className="text-gray-900 font-black text-[11px]">{h.points} pts</span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/challenges"
              className="w-full text-center text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 pt-2 block cursor-pointer"
            >
              View Leaderboard →
            </Link>
          </div>

        </div>

      </div>

      {/* ================= TOPIC DETAILS MODAL ================= */}
      {selectedTopicModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 relative animate-fadeIn space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={handleCloseTopicModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-gray-100 pb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                {getTopicIcon(selectedTopicModal.icon)}
              </div>
              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    {selectedTopicModal.category || "Topic"}
                  </span>
                  {isTopicCompleted(selectedTopicModal.id || selectedTopicModal.slug) && (
                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-gray-900">{selectedTopicModal.title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {selectedTopicModal.description}
                </p>
              </div>
            </div>

            {/* Lessons Content / Accordion */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-gray-900">Topic Lessons</h4>
                <span className="text-[10px] text-gray-400 font-bold">
                  {topicLessons.length} Total Lessons
                </span>
              </div>

              {loadingLessons ? (
                <div className="py-8 text-center text-xs text-gray-400 font-bold">
                  Loading topic lessons...
                </div>
              ) : (
                <div className="space-y-3">
                  {topicLessons.map((lesson, idx) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isActive = activeLessonIndex === idx;

                    return (
                      <div
                        key={lesson.id || idx}
                        className={`rounded-2xl border transition overflow-hidden ${
                          isActive
                            ? "border-emerald-400 bg-emerald-50/20"
                            : isCompleted
                            ? "border-emerald-200 bg-white"
                            : "border-gray-150 bg-white"
                        }`}
                      >
                        <div
                          onClick={() => setActiveLessonIndex(isActive ? null : idx)}
                          className="p-3.5 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="text-xs font-extrabold text-gray-900">{lesson.title}</h5>
                              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {lesson.duration || "5 min"} • +20 Eco Points
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Done
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400">
                                {isActive ? "Hide Details" : "View Lesson"}
                              </span>
                            )}
                          </div>
                        </div>

                        {isActive && (
                          <div className="p-4 border-t border-emerald-100 bg-white space-y-3 text-xs font-medium text-gray-700 leading-relaxed">
                            <p>{lesson.content}</p>

                            <div className="flex justify-end pt-2">
                              {!isCompleted ? (
                                <button
                                  onClick={() => handleCompleteLesson(lesson)}
                                  disabled={completingLessonId === lesson.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                                >
                                  {completingLessonId === lesson.id ? "Saving..." : "Mark Lesson as Complete (+20 Pts)"}
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" /> Lesson Completed & Points Saved!
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <button
                onClick={handleCloseTopicModal}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Close Window
              </button>

              <button
                onClick={async () => {
                  await handleCompleteTopic();
                  handleCloseTopicModal();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Topic & Claim Certificate (+50 Pts)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= ASK QUESTION MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-gray-900">Ask a Question</h3>

            <form onSubmit={handleAskQuestionSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How do I calculate my daily carbon footprint?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Topic</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option>Climate Change 101</option>
                  <option>Carbon Footprint</option>
                  <option>Carbon Footprint Calculations</option>
                  <option>Solutions & Actions</option>
                  <option>Sustainability 101</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Category Tag</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option>Question</option>
                  <option>Discussion</option>
                  <option>Tips</option>
                  <option>Beginner</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your question or discussion topic in detail..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Post Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
