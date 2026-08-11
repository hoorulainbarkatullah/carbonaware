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
  Sparkles,
  Pencil,
  Trash2
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

  // Edit Question Modal State
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTopic, setEditTopic] = useState("Climate Change 101");
  const [editTag, setEditTag] = useState("Question");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Confirmation Modal State (Yes / No Alert)
  const [deletingQuestion, setDeletingQuestion] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // All Topics Modal / Separate View State
  const [isAllTopicsModalOpen, setIsAllTopicsModalOpen] = useState(false);

  // Topic Details Modal State (Open Topic separately with lessons & close button)
  const [selectedTopicModal, setSelectedTopicModal] = useState<any | null>(null);
  const [topicLessons, setTopicLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);

  // Question Comments Modal State
  const [selectedQuestionModal, setSelectedQuestionModal] = useState<any | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

  // Handle Question 1-Time Toggle Like
  const handleLikeQuestion = async (id: string) => {
    try {
      const uid = getUserId();
      const res = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_like", userId: uid }),
      });
      if (res.ok) {
        fetchQuestions(activeTab, searchTerm);
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Open Question Comments Modal
  const handleOpenQuestionComments = async (question: any) => {
    setSelectedQuestionModal(question);
    setQuestionAnswers([]);
    try {
      const res = await fetch(`/api/questions/${question.id}`);
      const data = await res.json();
      if (data.success) {
        setQuestionAnswers(data.answers || []);
      }
    } catch (err) {
      console.error("Fetch answers error:", err);
    }
  };

  // Submit New Comment on Question
  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionModal || !newCommentContent.trim()) return;

    try {
      setIsSubmittingComment(true);
      const uid = getUserId();
      const userName = typeof window !== "undefined" && localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!).name
        : "Eco Warrior";

      const res = await fetch(`/api/questions/${selectedQuestionModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_comment",
          userId: uid,
          author: userName,
          content: newCommentContent.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewCommentContent("");
        handleOpenQuestionComments(selectedQuestionModal);
        fetchQuestions(activeTab, searchTerm);
      }
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Open Edit Question Modal
  const handleOpenEditModal = (q: any) => {
    setEditingQuestion(q);
    setEditTitle(q.title || "");
    setEditDescription(q.description || "");
    setEditTopic(q.topic || "Climate Change 101");
    setEditTag(q.difficultyTag || "Question");
  };

  // Submit Update Question
  const handleUpdateQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editTitle.trim() || !editDescription.trim()) return;

    try {
      setIsSubmittingEdit(true);
      const uid = getUserId();

      const res = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit_question",
          requestUserId: uid,
          title: editTitle.trim(),
          description: editDescription.trim(),
          topic: editTopic,
          difficultyTag: editTag,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingQuestion(null);
        fetchQuestions(activeTab, searchTerm);
      } else {
        alert(data.error || "Failed to update question");
      }
    } catch (err) {
      console.error("Update question error:", err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (q: any) => {
    setDeletingQuestion(q);
  };

  // Perform Permanent Delete (Post + Comments + Likes)
  const handleConfirmDeleteQuestion = async () => {
    if (!deletingQuestion) return;

    try {
      setIsDeleting(true);
      const uid = getUserId();
      const res = await fetch(`/api/questions/${deletingQuestion.id}?userId=${encodeURIComponent(uid)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setDeletingQuestion(null);
        fetchQuestions(activeTab, searchTerm);
      } else {
        alert(data.error || "Failed to delete question");
      }
    } catch (err) {
      console.error("Delete question error:", err);
    } finally {
      setIsDeleting(false);
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
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Explore Topics</h3>
                <p className="text-[10px] text-gray-400 font-medium">Click any topic to open lessons & earn certificates</p>
              </div>
              
              <button
                onClick={() => setIsAllTopicsModalOpen(true)}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>Explore All Topics ({topics.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Topic Cards Grid (Showing top 4 topics cleanly) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {topics.slice(0, 4).map((topic) => {
                const completed = isTopicCompleted(topic.id || topic.slug);
                return (
                  <div
                    key={topic.id || topic.slug}
                    onClick={() => handleOpenTopicModal(topic)}
                    className={`bg-white rounded-2xl border p-4 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex flex-col justify-between items-center text-center space-y-3 hover:border-emerald-400 hover:shadow-md transition cursor-pointer min-h-[220px] relative ${
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

            {/* Questions List (Top 4 Questions) */}
            <div className="space-y-3.5">
              {questions.slice(0, 4).map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-gray-150 hover:border-emerald-200 transition space-y-3 bg-white relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-grow pr-16">
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

                    {/* Owner Actions (Edit / Delete) */}
                    {(() => {
                      const uid = getUserId();
                      const isOwner = q.userId === uid || (uid && q.userId && q.userId.toString() === uid.toString());
                      if (!isOwner) return null;
                      return (
                        <div className="flex items-center gap-1.5 absolute right-4 top-4">
                          <button
                            onClick={() => handleOpenEditModal(q)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Edit Question"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(q)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}
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
                      {(() => {
                        const uid = getUserId();
                        const isLikedByMe = Array.isArray(q.likedBy) && q.likedBy.includes(uid);
                        return (
                          <button
                            onClick={() => handleLikeQuestion(q.id)}
                            className={`flex items-center gap-1 transition cursor-pointer px-2 py-1 rounded-lg ${
                              isLikedByMe
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200 font-extrabold"
                                : "hover:text-emerald-600 hover:bg-gray-50"
                            }`}
                            title={isLikedByMe ? "Click to remove like" : "Click to like"}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLikedByMe ? "fill-emerald-600 text-emerald-600" : ""}`} />
                            <span>{q.likes || 0}</span>
                          </button>
                        );
                      })()}

                      <button
                        onClick={() => handleOpenQuestionComments(q)}
                        className="flex items-center gap-1.5 hover:text-emerald-600 hover:bg-emerald-50/50 px-2 py-1 rounded-lg transition cursor-pointer text-gray-500"
                        title="Click to view and add comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{q.replies || 0} Comments</span>
                      </button>
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

              {/* SEE MORE / COMMUNITY LINK BUTTON */}
              {questions.length > 0 && (
                <div className="pt-2 text-center border-t border-gray-100">
                  <Link
                    href="/dashboard/community"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 transition cursor-pointer"
                  >
                    <span>See All Questions in Community Portal ({questions.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
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
              {progress.certificatesEarned > 0 ? (
                <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900 leading-tight">Sustainability Specialist</h4>
                    <span className="text-[9px] text-gray-400 font-medium">Issued on CarbonAware</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center gap-3 opacity-60 grayscale">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-600 leading-tight">Sustainability Specialist</h4>
                    <span className="text-[9px] text-slate-400 font-medium">Complete all topics to earn (Locked)</span>
                  </div>
                </div>
              )}
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

      {/* ================= EDIT QUESTION MODAL ================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn space-y-4">
            <button
              onClick={() => setEditingQuestion(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-6">
              <h3 className="text-lg font-black text-gray-900">Edit Your Question</h3>
              <p className="text-xs text-gray-500 font-medium">
                Update the title, category topic, or details of your posted question.
              </p>
            </div>

            <form onSubmit={handleUpdateQuestionSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Question Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Topic</label>
                  <select
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option>Climate Change 101</option>
                    <option>Carbon Footprint Calculations</option>
                    <option>Renewable Energy</option>
                    <option>Sustainable Transportation</option>
                    <option>Waste Reduction</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Category Tag</label>
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option>Question</option>
                    <option>Discussion</option>
                    <option>Tips</option>
                    <option>Beginner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Description & Details</label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmittingEdit ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL (YES / NO ALERT) ================= */}
      {deletingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-6 relative animate-fadeIn space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">Delete Question?</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-gray-800">"{deletingQuestion.title}"</span>? This will permanently erase the question, all its comments, and likes from the database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuestion(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuestion}
                disabled={isDeleting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
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

      {/* ================= EXPLORE ALL TOPICS MODAL ================= */}
      {isAllTopicsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative animate-fadeIn space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setIsAllTopicsModalOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 p-2 rounded-2xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                ALL SUSTAINABILITY TOPICS
              </span>
              <h2 className="text-xl font-black text-gray-900 leading-tight mt-1.5">
                Explore All Learning Topics
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Select any topic to view detailed lessons, interactive quizzes, and earn certificates.
              </p>
            </div>

            {/* All Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {topics.map((topic) => {
                const completed = isTopicCompleted(topic.id || topic.slug);
                return (
                  <div
                    key={topic.id || topic.slug}
                    onClick={() => {
                      setIsAllTopicsModalOpen(false);
                      handleOpenTopicModal(topic);
                    }}
                    className={`bg-white rounded-2xl border p-4 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex flex-col justify-between items-center text-center space-y-3 hover:border-emerald-400 hover:shadow-md transition cursor-pointer min-h-[220px] relative ${
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
        </div>
      )}

      {/* ================= QUESTION COMMENTS & DISCUSSIONS MODAL ================= */}
      {selectedQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative animate-fadeIn space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedQuestionModal(null)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 p-2 rounded-2xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Question Details Header */}
            <div className="space-y-2 border-b border-gray-100 pb-4 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {selectedQuestionModal.topic}
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  By {selectedQuestionModal.author}
                </span>
              </div>
              <h3 className="text-base font-black text-gray-900 leading-snug">
                {selectedQuestionModal.title}
              </h3>
              <p className="text-xs text-gray-600 font-medium leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                {selectedQuestionModal.description}
              </p>
            </div>

            {/* Answers & Comments Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Comments ({questionAnswers.length})</span>
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {questionAnswers.map((ans: any) => (
                  <div key={ans.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-150 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-emerald-700">{ans.author}</span>
                      <span className="text-gray-400 font-medium">{new Date(ans.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{ans.content}</p>
                  </div>
                ))}

                {questionAnswers.length === 0 && (
                  <p className="text-center py-4 text-xs font-bold text-gray-400">
                    No comments yet. Share your thoughts below!
                  </p>
                )}
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddCommentSubmit} className="space-y-3 border-t border-gray-100 pt-4">
              <textarea
                required
                rows={3}
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Write your comment or answer..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
