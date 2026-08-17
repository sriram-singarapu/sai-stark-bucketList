"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Upload,
  Image as ImageIcon,
  Sun,
  Moon,
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
  const [gallery, setGallery] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Gallery Upload
  const [isUploading, setIsUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
    setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"],
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
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

      // Load gallery
      const gRes = await fetch("/api/gallery");
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.gallery) setGallery(gData.gallery);
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
        throw new Error(data.error || "Authentication failed");
      }
      setIsAdmin(true);
      setAdminPassword("");
      showToast("Admin session unlocked");
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
      showToast("Logged out successfully");
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
          showToast(`Completed: ${item.title}`);
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

  // Upload Photo to Cloudinary
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (data.gallery) {
        setGallery(data.gallery);
        showToast("Photo uploaded to Cloudinary successfully! 📸");
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload to Cloudinary");
    } finally {
      setIsUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imgUrl: string) => {
    if (!confirm("Delete this photo from gallery?")) return;
    try {
      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imgUrl }),
      });
      const data = await res.json();
      if (data.gallery) {
        setGallery(data.gallery);
        showToast("Photo deleted");
      }
    } catch (err) {
      console.error("Delete error:", err);
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
          showToast("Goal updated");
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
          showToast("New goal added");
          setShowAddModal(false);
          await fetchData();
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (item: BucketItemType) => {
    if (!confirm(`Delete "${item.title}"?`)) return;

    try {
      const res = await fetch(`/api/bucket-list/${item._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Goal deleted");
        await fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleReseed = async () => {
    if (!confirm("Reset and reload all 78 default bucket list goals?")) return;

    try {
      setIsSeeding(true);
      const res = await fetch("/api/bucket-list/seed", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Reloaded 78 default goals");
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

  // Login view
  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? "bg-[#06080e] text-slate-100" : "bg-slate-100 text-slate-900"}`}>
        <div className={`w-full max-w-sm rounded-2xl p-7 shadow-2xl space-y-6 relative border ${isDark ? "bg-[#0c101c] border-white/10" : "bg-white border-slate-200"}`}>
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 text-xs transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          <div className="text-center space-y-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-inner border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"}`}>
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Admin Portal</h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Enter admin password to manage goals and upload gallery photos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-amber-500/50"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                }`}
                autoFocus
                required
              />
              {loginError && (
                <p className="text-xs text-rose-500 mt-2 font-medium">
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              {isLoggingIn ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard Mode
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? "bg-[#06080e] text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}>
      {/* Hidden Gallery Input */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleGalleryUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 border border-emerald-400">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 lg:px-8 py-3 flex items-center justify-between ${isDark ? "bg-[#090d16]/90 border-white/10" : "bg-white/90 border-slate-200 shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`p-2 rounded-lg transition-colors ${isDark ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
            title="View Public View"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-semibold text-base tracking-tight flex items-center gap-2">
              <span>Admin Management</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                Active Session
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all ${
              isDark ? "bg-white/5 text-amber-400 border-white/10" : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
              isDark ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">View Public</span>
          </Link>

          <button
            onClick={() => galleryInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>

          <button
            onClick={handleLogout}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
              isDark ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            <Unlock className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Gallery Cloudinary Manager Section */}
        <section className={`rounded-2xl p-5 border ${isDark ? "bg-[#0c101c] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="space-y-1">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Gallery Photos (Cloudinary)</span>
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Upload images directly to Cloudinary storage. Delete anytime.
              </p>
            </div>

            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-4">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden group border border-white/10"
              >
                <img
                  src={img}
                  alt={`Gallery ${i}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDeleteImage(img)}
                  className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete from gallery"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Admin Dashboard Stats Hero */}
        <section className={`rounded-2xl p-6 border ${isDark ? "bg-[#0c101c] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            {/* Stats Left */}
            <div className="lg:col-span-7 space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">
                Bucket List Control Center
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Click any item checkmark to toggle completion status. Add, edit, or delete milestones anytime.
              </p>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  onClick={openAddModal}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Goal
                </button>

                <button
                  onClick={handleReseed}
                  disabled={isSeeding}
                  className={`px-3 py-2 rounded-xl text-xs border transition-colors inline-flex items-center gap-1.5 ${
                    isDark
                      ? "bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border-white/10"
                      : "bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                  <span>Reload 78 Defaults</span>
                </button>
              </div>
            </div>

            {/* Stats Gauge Right */}
            <div className={`lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"}`}>
              <div className="relative flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className={isDark ? "text-slate-800" : "text-slate-200"}
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      58 *
                      (1 - (stats?.percentage ? stats.percentage / 100 : 0))
                    }
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold">
                    {stats ? `${stats.percentage}%` : "0%"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold">
                    Completed
                  </span>
                </div>
              </div>

              <div className={`w-full mt-3 grid grid-cols-3 gap-2 text-center pt-3 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
                <div className={`p-1.5 rounded-lg ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>
                  <p className="text-[10px] text-slate-500">Total</p>
                  <p className="text-sm font-bold">{stats?.total || 0}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-500">Done</p>
                  <p className="text-sm font-bold text-emerald-500">
                    {stats?.completed || 0}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-[10px] text-cyan-500">Pending</p>
                  <p className="text-sm font-bold text-cyan-500">
                    {stats?.pending || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-white/20"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-800"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className={`flex items-center p-1 rounded-xl border self-start sm:self-auto ${isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"}`}>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? isDark ? "bg-slate-700 text-white" : "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({stats?.total || 0})
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === "completed"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done ({stats?.completed || 0})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  statusFilter === "pending"
                    ? "bg-cyan-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Pending ({stats?.pending || 0})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = selectedCategory === cat;
              const icon = CATEGORY_ICONS[cat] || "🌟";
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? isDark ? "bg-white text-slate-950 font-bold" : "bg-slate-900 text-white font-bold"
                      : isDark ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5" : "bg-slate-100 text-slate-600 border border-slate-200"
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
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Loading goals...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([groupTitle, groupGoals]) => {
              const completedInGroup = groupGoals.filter(
                (g) => g.isCompleted
              ).length;
              const groupPercentage = Math.round(
                (completedInGroup / groupGoals.length) * 100
              );

              return (
                <div key={groupTitle} className="space-y-3">
                  <div className={`flex items-center justify-between pb-2 border-b ${isDark ? "border-white/5" : "border-slate-200"}`}>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm sm:text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {groupTitle}
                      </h3>
                      <span className={`text-[11px] px-2 py-0.5 rounded ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                        {completedInGroup}/{groupGoals.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-32">
                      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${groupPercentage}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-500">
                        {groupPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {groupGoals.map((item) => {
                      const isComplete = item.isCompleted;
                      const isLoadingThis = actionLoadingId === item._id;

                      return (
                        <div
                          key={item._id}
                          className={`rounded-xl p-3.5 transition-all flex flex-col justify-between border ${
                            isComplete
                              ? isDark
                                ? "bg-emerald-950/20 border-emerald-500/30"
                                : "bg-emerald-50/60 border-emerald-300"
                              : isDark
                                ? "bg-[#0c101c] border-white/5 hover:border-white/15"
                                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start gap-2.5">
                              <button
                                onClick={() => handleToggle(item)}
                                disabled={isLoadingThis}
                                className="mt-0.5 flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                                title={isComplete ? "Mark as pending" : "Mark as completed"}
                              >
                                {isComplete ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                                ) : (
                                  <Circle className={`w-5 h-5 ${isDark ? "text-slate-600 hover:text-slate-400" : "text-slate-300 hover:text-slate-500"}`} />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs sm:text-sm font-medium leading-snug break-words ${
                                    isComplete
                                      ? "text-emerald-600 dark:text-emerald-200 line-through/60"
                                      : isDark ? "text-slate-200" : "text-slate-900"
                                  }`}
                                >
                                  <span className="mr-1">{item.emoji}</span>
                                  {item.title}
                                </p>

                                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                  {isComplete && item.completedAt && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                      <Calendar className="w-2.5 h-2.5" />
                                      {new Date(item.completedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  )}
                                  {item.location && (
                                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${isDark ? "text-slate-400 bg-white/5" : "text-slate-500 bg-slate-100"}`}>
                                      <MapPin className="w-2.5 h-2.5" />
                                      {item.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {item.notes && (
                              <p className={`text-[11px] p-1.5 rounded border italic ${isDark ? "text-slate-400 bg-black/30 border-white/5" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                                &ldquo;{item.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className={`mt-2.5 pt-2 border-t flex items-center justify-end gap-1 ${isDark ? "border-white/5" : "border-slate-100"}`}>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1 text-slate-400 hover:text-cyan-500 rounded transition-colors"
                              title="Edit Goal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
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
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto border ${isDark ? "bg-[#0c101c] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold">
                {editingItem ? "Edit Milestone" : "Add New Milestone"}
              </h3>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.value })
                    }
                    className={`w-full px-2 py-2 rounded-xl text-center text-base focus:outline-none border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-300"}`}
                    placeholder="🏔️"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-300"}`}
                    placeholder="e.g. Scuba dive in Great Barrier Reef"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-300"}`}
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
                <label className="block text-[11px] text-slate-400 mb-1">
                  Subcategory (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-300"}`}
                  placeholder="e.g. Mountains & Wilderness, Beaches, Unique Stays"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-300"}`}
                    placeholder="e.g. Ladakh"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Target Year
                  </label>
                  <input
                    type="text"
                    value={formData.targetYear}
                    onChange={(e) =>
                      setFormData({ ...formData, targetYear: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-300"}`}
                    placeholder="e.g. 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-300"}`}
                  placeholder="Notes or memories..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-colors ${isDark ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow transition-all"
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
