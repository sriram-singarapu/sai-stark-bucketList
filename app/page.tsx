"use client";
import { useState, useEffect } from "react";
import {
  MapPin,
  Mail,
  Camera,
  User,
  Instagram,
  MessageCircle,
} from "lucide-react";

type Profile = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  gallery?: string[];
  instagram?: string;
  whatsapp?: string;
  __v?: number;
};

export default function Portfolio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Profile = await res.json();
        setProfile(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-600">Failed to load profile: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
        <div className="relative z-10 text-center px-4">
          <div className="mb-8 inline-block">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-light text-white mb-4 tracking-tight">
            {profile.name}
          </h1>

          <p className="text-xl md:text-2xl text-neutral-400 font-light mb-8">
            Traveler · Dreamer · Storyteller
          </p>

          <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
            <a
              href={`mailto:${profile.email}`}
              className="px-6 py-3 bg-white text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Email
            </a>

            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </a>
            )}

            {profile.whatsapp && (
              <a
                href={profile.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-neutral-400 mb-4 block">
              About Me
            </span>
            <div className="w-12 h-px bg-neutral-900 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-lg leading-relaxed text-neutral-600 mb-6">
                {profile.bio}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neutral-600">
                  <User className="w-5 h-5" />
                  <span>{profile.name}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                  <Mail className="w-5 h-5" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                  <MapPin className="w-5 h-5" />
                  <span>Exploring the World</span>
                </div>
              </div>

              {/* Social Row */}
              <div className="mt-8 flex flex-wrap gap-3">
                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Follow on Instagram</span>
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    href={profile.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={profile.avatar}
                  alt="About"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-neutral-900 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-neutral-400 mb-4 block">
              Gallery
            </span>
            <div className="w-12 h-px bg-neutral-900 mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-light text-neutral-900">
              Moments Captured
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(profile.gallery ?? []).slice(0, 3).map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-light mb-4">Let's Connect</h3>
          <p className="text-neutral-400 mb-8">
            Ready to share experiences or discuss travel destinations?
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </a>

            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </a>
            )}

            {profile.whatsapp && (
              <a
                href={profile.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 text-sm text-neutral-500">
            <p>© 2025 {profile.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
