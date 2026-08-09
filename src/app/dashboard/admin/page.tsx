"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Trophy,
  Plus,
  Trash2,
  CheckCircle,
  Leaf,
  ShieldCheck,
  Zap,
  BarChart2,
  X,
  Sparkles
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "topics" | "challenges">("overview");

  // Logged In User State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Admin Stats State
  const [stats, setStats] = useState({
    usersCount: 0,
    calculationsCount: 0,
    topicsCount: 0,
    lessonsCount: 0,
    challengesCount: 0,
    badgesCount: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  // Management Collections State
  const [topics, setTopics] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: "", description: "", category: "Basics", icon: "climate", lessonsCount: 10 });

  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    title: "",
    description: "",
    category: "Quiz",
    rewardPoints: 100,
    estimatedTime: "5 min",
    topicsCovered: "Climate change and carbon footprint basics",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch admin stats and collections from MongoDB
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {}
      }

      const uid = stored
        ? (JSON.parse(stored).id || JSON.parse(stored).email)
        : "admin";

      const [statsRes, topicsRes, challengesRes] = await Promise.all([
        fetch(`/api/admin/stats?userId=${encodeURIComponent(uid)}`),
        fetch("/api/topics"),
        fetch(`/api/challenges?userId=${encodeURIComponent(uid)}`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          setStats(data.stats);
          const usersList = data.users || data.recentUsers || [];
          setRecentUsers(usersList);
        }
      }

      if (topicsRes.ok) {
        const data = await topicsRes.json();
        if (data.success) setTopics(data.topics || []);
      }

      if (challengesRes.ok) {
        const data = await challengesRes.json();
        if (data.success && data.data) setChallenges(data.data.challenges || []);
      }
    } catch (err) {
      console.error("Fetch admin data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Create Topic Submission
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.title || !topicForm.description) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topicForm),
      });

      if (res.ok) {
        setTopicForm({ title: "", description: "", category: "Basics", icon: "climate", lessonsCount: 10 });
        setIsTopicModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Create topic error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Challenge Submission
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeForm.title || !challengeForm.description) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "admin",
          action: "create",
          ...challengeForm,
        }),
      });

      if (res.ok) {
        setChallengeForm({
          title: "",
          description: "",
          category: "Quiz",
          rewardPoints: 100,
          estimatedTime: "5 min",
          topicsCovered: "Climate change and carbon footprint basics",
        });
        setIsChallengeModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Create challenge error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle User Status Change (Approve / Suspend)
  const handleUserStatusChange = async (targetUserId: string, action: "approve" | "suspend") => {
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Change user status error:", err);
    }
  };

  // Handle User Role Change (User <-> Manager)
  const handleUserRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action: "changeRole", newRole }),
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Change user role error:", err);
    }
  };

  return (
    <div className="flex flex-col space-y-6">

      {/* ADMIN CONTROL PANEL HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            ADMINISTRATOR CONTROL PANEL
          </span>
          <h2 className="text-xl font-black text-gray-900 leading-tight mt-1">
            CarbonAware Content & System Management
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl text-xs font-bold">
          {(["overview", "users", "topics", "challenges"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer capitalize ${
                activeTab === tab ? "bg-white text-emerald-700 shadow-sm font-black" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Users</span>
            <h3 className="text-xl font-black text-gray-900 leading-none">{stats.usersCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Calculations</span>
            <h3 className="text-xl font-black text-gray-900 leading-none">{stats.calculationsCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Topics</span>
            <h3 className="text-xl font-black text-gray-900 leading-none">{stats.topicsCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Lessons</span>
            <h3 className="text-xl font-black text-gray-900 leading-none">{stats.lessonsCount || 15}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Challenges</span>
            <h3 className="text-xl font-black text-gray-900 leading-none">{stats.challengesCount}</h3>
          </div>
        </div>
      </div>

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-gray-900">All Registered Users ({recentUsers.length})</h3>
            <span className="text-[10px] font-bold text-gray-400">Fetched live from MongoDB</span>
          </div>

          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl border border-gray-150 flex items-center justify-between bg-white text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                    {(u.name || "User").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">{u.name || "Registered User"}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{u.email} • {u.location || "Peshawar, KP"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-black">{u.points || 0} pts</span>
                  
                  {/* Role Selector Dropdown (Admin only can change) */}
                  {currentUser?.role === "manager" ? (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100 uppercase">
                      {u.role || "USER"}
                    </span>
                  ) : (
                    <select
                      value={u.role || "user"}
                      onChange={(e) => handleUserRoleChange(u.id || u.email, e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded-lg outline-none cursor-pointer hover:bg-gray-100 transition"
                    >
                      <option value="user">USER</option>
                      <option value="manager">MANAGER</option>
                    </select>
                  )}

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    u.status === "suspended" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    {(u.status || "approved").toUpperCase()}
                  </span>

                  {/* Approve / Suspend Buttons (Admin only) */}
                  {currentUser?.role !== "manager" && (
                    <div className="flex items-center gap-1 pl-2 border-l border-gray-150">
                      {u.status === "suspended" ? (
                        <button
                          onClick={() => handleUserStatusChange(u.id || u.email, "approve")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserStatusChange(u.id || u.email, "suspend")}
                          className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-3 py-1 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {recentUsers.length === 0 && (
              <div className="py-8 text-center text-gray-400 font-semibold text-xs">
                No users found in MongoDB. Register new accounts via /signup.
              </div>
            )}
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900">Recent Users (MongoDB)</h3>
            <div className="space-y-2 text-xs font-semibold">
              {recentUsers.map((u) => (
                <div key={u.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900">{u.name}</span>
                      <span className="text-[10px] text-gray-400">{u.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {u.role || "User"} • {u.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900">Quick Content Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsTopicModalOpen(true)}
                className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 font-extrabold flex flex-col items-center justify-center space-y-2 text-xs transition cursor-pointer"
              >
                <Plus className="w-6 h-6 text-emerald-600" />
                <span>Add Learning Topic</span>
              </button>

              <button
                onClick={() => setIsChallengeModalOpen(true)}
                className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 text-amber-900 font-extrabold flex flex-col items-center justify-center space-y-2 text-xs transition cursor-pointer"
              >
                <Trophy className="w-6 h-6 text-amber-600" />
                <span>Add Challenge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOPICS TAB */}
      {activeTab === "topics" && (
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-gray-900">Manage Learning Topics</h3>
            <button
              onClick={() => setIsTopicModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>

          <div className="space-y-3">
            {topics.map((t) => (
              <div key={t.id || t.slug} className="p-4 rounded-xl border border-gray-150 flex items-center justify-between bg-white">
                <div>
                  <h4 className="text-xs font-black text-gray-900">{t.title}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">{t.description}</p>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {t.lessonsCount || 10} Lessons
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {activeTab === "challenges" && (
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-gray-900">Manage Sustainability Challenges</h3>
            <button
              onClick={() => setIsChallengeModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Challenge
            </button>
          </div>

          <div className="space-y-3">
            {challenges.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-gray-150 flex items-center justify-between bg-white">
                <div>
                  <h4 className="text-xs font-black text-gray-900">{c.title}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">{c.description}</p>
                </div>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  +{c.rewardPoints || 100} Points
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD TOPIC MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 relative space-y-4">
            <button onClick={() => setIsTopicModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-gray-900">Add New Learning Topic</h3>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  placeholder="e.g. Energy Conservation 101"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={topicForm.category}
                  onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="Brief description of the learning topic..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsTopicModalOpen(false)} className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-extrabold">
                  {isSubmitting ? "Creating..." : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CHALLENGE MODAL */}
      {isChallengeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 relative space-y-4">
            <button onClick={() => setIsChallengeModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-gray-900">Add New Sustainability Challenge</h3>

            <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={challengeForm.title}
                  onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                  placeholder="e.g. Zero Plastic Week"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Reward Points</label>
                <input
                  type="number"
                  required
                  value={challengeForm.rewardPoints}
                  onChange={(e) => setChallengeForm({ ...challengeForm, rewardPoints: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                  placeholder="Describe the challenge goals and requirements..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsChallengeModalOpen(false)} className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-extrabold">
                  {isSubmitting ? "Creating..." : "Create Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
