"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Mail,
  Instagram,
  MessageCircle,
  User,
  MapPin,
  Camera,
  CheckCircle2,
  Circle,
  Search,
  Lock,
  Calendar,
  X,
  Sparkles,
  Sun,
  Moon,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

const DEFAULT_PROFILE = {
  name: "Sai Stark",
  email: "dharmasaisingarapu051@gmail.com",
  avatar: "/IMG-20250714-WA0063.jpg",
  bio: "Welcome to My Bucket List! I'm Sai Stark, an avid traveler and adventure seeker. This is my personal space to share my dreams, experiences, and the places I aspire to visit.",
  instagram: "https://www.instagram.com/sai._.stark?igsh=eTRuNWF0OGppd2w2",
  whatsapp: "https://wa.me/919391953591",
  gallery: [
    "/DSC_0032.JPG",
    "/DSC_0037.JPG",
    "/IMG-20250714-WA0064.jpg",
    "/PXL_20250216_010903628.jpg",
  ],
};

export default function PortfolioPage() {
  const [profile, setProfile] = useState<any>(DEFAULT_PROFILE);
  const [items, setItems] = useState<BucketItemType[]>([]);
  const [gallery, setGallery] = useState<string[]>(DEFAULT_PROFILE.gallery);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Light / Dark Theme State
  const [isDark, setIsDark] = useState(true);

  // Gallery Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters for public view
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
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

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        // Check admin session
        try {
          const authRes = await fetch("/api/auth/check");
          const authData = await authRes.json();
          setIsAdmin(!!authData.isAdmin);
        } catch {}

        // Load profile
        try {
          const profileRes = await fetch("/api/profile");
          if (profileRes.ok) {
            const pData = await profileRes.json();
            if (pData && pData.name) {
              setProfile((prev: any) => ({ ...prev, ...pData }));
            }
          }
        } catch {}

        // Load gallery from Cloudinary/DB
        try {
          const galleryRes = await fetch("/api/gallery");
          if (galleryRes.ok) {
            const gData = await galleryRes.json();
            if (gData.gallery && Array.isArray(gData.gallery)) {
              setGallery(gData.gallery);
            }
          }
        } catch {}

        // Load bucket list
        const res = await fetch("/api/bucket-list");
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
          setStats(data.stats || null);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // Handle Cloudinary Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin) {
      alert("Admin authorization required. Please log in via Admin portal to upload.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.gallery) {
        setGallery(data.gallery);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload image to Cloudinary");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete image from gallery
  const handleDeleteGalleryImage = async (imgUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!confirm("Remove this image from gallery?")) return;

    try {
      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imgUrl }),
      });
      const data = await res.json();
      if (data.gallery) {
        setGallery(data.gallery);
      }
    } catch (err) {
      console.error("Delete error:", err);
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
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q))
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#07090e] text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}>
      {/* Hidden File Input for Cloudinary Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Floating Controls: Theme Switcher & Admin Link */}
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-full border shadow-lg backdrop-blur-md transition-all active:scale-90 ${
            isDark
              ? "bg-white/10 hover:bg-white/20 text-amber-300 border-white/15"
              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin Link */}
        <Link
          href="/admin"
          className={`px-3.5 py-2 rounded-full border text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg ${
            isDark
              ? "bg-white/10 hover:bg-white/20 text-slate-300 border-white/15 hover:text-white"
              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900"
          }`}
          title="Admin Portal"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{isAdmin ? "Admin (Active)" : "Admin"}</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Preserved as requested) */}
      {/* ========================================================================= */}
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden px-4 ${isDark ? "bg-gradient-to-b from-[#0c1220] via-[#07090e] to-[#07090e]" : "bg-gradient-to-b from-slate-100 via-[#f8fafc] to-[#f8fafc]"}`}>
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${isDark ? "bg-emerald-500/5" : "bg-emerald-500/10"}`} />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-12">
          {/* Avatar */}
          <div className="inline-block relative">
            <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 shadow-2xl mx-auto group ${isDark ? "border-white/20" : "border-slate-300 shadow-slate-200"}`}>
              <img
                src={profile.avatar || "/IMG-20250714-WA0063.jpg"}
                alt={profile.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e: any) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop";
                }}
              />
            </div>
          </div>

          <div>
            <h1 className={`text-5xl sm:text-7xl font-light tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {profile.name}
            </h1>
            <p className={`text-lg sm:text-2xl font-light mt-3 ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
              Traveler · Dreamer · Storyteller
            </p>
          </div>

          {/* Social / Contact Buttons */}
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <a
              href={`mailto:${profile.email}`}
              className={`px-6 py-2.5 font-medium rounded-full transition-colors inline-flex items-center gap-2 text-sm shadow-md ${isDark ? "bg-white text-neutral-900 hover:bg-neutral-100" : "bg-slate-900 text-white hover:bg-slate-800"}`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>

            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-2.5 border rounded-full transition-colors inline-flex items-center gap-2 text-sm ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100"}`}
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram</span>
              </a>
            )}

            {profile.whatsapp && (
              <a
                href={profile.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-2.5 border rounded-full transition-colors inline-flex items-center gap-2 text-sm ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100"}`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Scroll Down */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a
            href="#about"
            className={`w-6 h-10 border-2 rounded-full flex items-start justify-center p-2 block ${isDark ? "border-white/30" : "border-slate-400"}`}
          >
            <div className={`w-1 h-2 rounded-full ${isDark ? "bg-white/50" : "bg-slate-600"}`} />
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT ME SECTION (Preserved as requested) */}
      {/* ========================================================================= */}
      <section id="about" className={`py-24 sm:py-32 px-4 border-t ${isDark ? "bg-[#07090e] border-white/5" : "bg-[#f8fafc] border-slate-200"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <span className={`text-xs uppercase tracking-widest mb-3 block font-medium ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
              About Me
            </span>
            <div className={`w-12 h-px mx-auto ${isDark ? "bg-white/20" : "bg-slate-300"}`} />
          </div>

          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-6">
              <p className={`text-base sm:text-lg leading-relaxed ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                {profile.bio}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className={`flex items-center gap-3 text-sm ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>{profile.name}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                  <Mail className="w-4 h-4 text-cyan-500" />
                  <span>{profile.email}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Exploring the World</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-colors ${isDark ? "border-white/10 hover:bg-white/5 text-neutral-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"}`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Follow on Instagram</span>
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    href={profile.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-colors ${isDark ? "border-white/10 hover:bg-white/5 text-neutral-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div className="relative">
              <div className={`aspect-square rounded-2xl overflow-hidden shadow-2xl border ${isDark ? "border-white/10 shadow-black/50" : "border-slate-200 shadow-slate-300"}`}>
                <img
                  src={profile.avatar || "/IMG-20250714-WA0063.jpg"}
                  alt="About"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  onError={(e: any) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <div className={`absolute -bottom-4 -right-4 w-40 h-40 rounded-2xl -z-10 ${isDark ? "bg-neutral-900" : "bg-slate-200"}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ULTRA-LUXURY BUCKET LIST SECTION */}
      {/* ========================================================================= */}
      <section id="bucket-list" className={`py-24 px-4 lg:px-8 border-t ${isDark ? "bg-[#05070b] border-white/5" : "bg-white border-slate-200"}`}>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-emerald-500 block font-semibold">
              Life Experiences
            </span>
            <div className={`w-12 h-px mx-auto mb-3 ${isDark ? "bg-emerald-500/40" : "bg-emerald-400"}`} />
            <h2 className={`text-3xl sm:text-5xl font-light tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              The Bucket List
            </h2>
            <p className={`text-sm max-w-lg mx-auto font-light ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
              78 milestone experiences across high peaks, ocean depths, and global explorations.
            </p>
          </div>

          {/* Minimalist Progress Box */}
          <div className={`rounded-2xl p-6 border backdrop-blur-md space-y-5 ${isDark ? "bg-[#0a0e18] border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Overall Progress
                </span>
                <p className={`text-xl sm:text-2xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {stats?.percentage || 0}% Completed
                </p>
              </div>

              <div className={`flex items-center gap-6 text-xs ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
                <div>
                  <span className={`block font-bold text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                    {stats?.total || 78}
                  </span>
                  <span className="text-[11px]">Total Goals</span>
                </div>
                <div className={`w-px h-8 ${isDark ? "bg-white/10" : "bg-slate-300"}`} />
                <div>
                  <span className="block font-bold text-base text-emerald-500">
                    {stats?.completed || 0}
                  </span>
                  <span className="text-[11px]">Completed</span>
                </div>
                <div className={`w-px h-8 ${isDark ? "bg-white/10" : "bg-slate-300"}`} />
                <div>
                  <span className={`block font-bold text-base ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                    {stats?.pending || 0}
                  </span>
                  <span className="text-[11px]">In Progress</span>
                </div>
              </div>
            </div>

            {/* Glowing Linear Progress Bar */}
            <div className={`w-full h-2 rounded-full overflow-hidden border ${isDark ? "bg-black/50 border-white/5" : "bg-slate-200 border-slate-300"}`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats?.percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
                <input
                  type="text"
                  placeholder="Search experiences (e.g. cherry blossom, 15,000 feet, paragliding)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#0a0e18] border-white/10 text-neutral-200 placeholder-neutral-500 focus:border-emerald-500/40"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-neutral-500 hover:text-white" : "text-slate-400 hover:text-slate-800"}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className={`flex items-center p-1 rounded-xl border self-start sm:self-auto text-xs ${isDark ? "bg-[#0a0e18] border-white/10" : "bg-slate-100 border-slate-200"}`}>
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    statusFilter === "all"
                      ? isDark ? "bg-white/10 text-white" : "bg-white text-slate-900 shadow-sm"
                      : isDark ? "text-neutral-400 hover:text-neutral-200" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All ({stats?.total || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    statusFilter === "completed"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                      : isDark ? "text-neutral-400 hover:text-neutral-200" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Done ({stats?.completed || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    statusFilter === "pending"
                      ? isDark ? "bg-white/10 text-neutral-200" : "bg-white text-slate-900 shadow-sm"
                      : isDark ? "text-neutral-400 hover:text-neutral-200" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Circle className="w-3.5 h-3.5 text-neutral-400" />
                  Pending ({stats?.pending || 0})
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES_LIST.map((cat) => {
                const isSelected = selectedCategory === cat;
                const icon = CATEGORY_ICONS[cat] || "🌟";
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isDark
                          ? "bg-white text-neutral-950 font-semibold shadow-sm"
                          : "bg-slate-900 text-white font-semibold shadow-sm"
                        : isDark
                          ? "bg-[#0a0e18] text-neutral-400 hover:text-white border border-white/5 hover:border-white/10"
                          : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grouped Goals Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-neutral-400">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading experiences...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={`py-16 text-center rounded-2xl border p-8 space-y-2 ${isDark ? "bg-[#0a0e18] border-white/5" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-sm font-light ${isDark ? "text-neutral-400" : "text-slate-500"}`}>No goals match your search.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedItems).map(([groupTitle, groupGoals]) => {
                const completedInGroup = groupGoals.filter((g) => g.isCompleted).length;

                return (
                  <div key={groupTitle} className="space-y-3.5">
                    <div className={`flex items-center justify-between pb-2 border-b ${isDark ? "border-white/5" : "border-slate-200"}`}>
                      <h3 className={`text-sm sm:text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        {groupTitle}
                      </h3>
                      <span className={`text-xs font-mono ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                        {completedInGroup} / {groupGoals.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupGoals.map((item) => {
                        const isComplete = item.isCompleted;

                        return (
                          <div
                            key={item._id}
                            className={`rounded-xl p-4 transition-all flex flex-col justify-between border ${
                              isComplete
                                ? isDark
                                  ? "bg-emerald-950/15 border-emerald-500/30"
                                  : "bg-emerald-50/60 border-emerald-300"
                                : isDark
                                  ? "bg-[#0a0e18] border-white/5 hover:border-white/15"
                                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xl sm:text-2xl">{item.emoji}</span>
                                {isComplete ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? "text-neutral-400 bg-white/5" : "text-slate-500 bg-slate-100"}`}>
                                    In Progress
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4
                                  className={`text-sm font-medium leading-snug ${
                                    isComplete
                                      ? "text-emerald-600 dark:text-emerald-200"
                                      : isDark ? "text-white" : "text-slate-900"
                                  }`}
                                >
                                  {item.title}
                                </h4>
                                {item.location && (
                                  <p className={`text-[11px] mt-1 flex items-center gap-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                                    <MapPin className="w-3 h-3 text-neutral-400" />
                                    {item.location}
                                  </p>
                                )}
                              </div>

                              {item.notes && (
                                <p className={`text-xs p-2 rounded-lg border font-light italic ${isDark ? "text-neutral-400 bg-black/30 border-white/5" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                                  &ldquo;{item.notes}&rdquo;
                                </p>
                              )}
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MOMENTS CAPTURED (GALLERY WITH CLOUDINARY UPLOAD) */}
      {/* ========================================================================= */}
      <section className={`py-24 px-4 border-t ${isDark ? "bg-[#07090e] border-white/5" : "bg-[#f8fafc] border-slate-200"}`}>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className={`text-xs uppercase tracking-widest block font-medium ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                Gallery
              </span>
              <div className={`w-12 h-px ${isDark ? "bg-white/20" : "bg-slate-300"}`} />
              <h2 className={`text-3xl sm:text-5xl font-light tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Moments Captured
              </h2>
            </div>

            {/* Cloudinary Upload Trigger (Works for Admin or opens modal) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 shadow-sm ${
                  isDark
                    ? "bg-white/10 hover:bg-white/20 text-white border-white/15"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                }`}
                title="Upload Photo directly to Cloudinary"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Upload to Gallery</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((image: string, index: number) => (
              <div
                key={index}
                onClick={() => setSelectedLightboxImg(image)}
                className={`group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border cursor-pointer ${
                  isDark ? "border-white/10 bg-[#0a0e18]" : "border-slate-200 bg-white"
                }`}
              >
                <img
                  src={image}
                  alt={`Memory ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e: any) => {
                    const fallbacks = [
                      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop",
                    ];
                    e.target.src = fallbacks[index % fallbacks.length];
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                  <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Photo</span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteGalleryImage(image, e)}
                      className="p-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedLightboxImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedLightboxImg}
              alt="Enlarged gallery photo"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FOOTER & LET'S CONNECT */}
      {/* ========================================================================= */}
      <footer className={`py-20 px-4 border-t ${isDark ? "bg-[#05070b] text-white border-white/5" : "bg-slate-100 text-slate-800 border-slate-200"}`}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-light">Let&apos;s Connect</h3>
          <p className={`text-sm max-w-md mx-auto font-light ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
            Ready to share experiences or discuss travel destinations?
          </p>

          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <a
              href={`mailto:${profile.email}`}
              className={`inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-full transition-colors text-sm shadow-md ${
                isDark ? "bg-white text-neutral-900 hover:bg-neutral-100" : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>

            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-full transition-colors text-sm ${
                  isDark ? "border-white/20 text-white hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-200"
                }`}
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
            )}

            {profile.whatsapp && (
              <a
                href={profile.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-full transition-colors text-sm ${
                  isDark ? "border-white/20 text-white hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-200"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          <div className={`mt-12 pt-8 border-t text-xs space-y-1 font-light ${isDark ? "border-white/10 text-neutral-500" : "border-slate-300 text-slate-500"}`}>
            <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
