"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  Search,
  Compass,
  Mountain,
  Waves,
  Sparkles,
  Flame,
  Calendar,
  X,
  RefreshCw,
  MapPin,
  ArrowLeft,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";

interface BucketItemType {
  _id: string;
  title: string;
  emoji: string;
  category: string;
  subcategory?: string;
  isCompleted: boolean;
  completedAt?: string | null;
  notes?: string;
  proofImage?: string;
  location?: string;
  targetYear?: string;
  order: number;
}

interface StatsType {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
  categoryStats: Record<
    string,
    {
      total: number;
      completed: number;
      percentage: number;
      subcategories: Record<
        string,
        { total: number; completed: number; percentage: number }
      >;
    }
  >;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Dream Trips & Bucket Destinations": "🌏",
  "Trekking & Expeditions": "🥾",
  "One-Time Extreme Thrill Activities": "🎢",
  "Adventure & Thrill Experiences": "🌄",
  "Mountains & Wilderness": "🏔️",
  "Beaches, Oceans & Water Adventures": "🌊",
  "Unique Stays & Nature Immersions": "🌳",
  "Spontaneous & Free-Spirit Adventures": "🚗",
  "Creative & Expressive Experiences": "🎨",
  "Memory Collection & Personal Milestones": "📖",
};

const CATEGORIES_LIST = [
  "All",
  "Dream Trips & Bucket Destinations",
  "Trekking & Expeditions",
  "One-Time Extreme Thrill Activities",
  "Mountains & Wilderness",
  "Beaches, Oceans & Water Adventures",
  "Unique Stays & Nature Immersions",
  "Spontaneous & Free-Spirit Adventures",
  "Creative & Expressive Experiences",
  "Memory Collection & Personal Milestones",
];

