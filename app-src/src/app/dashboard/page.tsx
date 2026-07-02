"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  LogOut,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { motion, useAnimationControls } from "framer-motion";
import ConfirmDeactivateModal from "@/components/ConfirmDeactivateModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

interface LinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  title?: string;
  active: boolean;
  clicks: number;
  createdAt: string;
  countries?: string[];
}

// Sample demo card shown while the list is empty or as first card
const SAMPLE_CARD: LinkItem = {
  id: "sample-demo",
  slug: "portfolio",
  originalUrl: "https://sukoya.design",
  title: "Sukoya Design",
  active: true,
  clicks: 142,
  createdAt: new Date().toISOString(),
  countries: ["IN", "US", "GB", "SG"],
};

function getScreenshotUrl(url: string) {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatClicks(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function countryFlag(code: string) {
  // Uses flagcdn.com for high-quality flag images (like Telegram)
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

interface LinkCardProps {
  link: LinkItem;
  host: string;
  copiedId: string | null;
  onCopy: (slug: string, id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  isDemo?: boolean;
}

function LinkCard({ link, host, copiedId, onCopy, onToggle, onDelete, isDemo = false }: LinkCardProps) {
  const router = useRouter();
  const title = link.title || getDomain(link.originalUrl);
  const isCopied = copiedId === link.id;
  const shortUrl = `${host || "linkplanet.app"}/${link.slug}`;

  const handleViewDetails = () => {
    if (!isDemo) router.push(`/dashboard/links/${link.id}`);
  };

  const handleToggle = () => {
    if (!isDemo) onToggle(link.id, !link.active);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDemo) onDelete(link.id);
  };

  return (
    <div
      className="group relative flex flex-col bg-[#120c22] border border-[#2b1f47]/50 rounded-[20px] overflow-hidden shadow-lg hover:shadow-[0_8px_40px_rgba(131,77,251,0.18)] hover:border-[#834dfb]/40 transition-all duration-300"
      style={{ minHeight: "380px" }}
    >
      {/* Demo badge */}
      {isDemo && (
        <div className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-[#834dfb]/90 text-white text-[11px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
          Sample
        </div>
      )}

      {/* Screenshot Image */}
      <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: "190px" }}>
        <img
          src={getScreenshotUrl(link.originalUrl)}
          alt={title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
            if (el.parentElement) {
              el.parentElement.style.background =
                "linear-gradient(135deg, #1e1732 0%, #2b1f47 60%, #18102b 100%)";
            }
          }}
        />
        {/* bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #120c22)" }}
        />
        {/* Hover overlay: View Details */}
        <div
          onClick={handleViewDetails}
          className={`absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDemo ? "cursor-default" : "cursor-pointer"}`}
        >
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors">
            <span>View Details</span>
            <ArrowUpRight size={15} />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-4 p-5 flex-1">

        {/* Title + ACTIVE badge + Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-white font-bold text-base leading-snug tracking-tight truncate">
              {title}
            </h3>
            <span className="text-zinc-500 text-xs">
              Created {timeAgo(link.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={isDemo}
              className={`flex-shrink-0 mt-0.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all ${
                link.active
                  ? "bg-[#2b1f47] text-[#a78bfa] hover:bg-[#3b2a5a]"
                  : "bg-zinc-800/60 text-zinc-500 hover:bg-zinc-700/60 hover:text-zinc-300"
              } ${isDemo ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              title={link.active ? "Deactivate link" : "Activate link"}
            >
              {link.active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
              {link.active ? "Live" : "Inactive"}
            </button>
          </div>
        </div>

        {/* Stats Row: Total Clicks (left) + Country flags (right) */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-500 text-[11px] font-medium">Total Clicks</span>
            <span className="text-white font-bold text-xl leading-tight">
              {formatClicks(link.clicks)}
            </span>
          </div>
          {link.countries && link.countries.length > 0 && (
            <div className="flex items-center opacity-50 pb-0.5">
              {link.countries.slice(0, 4).map((code, i) => (
                <span
                  key={code}
                  className="flex items-center justify-center rounded-full overflow-hidden border-2 border-[#120c22] bg-[#1e1535] flex-shrink-0"
                  style={{ width: "22px", height: "22px", marginLeft: i === 0 ? 0 : "-7px", zIndex: i + 1, position: "relative" }}
                  title={code}
                >
                  <img src={countryFlag(code)} alt={code} className="w-full h-full object-cover" />
                </span>
              ))}
              {link.countries.length > 4 && (
                <span
                  className="flex items-center justify-center rounded-full bg-[#2b1f47] border-2 border-[#120c22] text-[5px] text-zinc-400 font-bold flex-shrink-0"
                  style={{ width: "22px", height: "22px", marginLeft: "-7px", zIndex: 5, position: "relative" }}
                >
                  +{link.countries.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#2b1f47]/70" />

        {/* Short URL Row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              Short URL
            </span>
            <span className="text-zinc-300 text-sm font-mono truncate">
              {shortUrl}
            </span>
          </div>
          <button
            onClick={() => onCopy(link.slug, link.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#2b1f47]/60 hover:bg-[#2b1f47] border border-[#2b1f47]/80 hover:border-[#834dfb]/40 text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer"
            title="Copy short URL"
          >
            {isCopied ? (
              <Check size={14} className="text-emerald-400" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}


/* ─── Animated New Link CTA ─── */
function NewLinkButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.96 }}
      className="relative flex items-center gap-2 px-4 py-2 text-white rounded-[8px] text-sm font-semibold overflow-hidden select-none"
      style={{ isolation: "isolate" }}
    >
      {/* Breathing glow aura behind the button */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[8px] pointer-events-none"
        animate={{
          boxShadow: hovered
            ? [
                "0 0 0px 0px rgba(131,77,251,0)",
                "0 0 18px 6px rgba(131,77,251,0.55)",
                "0 0 12px 4px rgba(131,77,251,0.35)",
              ]
            : [
                "0 0 8px 2px rgba(131,77,251,0.18)",
                "0 0 16px 5px rgba(131,77,251,0.32)",
                "0 0 8px 2px rgba(131,77,251,0.18)",
              ],
        }}
        transition={{
          duration: hovered ? 0.6 : 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Solid background */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[8px] pointer-events-none"
        animate={{ backgroundColor: hovered ? "#743deb" : "#834dfb" }}
        transition={{ duration: 0.18 }}
      />

      {/* Shimmer sweep — single diagonal highlight that glides across on hover */}
      <motion.span
        aria-hidden
        className="absolute inset-0 pointer-events-none rounded-[8px]"
        style={{
          background:
            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: hovered ? "100% 0%" : "-100% 0%" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      {/* Content */}
      <motion.span
        className="relative z-10 flex items-center gap-2"
        animate={{ x: hovered ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.span
          animate={{ rotate: hovered ? 90 : 0 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Plus size={15} />
        </motion.span>
        New Link
      </motion.span>
    </motion.button>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [host, setHost] = useState("");
  const [deactivatingLink, setDeactivatingLink] = useState<LinkItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);

  const fetchLinks = () => {
    setLoading(true);
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLinks(data.links);
      })
      .catch((err) => console.error("Failed to fetch links:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinks();
    if (typeof window !== "undefined") {
      setHost(window.location.origin);
    }
  }, []);

  const handleCopy = (slug: string, id: string) => {
    const fullUrl = `${host}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  const handleToggle = async (id: string, active: boolean) => {
    if (!active) {
      const targetLink = links.find((l) => l.id === id);
      if (targetLink) {
        setDeactivatingLink(targetLink);
        return;
      }
    }
    await executeToggle(id, active);
  };

  const executeToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (data.success) {
        setLinks(links.map(l => l.id === id ? { ...l, active } : l));
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDeleteClick = (id: string) => {
    const targetLink = links.find((l) => l.id === id);
    if (targetLink) {
      setDeletingLink(targetLink);
    }
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setLinks(links.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.active).length;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  // Show sample card + real links in the grid
  const displayCards = [SAMPLE_CARD, ...links];

  return (
    <div className="min-h-screen bg-[#0e0818] text-zinc-100">
      
      {/* Top Navbar */}
      <header className="border-b border-[#2b1f47]/50 bg-[#120c22]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#f5f3ff]">
            <div className="w-8 h-8 rounded-lg bg-[#834dfb] text-white flex items-center justify-center">
              <LinkIcon size={16} />
            </div>
            <span>LinkPlanet</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-500 hover:text-[#f5f3ff] rounded-lg hover:bg-[#2b1f47]/40 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome + Stats Row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage and track your shortened links
            </p>
          </div>

          {/* Inline Stats */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center px-5 py-3 bg-[#120c22] border border-[#2b1f47]/50 rounded-2xl min-w-[72px]">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>{totalLinks}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mt-0.5">Links</span>
            </div>
            <div className="flex flex-col items-center px-5 py-3 bg-[#120c22] border border-[#2b1f47]/50 rounded-2xl min-w-[72px]">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>{activeLinks}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mt-0.5">Active</span>
            </div>
            <div className="flex flex-col items-center px-5 py-3 bg-[#120c22] border border-[#2b1f47]/50 rounded-2xl min-w-[72px]">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>{totalClicks}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mt-0.5">Total Clicks</span>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Your Links</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLinks}
              disabled={loading}
              className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-[#2b1f47]/40 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#834dfb]" : ""} />
            </button>
            <NewLinkButton onClick={() => router.push("/dashboard/create")} />
          </div>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 size={32} className="animate-spin mb-4 text-[#834dfb]" />
            <span className="text-sm font-semibold">Loading your links...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Sample demo card always first */}
            <LinkCard
              link={SAMPLE_CARD}
              host={host}
              copiedId={copiedId}
              onCopy={handleCopy}
              onToggle={handleToggle}
              onDelete={() => {}}
              isDemo
            />

            {/* Real link cards */}
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                host={host}
                copiedId={copiedId}
                onCopy={handleCopy}
                onToggle={handleToggle}
                onDelete={handleDeleteClick}
              />
            ))}

            {/* Add New Card Placeholder */}
            <button
              onClick={() => router.push("/dashboard/create")}
              className="flex flex-col items-center justify-center gap-3 bg-[#120c22]/50 border-2 border-dashed border-[#2b1f47]/60 hover:border-[#834dfb]/50 hover:bg-[#2b1f47]/20 rounded-[20px] text-zinc-500 hover:text-[#834dfb] transition-all duration-300 cursor-pointer group"
              style={{ minHeight: "340px" }}
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-600 group-hover:border-[#834dfb]/60 flex items-center justify-center transition-colors">
                <Plus size={22} />
              </div>
              <span className="text-sm font-semibold">Add new link</span>
            </button>
          </div>
        )}

      </main>

      <ConfirmDeactivateModal
        isOpen={!!deactivatingLink}
        onConfirm={async () => {
          if (deactivatingLink) {
            await executeToggle(deactivatingLink.id, false);
            setDeactivatingLink(null);
          }
        }}
        onCancel={() => setDeactivatingLink(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingLink}
        title={deletingLink?.title || (deletingLink ? getDomain(deletingLink.originalUrl) : "")}
        slug={deletingLink?.slug || ""}
        originalUrl={deletingLink?.originalUrl || ""}
        clicks={deletingLink?.clicks || 0}
        onConfirm={async () => {
          if (deletingLink) {
            await executeDelete(deletingLink.id);
            setDeletingLink(null);
          }
        }}
        onCancel={() => setDeletingLink(null)}
      />
    </div>
  );
}
