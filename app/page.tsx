"use client";

import { useState, useEffect, useMemo } from "react";
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
  Compass,
  Mountain,
  Flame,
  Waves,
  Calendar,
  X,
  Sparkles,
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

export default function PortfolioWithBucketList() {
  const [profile, setProfile] = useState<any>(DEFAULT_PROFILE);
  const [items, setItems] = useState<BucketItemType[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters for public viewer
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Profile and Bucket List data
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        // Load profile if available
        try {
          const profileRes = await fetch("/api/profile");
          if (profileRes.ok) {
            const pData = await profileRes.json();
            if (pData && pData.name) {
              setProfile((prev: any) => ({ ...prev, ...pData }));
            }
          }
        } catch {
          // Keep default profile
        }

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

  // Filter items
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

  // Group items by category
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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Floating Admin Link */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          href="/admin"
          className="px-3.5 py-2 rounded-full bg-[#0e1424]/90 hover:bg-[#162038] text-slate-300 hover:text-white border border-white/10 backdrop-blur-md shadow-xl transition-all flex items-center gap-2 text-xs font-semibold"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Admin Portal</span>
        </Link>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1222] via-[#080d19] to-[#050811]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-12">
          {/* Avatar with glowing ring */}
          <div className="inline-block relative">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-2xl mx-auto relative group">
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
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg text-lg">
              ✨
            </div>
          </div>

          <div>
            <h1 className="text-5xl sm:text-7xl font-light text-white tracking-tight">
              {profile.name}
            </h1>
            <p className="text-lg sm:text-2xl text-slate-400 font-light mt-3">
              Traveler · Dreamer · Storyteller
            </p>
          </div>

          {/* Social and Contact Buttons */}
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <a
              href={`mailto:${profile.email}`}
              className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-full hover:bg-slate-100 transition-colors inline-flex items-center gap-2 text-sm shadow-lg"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>

            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram</span>
              </a>
            )}

            {profile.whatsapp && (
              <a
                href={profile.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="pt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4" /> {stats?.percentage || 0}% Bucket List Completed
            </span>
            <span className="text-slate-600">|</span>
            <span>{stats?.completed || 0} of {stats?.total || 78} Goals Achieved</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a
            href="#bucket-list"
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2 block"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </a>
        </div>
      </section>

      {/* 2. ABOUT ME SECTION */}
      <section className="py-24 sm:py-32 px-4 bg-[#080d18] border-t border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 text-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 mb-3 block font-semibold">
              About Me
            </span>
            <div className="w-12 h-px bg-emerald-500 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-6">
              <p className="text-base sm:text-lg leading-relaxed text-slate-300">
                {profile.bio}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{profile.name}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Exploring the World</span>
                </div>
              </div>

              {/* Social Row */}
              <div className="pt-4 flex flex-wrap gap-3">
                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-slate-300 text-xs transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>Follow on Instagram</span>
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    href={profile.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-slate-300 text-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
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
              <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-emerald-500/10 rounded-2xl -z-10 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUCKET LIST & LIFE EXPERIENCES SECTION */}
      <section id="bucket-list" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> Life Milestones
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            🌟 Ultimate Life Experiences
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            78 extreme adventures, high-altitude expeditions, and dream destinations. Explore each milestone and live status below.
          </p>
        </div>

        {/* Dynamic Percentage & Overview Dashboard */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#131b2e] to-[#0c1220] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Highlights */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Live Journey <span className="gradient-text-emerald">Completion Progress</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                From scaling 20,000+ ft peaks in the Himalayas to witnessing the bioluminescent waves and cherry blossoms in Japan, every experience is tracked in real time.
              </p>

              {/* Quick High Altitude & Thrill Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5" /> High Altitude Treks
                  </span>
                  <p className="text-base font-bold text-white">
                    {trekStats.completed} / {trekStats.total} Completed ({trekStats.percentage}%)
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Extreme Thrill
                  </span>
                  <p className="text-base font-bold text-white">
                    {stats?.categoryStats?.["One-Time Extreme Thrill Activities"]?.completed || 0} /{" "}
                    {stats?.categoryStats?.["One-Time Extreme Thrill Activities"]?.total || 11} Done
                  </p>
                </div>
              </div>
            </div>

            {/* Right Circular Gauge */}
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
                    stroke="url(#publicProgressGradient)"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      72 *
                      (1 - (stats?.percentage ? stats.percentage / 100 : 0))
                    }
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient
                      id="publicProgressGradient"
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
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {stats ? `${stats.percentage}%` : "0%"}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-semibold mt-0.5">
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
                  <p className="text-[11px] text-cyan-400">Pending</p>
                  <p className="text-base font-bold text-cyan-300">
                    {stats?.pending || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search goals (e.g. cherry blossom, 15,000 feet, paragliding)..."
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

            {/* Status Tabs */}
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

          {/* Category Filter Chips */}
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
        </div>

        {/* Goals List Render */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading bucket list goals...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 p-8 space-y-3">
            <div className="text-4xl">🏔️</div>
            <h3 className="text-lg font-bold text-white">No items found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              No bucket list goals match the selected filters or search keyword.
            </p>
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
                  {/* Category Header */}
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

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {groupGoals.map((item) => {
                      const isComplete = item.isCompleted;

                      return (
                        <div
                          key={item._id}
                          className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between ${
                            isComplete
                              ? "glass-card-completed shadow-lg shadow-emerald-950/20"
                              : "glass-card glass-card-hover"
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              {/* Read-Only Status Indicator */}
                              <div className="mt-0.5 flex-shrink-0">
                                {isComplete ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-500" />
                                )}
                              </div>

                              {/* Title & Emoji */}
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

                                {/* Tags & Status Badges */}
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  {isComplete ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                      <Calendar className="w-3 h-3" />
                                      Completed {item.completedAt ? new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 font-medium">
                                      ⏳ In Progress
                                    </span>
                                  )}

                                  {item.location && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                      <MapPin className="w-3 h-3" />
                                      {item.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Optional Notes */}
                            {item.notes && (
                              <p className="text-xs text-slate-300/80 bg-black/20 p-2 rounded-lg border border-white/5 italic">
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
      </section>

      {/* 4. GALLERY (MOMENTS CAPTURED) */}
      <section className="py-24 px-4 bg-[#080d18] border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-slate-400 block font-semibold">
              Gallery
            </span>
            <div className="w-12 h-px bg-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-5xl font-light text-white">
              Moments Captured
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(profile.gallery ?? []).slice(0, 3).map((image: string, index: number) => (
              <div
                key={index}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-white/10"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e: any) => {
                    const fallbackImages = [
                      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop",
                    ];
                    e.target.src = fallbackImages[index % fallbackImages.length];
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div className="flex items-center gap-2 text-white">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">Sai Stark Moments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER & LET'S CONNECT */}
      <footer className="py-16 px-4 bg-[#050811] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-light">Let&apos;s Connect</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Ready to share experiences or discuss travel destinations?
          </p>

          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-full hover:bg-slate-100 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>

            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram</span>
              </a>
            )}

            {profile.whatsapp && (
              <a
                href={profile.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            )}

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full transition-colors text-sm font-semibold"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Admin Login</span>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-xs text-slate-500 space-y-1">
            <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
            <p>🌟 78 Ultimate Bucket List Goals · Living Life to the Fullest</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