export default function AdminPage() {
  const [items, setItems] = useState<BucketItemType[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Login form state
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Add / Edit Goal Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItemType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    emoji: "✨",
    category: "Adventure & Thrill Experiences",
    subcategory: "Mountains & Wilderness",
    notes: "",
    location: "",
    targetYear: "",
  });

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"],
    });
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      setIsAdmin(!!data.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bucket-list");
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error("Failed to load bucket list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid passcode");
      }
      setIsAdmin(true);
      setAdminPassword("");
      showToast("Welcome back, Sai Stark! Admin Mode active 👑");
    } catch (err: any) {
      setLoginError(err.message || "Invalid password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAdmin(false);
      showToast("Logged out of Admin Mode");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleToggle = async (item: BucketItemType) => {
    setActionLoadingId(item._id);
    const newStatus = !item.isCompleted;

    try {
      const res = await fetch(`/api/bucket-list/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus) {
          triggerCelebration();
          showToast(`Completed! 🎉 ${item.title}`);
        } else {
          showToast(`Marked Pending: ${item.title}`);
        }
        await fetchData();
      }
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      emoji: "✨",
      category: "Adventure & Thrill Experiences",
      subcategory: "Mountains & Wilderness",
      notes: "",
      location: "",
      targetYear: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (item: BucketItemType) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      emoji: item.emoji || "✨",
      category: item.category,
      subcategory: item.subcategory || "",
      notes: item.notes || "",
      location: item.location || "",
      targetYear: item.targetYear || "",
    });
    setShowAddModal(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingItem) {
        const res = await fetch(`/api/bucket-list/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Goal updated! ✍️");
          setShowAddModal(false);
          await fetchData();
        }
      } else {
        const res = await fetch("/api/bucket-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showToast("New goal added! 🌟");
          setShowAddModal(false);
          await fetchData();
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (item: BucketItemType) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const res = await fetch(`/api/bucket-list/${item._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Goal deleted! 🗑️");
        await fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleReseed = async () => {
    if (
      !confirm(
        "Are you sure you want to reload all 78 default bucket list goals?"
      )
    )
      return;

    try {
      setIsSeeding(true);
      const res = await fetch("/api/bucket-list/seed", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Reloaded 78 default goals! 🚀");
        await fetchData();
      }
    } catch (err) {
      console.error("Reseed error:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== "All") {
        const matchesCat =
          item.category === selectedCategory ||
          item.subcategory === selectedCategory;
        if (!matchesCat) return false;
      }
      if (statusFilter === "completed" && !item.isCompleted) return false;
      if (statusFilter === "pending" && item.isCompleted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.subcategory && item.subcategory.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, selectedCategory, statusFilter, searchQuery]);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: BucketItemType[] } = {};
    filteredItems.forEach((item) => {
      const groupKey = item.subcategory
        ? `${item.category} • ${item.subcategory}`
        : item.category;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  const trekStats = useMemo(() => {
    const treks = items.filter(
      (i) =>
        i.category === "Trekking & Expeditions" ||
        i.subcategory === "Mountains & Wilderness"
    );
    const completedTreks = treks.filter((i) => i.isCompleted).length;
    return {
      total: treks.length,
      completed: completedTreks,
      percentage:
        treks.length > 0
          ? Number(((completedTreks / treks.length) * 100).toFixed(1))
          : 0,
    };
  }, [items]);

  // If not logged in as Admin, show login screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0e1424] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 relative">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Portfolio
            </Link>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Sai Stark Admin</h2>
            <p className="text-xs text-slate-400">
              Enter admin passcode to manage your bucket list, update goal statuses, add new milestones, or delete items.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Passcode
              </label>
              <input
                type="password"
                placeholder="Enter admin passcode (e.g. admin123 or saistark2025)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
                autoFocus
                required
              />
              {loginError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">
                  {loginError}
                </p>
              )}
            </div>

            <div className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
              💡 Hint: Default passcode is <code className="text-emerald-400">admin123</code> or <code className="text-emerald-400">saistark2025</code>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {isLoggingIn ? "Logging in..." : "Enter Admin Dashboard 👑"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard Mode
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-semibold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090d18]/90 backdrop-blur-xl border-b border-amber-500/20 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="View Public Portfolio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
              <span>Admin Dashboard</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                👑 Sai Stark
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Manage goals, toggle completions, view detailed % analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">View Public Page</span>
          </Link>

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <Unlock className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Admin Dashboard Stats Hero */}
        <section className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-b from-[#131b2e] to-[#0c1220] backdrop-blur-2xl shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Stats Left */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                👑 Admin Control Center
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Bucket List <span className="gradient-text-emerald">Progress & CRUD</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Click any goal checkmark to instantly mark it completed (with celebration effect), or use the edit/delete actions to keep your bucket list completely up to date.
              </p>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" /> Add New Milestone
                </button>

                <button
                  onClick={handleReseed}
                  disabled={isSeeding}
                  className="px-3.5 py-2 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-xl text-sm border border-white/10 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSeeding ? "animate-spin" : ""}`} />
                  <span>Reload 78 Defaults</span>
                </button>
              </div>
            </div>

            {/* Stats Gauge Right */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="relative flex items-center justify-center">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="url(#adminProgressGradient)"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      72 *
                      (1 - (stats?.percentage ? stats.percentage / 100 : 0))
                    }
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient
                      id="adminProgressGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-white">
                    {stats ? `${stats.percentage}%` : "0%"}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-semibold">
                    Completed
                  </span>
                </div>
              </div>

              <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/10">
                <div className="p-2 rounded-xl bg-white/5">
                  <p className="text-[11px] text-slate-400">Total Goals</p>
                  <p className="text-base font-bold text-white">{stats?.total || 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[11px] text-emerald-400">Completed</p>
                  <p className="text-base font-bold text-emerald-300">
                    {stats?.completed || 0}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-[11px] text-cyan-400">Remaining</p>
                  <p className="text-base font-bold text-cyan-300">
                    {stats?.pending || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Milestone Cards Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0f1626] border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5" /> High Altitude & Treks
              </span>
              <h3 className="text-xl font-bold text-white">
                {trekStats.completed} / {trekStats.total} Done
              </h3>
              <p className="text-xs text-slate-400">
                12k ft · 15k ft · 17.5k ft · 20k ft · 14 Peaks
              </p>
            </div>
            <span className="text-2xl font-extrabold text-amber-400">
              {trekStats.percentage}%
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f1626] border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Extreme Thrills
              </span>
              <h3 className="text-xl font-bold text-white">
                {stats?.categoryStats?.["One-Time Extreme Thrill Activities"]?.completed || 0} /{" "}
                {stats?.categoryStats?.["One-Time Extreme Thrill Activities"]?.total || 11} Done
              </h3>
              <p className="text-xs text-slate-400">Skydiving, Paragliding, Bungee</p>
            </div>
            <span className="text-2xl font-extrabold text-rose-400">
              {stats?.categoryStats?.["One-Time Extreme Thrill Activities"]?.percentage || 0}%
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f1626] border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5" /> Water & Wilderness
              </span>
              <h3 className="text-xl font-bold text-white">
                {stats?.categoryStats?.["Adventure & Thrill Experiences"]?.completed || 0} /{" "}
                {stats?.categoryStats?.["Adventure & Thrill Experiences"]?.total || 46} Done
              </h3>
              <p className="text-xs text-slate-400">Beaches, Glaciers, Stays</p>
            </div>
            <span className="text-2xl font-extrabold text-cyan-400">
              {stats?.categoryStats?.["Adventure & Thrill Experiences"]?.percentage || 0}%
            </span>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 self-start md:self-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({stats?.total || 0})
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === "completed"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed ({stats?.completed || 0})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === "pending"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Pending ({stats?.pending || 0})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = selectedCategory === cat;
              const icon = CATEGORY_ICONS[cat] || "🌟";
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                      : "bg-[#111827] text-slate-300 hover:bg-[#1f293d] border border-white/10 hover:text-white"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Goals List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading bucket list goals...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedItems).map(([groupTitle, groupGoals]) => {
              const completedInGroup = groupGoals.filter(
                (g) => g.isCompleted
              ).length;
              const groupPercentage = Math.round(
                (completedInGroup / groupGoals.length) * 100
              );

              return (
                <div key={groupTitle} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {groupTitle}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                        {completedInGroup} / {groupGoals.length} Done
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:w-48">
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${groupPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 w-10 text-right">
                        {groupPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {groupGoals.map((item) => {
                      const isComplete = item.isCompleted;
                      const isLoadingThis = actionLoadingId === item._id;

                      return (
                        <div
                          key={item._id}
                          className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between group ${
                            isComplete
                              ? "glass-card-completed shadow-lg shadow-emerald-950/20"
                              : "glass-card glass-card-hover"
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggle(item)}
                                disabled={isLoadingThis}
                                className="mt-0.5 flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                                title={
                                  isComplete
                                    ? "Click to mark as pending"
                                    : "Click to mark as complete! 🎉"
                                }
                              >
                                {isComplete ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="w-6 h-6 text-slate-500 hover:text-slate-400" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm sm:text-base font-semibold leading-snug break-words ${
                                    isComplete
                                      ? "text-emerald-200 line-through/70"
                                      : "text-slate-100"
                                  }`}
                                >
                                  <span className="mr-1.5 text-base sm:text-lg">
                                    {item.emoji}
                                  </span>
                                  {item.title}
                                </p>

                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  {isComplete && item.completedAt && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(
                                        item.completedAt
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  )}
                                  {item.location && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                      <MapPin className="w-3 h-3" />
                                      {item.location}
                                    </span>
                                  )}
                                  {item.targetYear && !isComplete && (
                                    <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                      Target: {item.targetYear}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {item.notes && (
                              <p className="text-xs text-slate-300/80 bg-black/20 p-2 rounded-lg border border-white/5 italic">
                                &ldquo;{item.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg text-xs transition-colors"
                              title="Edit Goal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs transition-colors"
                              title="Delete Goal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? "Edit Bucket List Goal ✏️" : "Add New Goal 🌟"}
              </h3>
              <p className="text-xs text-slate-400">
                {editingItem
                  ? "Update goal details or notes"
                  : "Add another exciting milestone to your life journey"}
              </p>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-center text-lg focus:outline-none"
                    placeholder="🏔️"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                    placeholder="e.g. Scuba dive in Great Barrier Reef"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm focus:outline-none bg-[#0e1424]"
                >
                  <option value="Dream Trips & Bucket Destinations">
                    🌏 Dream Trips & Bucket Destinations
                  </option>
                  <option value="Trekking & Expeditions">
                    🥾 Trekking & Expeditions
                  </option>
                  <option value="One-Time Extreme Thrill Activities">
                    🎢 One-Time Extreme Thrill Activities
                  </option>
                  <option value="Adventure & Thrill Experiences">
                    🌄 Adventure & Thrill Experiences
                  </option>
                  <option value="Creative & Expressive Experiences">
                    🎨 Creative & Expressive Experiences
                  </option>
                  <option value="Memory Collection & Personal Milestones">
                    📖 Memory Collection & Personal Milestones
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subcategory (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                  placeholder="e.g. Mountains & Wilderness, Beaches, Unique Stays"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs focus:outline-none"
                    placeholder="e.g. Ladakh / Tokyo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Year
                  </label>
                  <input
                    type="text"
                    value={formData.targetYear}
                    onChange={(e) =>
                      setFormData({ ...formData, targetYear: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs focus:outline-none"
                    placeholder="e.g. 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notes / Details
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs focus:outline-none"
                  placeholder="Add specific details or post-trip memories..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {editingItem ? "Save Changes" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
