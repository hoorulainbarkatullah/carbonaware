"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  ThumbsUp,
  X,
  CheckCircle,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Clock,
  Filter,
  Pencil,
  Trash2
} from "lucide-react";

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Recent" | "Trending" | "Unanswered" | "My Activity">("Recent");

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Question Comments Modal State
  const [selectedQuestionModal, setSelectedQuestionModal] = useState<any | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

  const fetchQuestions = async (tab = activeTab, search = searchTerm) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleTabChange = (tab: "Recent" | "Trending" | "Unanswered" | "My Activity") => {
    setActiveTab(tab);
    fetchQuestions(tab, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchQuestions(activeTab, val);
  };

  // 1-Time Toggle Like Handler
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

  // Open Comments Modal
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

  // Submit Comment
  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionModal || !newCommentContent.trim()) return;

    try {
      setIsSubmittingComment(true);
      const uid = getUserId();
      const userName =
        typeof window !== "undefined" && localStorage.getItem("user")
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
      const userName =
        typeof window !== "undefined" && localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")!).name
          : "Eco Warrior";

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          topic: newTopic,
          difficultyTag: newTag,
          author: userName,
          userId: uid,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewTitle("");
        setNewDescription("");
        setIsModalOpen(false);
        fetchQuestions(activeTab, searchTerm);
      }
    } catch (err) {
      console.error("Ask question error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-[#f2fcf5] border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
            Peshawar Community Portal
          </span>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            Community Questions & Environmental Feeds
          </h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Browse all user questions, discuss sustainable actions, give 1-time likes, and join clean air conversations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer text-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Community Question</span>
        </button>
      </div>

      {/* CONTROLS (SEARCH & TABS) */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.015)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-grow w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search all community questions & discussions..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl text-xs font-bold w-full sm:w-auto justify-center sm:justify-start">
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

        {/* QUESTIONS GRID / LIST */}
        <div className="space-y-3.5 pt-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl border border-gray-150 hover:border-emerald-300 transition space-y-3 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.01)] relative group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-grow pr-16">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      {q.topic}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      {q.difficultyTag}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 leading-snug">{q.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {q.description}
                  </p>
                </div>

                {/* Owner Actions (Edit / Delete) */}
                {(() => {
                  const uid = getUserId();
                  const isOwner = q.userId === uid || (uid && q.userId && q.userId.toString() === uid.toString());
                  if (!isOwner) return null;
                  return (
                    <div className="flex items-center gap-1.5 absolute right-5 top-5">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Edit Question"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(q)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Actions & Author */}
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                    {q.author.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{q.author}</span>
                </div>

                <div className="flex items-center gap-4">
                  {(() => {
                    const uid = getUserId();
                    const isLikedByMe = Array.isArray(q.likedBy) && q.likedBy.includes(uid);
                    return (
                      <button
                        onClick={() => handleLikeQuestion(q.id)}
                        className={`flex items-center gap-1.5 transition cursor-pointer px-3 py-1.5 rounded-xl ${
                          isLikedByMe
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200 font-extrabold"
                            : "hover:text-emerald-600 hover:bg-gray-50 text-gray-500"
                        }`}
                        title={isLikedByMe ? "Click to remove like" : "Click to like"}
                      >
                        <ThumbsUp className={`w-4 h-4 ${isLikedByMe ? "fill-emerald-600 text-emerald-600" : ""}`} />
                        <span>{q.likes || 0} Likes</span>
                      </button>
                    );
                  })()}

                  <button
                    onClick={() => handleOpenQuestionComments(q)}
                    className="flex items-center gap-1.5 hover:text-emerald-600 hover:bg-emerald-50/50 px-3 py-1.5 rounded-xl transition cursor-pointer text-gray-600"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>{q.replies || 0} Comments</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && !loading && (
            <div className="py-12 text-center text-gray-400 font-semibold text-xs space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <MessageCircle className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-gray-500 font-bold text-sm">No community questions found.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-sm hover:bg-emerald-700 transition"
              >
                Ask the first Community Question!
              </button>
            </div>
          )}
        </div>
      </div>

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
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-6">
              <h3 className="text-lg font-black text-gray-900">Ask Community Question</h3>
              <p className="text-xs text-gray-500 font-medium">
                Post your question for all Peshawar community members to see and answer.
              </p>
            </div>

            <form onSubmit={handleAskQuestionSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Question Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to compost kitchen waste effectively?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Topic</label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
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
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
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
                <label className="block text-xs font-bold text-gray-700">Description & Context</label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide full details so community members can give accurate answers..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  {isSubmitting ? "Submitting..." : "Post Community Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= QUESTION COMMENTS MODAL ================= */}
      {selectedQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative animate-fadeIn space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedQuestionModal(null)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 p-2 rounded-2xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

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

            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Community Comments ({questionAnswers.length})</span>
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {questionAnswers.map((ans: any) => (
                  <div key={ans.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-150 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-emerald-700">{ans.author}</span>
                      <span className="text-gray-400 font-medium">{new Date(ans.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{ans.content}</p>
                  </div>
                ))}

                {questionAnswers.length === 0 && (
                  <p className="text-center py-4 text-xs font-bold text-gray-400">
                    No comments yet. Share your response below!
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleAddCommentSubmit} className="space-y-3 border-t border-gray-100 pt-4">
              <textarea
                required
                rows={3}
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Write your response or advice..."
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
