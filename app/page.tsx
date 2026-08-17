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
  Calendar,
  X,
  Sparkles,
  ArrowUpRight,
  Filter,
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
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters for public view
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        try {
          const profileRes = await fetch("/api/profile");
          if (profileRes.ok) {
            const pData = await profileRes.json();
            if (pData && pData.name) {
              setProfile((prev: any) => ({ ...prev, ...pData }));
            }
          }
        } catch {}

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Discreet Top Admin Button */}
      <div className="fixed top-5 right-5 z-50">
        <Link
          href="/admin"
          className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-slate-400 hover:text-slate-200 border border-white/10 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs"
          title="Admin Management"
        >
          <Lock className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Loved by user) */}
      {/* ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1424] via-[#07090e] to-[#07090e]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-12">
          {/* Avatar with clean glowing border */}
          <div className="inline-block relative">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl mx-auto group">
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
            <h1 className="text-5xl sm:text-7xl font-light text-white tracking-tight">
              {profile.name}
            </h1>
            <p className="text-lg sm:text-2xl text-neutral-400 font-light mt-3">
              Traveler · Dreamer · Storyteller
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <a
              href={`mailto:${profile.email}`}
              className="px-6 py-2.5 bg-white text-neutral-900 font-medium rounded-full hover:bg-neutral-100 transition-colors inline-flex items-center gap-2 text-sm shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>

            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-sm"
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
                className="px-6 py-2.5 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a
            href="#about"
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2 block"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT ME SECTION (Loved by user) */}
      {/* ========================================================================= */}
      <section id="about" className="py-24 sm:py-32 px-4 border-t border-white/5 bg-[#07090e]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block font-medium">
              About Me
            </span>
            <div className="w-12 h-px bg-white/20 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-6">
              <p className="text-base sm:text-lg leading-relaxed text-neutral-300">
                {profile.bio}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-neutral-300 text-sm">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{profile.name}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-300 text-sm">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-300 text-sm">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Exploring the World</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-neutral-300 text-xs transition-colors"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-neutral-300 text-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
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
              <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-neutral-900 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. REDESIGNED ULTRA-LUXURY BUCKET LIST SECTION */}
      {/* ========================================================================= */}
      <section id="bucket-list" className="py-24 px-4 lg:px-8 border-t border-white/5 bg-[#05070b]">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Minimalist Section Header */}
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-emerald-400 block font-semibold">
              Life Experiences
            </span>
            <div className="w-12 h-px bg-emerald-500/40 mx-auto mb-3" />
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
              The Bucket List
            </h2>
            <p className="text-neutral-400 text-sm max-w-lg mx-auto font-light">
              78 milestone experiences across high peaks, ocean depths, and global explorations.
            </p>
          </div>

          {/* Minimal Progress Line & Metrics Card */}
          <div className="rounded-2xl p-6 bg-[#0a0e18] border border-white/10 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Overall Progress
                </span>
                <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {stats?.percentage || 0}% Completed
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-neutral-400">
                <div>
                  <span className="block font-bold text-base text-white">
                    {stats?.total || 78}
                  </span>
                  <span className="text-[11px]">Total Goals</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="block font-bold text-base text-emerald-400">
                    {stats?.completed || 0}
                  </span>
                  <span className="text-[11px]">Completed</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="block font-bold text-base text-neutral-300">
                    {stats?.pending || 0}
                  </span>
                  <span className="text-[11px]">In Progress</span>
                </div>
              </div>
            </div>

            {/* Glowing Linear Progress Bar */}
            <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats?.percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Clean Controls: Search & Category Filter */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search experiences (e.g. cherry blossom, 15,000 feet, paragliding)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0e18] border border-white/10 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Segment */}
              <div className="flex items-center p-1 bg-[#0a0e18] rounded-xl border border-white/10 self-start sm:self-auto text-xs">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    statusFilter === "all"
                      ? "bg-white/10 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  All ({stats?.total || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    statusFilter === "completed"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Done ({stats?.completed || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    statusFilter === "pending"
                      ? "bg-white/10 text-neutral-200"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <Circle className="w-3.5 h-3.5 text-neutral-500" />
                  Pending ({stats?.pending || 0})
                </button>
              </div>
            </div>

            {/* Category Navigation Pills */}
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
                        ? "bg-white text-neutral-950 font-semibold shadow-sm"
                        : "bg-[#0a0e18] text-neutral-400 hover:text-white border border-white/5 hover:border-white/10"
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
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-neutral-500">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading experiences...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-[#0a0e18] border border-white/5 p-8 space-y-2">
              <p className="text-neutral-400 text-sm font-light">No goals found matching your filter.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedItems).map(([groupTitle, groupGoals]) => {
                const completedInGroup = groupGoals.filter(
                  (g) => g.isCompleted
                ).length;

                return (
                  <div key={groupTitle} className="space-y-3.5">
                    {/* Category Title */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
                        <span>{groupTitle}</span>
                      </h3>
                      <span className="text-xs text-neutral-400 font-mono">
                        {completedInGroup} / {groupGoals.length}
                      </span>
                    </div>

                    {/* Luxury Journal Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupGoals.map((item, idx) => {
                        const isComplete = item.isCompleted;

                        return (
                          <div
                            key={item._id}
                            className={`rounded-xl p-4 transition-all flex flex-col justify-between border ${
                              isComplete
                                ? "bg-emerald-950/15 border-emerald-500/30"
                                : "bg-[#0a0e18] border-white/5 hover:border-white/15"
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xl sm:text-2xl">{item.emoji}</span>
                                {isComplete ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full">
                                    In Progress
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4
                                  className={`text-sm font-medium leading-snug ${
                                    isComplete ? "text-emerald-200" : "text-white"
                                  }`}
                                >
                                  {item.title}
                                </h4>
                                {item.location && (
                                  <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-neutral-500" />
                                    {item.location}
                                  </p>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-xs text-neutral-400 bg-black/30 p-2 rounded-lg border border-white/5 font-light italic">
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
      {/* 4. MOMENTS CAPTURED (GALLERY) */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 bg-[#07090e] border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-neutral-400 block font-medium">
              Gallery
            </span>
            <div className="w-12 h-px bg-white/20 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
              Moments Captured
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(profile.gallery ?? []).slice(0, 3).map((image: string, index: number) => (
              <div
                key={index}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-white/10 bg-[#0a0e18]"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e: any) => {
                    const fallbackImages = [
                      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop",
                    ];
                    e.target.src = fallbackImages[index % fallbackImages.length];
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div className="flex items-center gap-2 text-white">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium">Captured Memory</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER & LET'S CONNECT */}
      {/* ========================================================================= */}
      <footer className="py-20 px-4 bg-[#05070b] text-white border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-light">Let&apos;s Connect</h3>
          <p className="text-neutral-400 text-sm max-w-md mx-auto font-light">
            Ready to share experiences or discuss travel destinations?
          </p>

          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-900 font-medium rounded-full hover:bg-neutral-100 transition-colors text-sm shadow-md"
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
                <Instagram className="w-4 h-4" />
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
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-xs text-neutral-500 space-y-1 font-light">
            <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
