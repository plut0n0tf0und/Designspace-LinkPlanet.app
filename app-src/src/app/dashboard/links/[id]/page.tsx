"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Link as LinkIcon, Copy, Check, ExternalLink, ToggleLeft, ToggleRight, BarChart3, Map, List, Trash2, Settings, Sliders, Calendar, Clock, AlertTriangle, Smartphone, Monitor, Download, Info } from "lucide-react";
import { ComposableMap, ZoomableGroup, Geographies, Geography, Marker } from "react-simple-maps";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import LinkAnalyticsCharts from "@/components/LinkAnalyticsCharts";
import ConfirmDeactivateModal from "@/components/ConfirmDeactivateModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import "./link-details.css";

function getScreenshotUrl(url: string) {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins === 0) return "Just Now";
      return `${diffMins}m ago`;
    }
    return `${diffHrs}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const A2_TO_A3: Record<string, string> = {
  AF: "AFG", AL: "ALB", DZ: "DZA", AO: "AGO", AR: "ARG", AM: "ARM", AU: "AUS", AT: "AUT", AZ: "AZE",
  BH: "BHR", BD: "BGD", BY: "BLR", BE: "BEL", BJ: "BEN", BO: "BOL", BA: "BIH", BW: "BWA", BR: "BRA",
  BN: "BRN", BG: "BGR", KH: "KHM", CM: "CMR", CA: "CAN", CF: "CAF", TD: "TCD", CL: "CHL", CN: "CHN",
  CO: "COL", CD: "COD", CR: "CRI", HR: "HRV", CU: "CUB", CY: "CYP", CZ: "CZE", DK: "DNK", DO: "DOM",
  EC: "ECU", EG: "EGY", SV: "SLV", ET: "ETH", FJ: "FJI", FI: "FIN", FR: "FRA", GA: "GAB", GE: "GEO",
  DE: "DEU", GH: "GHA", GR: "GRC", GT: "GTM", GN: "GIN", HT: "HTI", HN: "HND", HU: "HUN", IS: "ISL",
  IN: "IND", ID: "IDN", IR: "IRN", IQ: "IRQ", IE: "IRL", IL: "ISR", IT: "ITA", JM: "JAM", JP: "JPN",
  JO: "JOR", KZ: "KAZ", KE: "KEN", KP: "PRK", KR: "KOR", KW: "KWT", KG: "KGZ", LA: "LAO", LV: "LVA",
  LB: "LBN", LY: "LBY", LT: "LTU", LU: "LUX", MG: "MDG", MY: "MYS", ML: "MLI", MX: "MEX", MD: "MDA",
  MN: "MNG", ME: "MNE", MA: "MAR", MZ: "MOZ", MM: "MMR", NA: "NAM", NP: "NPL", NL: "NLD", NZ: "NZL",
  NI: "NIC", NE: "NER", NG: "NGA", NO: "NOR", OM: "OMN", PK: "PAK", PA: "PAN", PG: "PNG", PY: "PRY",
  PE: "PER", PH: "PHL", PL: "POL", PT: "PRT", QA: "QAT", RO: "ROU", RU: "RUS", RW: "RWA", SA: "SAU",
  SN: "SEN", RS: "SRB", SG: "SGP", SK: "SVK", SI: "SVN", SO: "SOM", ZA: "ZAF", ES: "ESP", LK: "LKA",
  SD: "SDN", SE: "SWE", CH: "CHE", SY: "SYR", TW: "TWN", TJ: "TJK", TZ: "TZA", TH: "THA", TG: "TGO",
  TN: "TUN", TR: "TUR", TM: "TKM", UA: "UKR", AE: "ARE", GB: "GBR", US: "USA", UY: "URY", UZ: "UZB",
  VE: "VEN", VN: "VNM", YE: "YEM", ZM: "ZMB", ZW: "ZWE"
};

const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902],
  CA: [-106.3468, 56.1304],
  GB: [-3.4359, 55.3781],
  IN: [78.9629, 20.5937],
  DE: [10.4515, 51.1657],
  FR: [2.2137, 46.2276],
  AU: [133.7751, -25.2744],
  BR: [-51.9253, -14.235],
  JP: [138.2529, 36.2048],
  RU: [105.3188, 61.524],
  CN: [104.1954, 35.8617],
  ZA: [25.0839, -28.4793],
  ES: [-3.7492, 40.4637],
  IT: [12.5674, 41.8719],
  NL: [5.2913, 52.1326],
  CH: [8.2275, 46.8182],
  SE: [18.6435, 60.1282],
  NO: [8.4689, 60.472],
  FI: [25.7482, 61.9241],
  DK: [9.5018, 56.2639],
  NZ: [174.886, -40.9006],
  SG: [103.8198, 1.3521],
  HK: [114.1694, 22.3193],
  KR: [127.7669, 35.9078],
  MX: [-102.5528, 23.6345],
};

interface TimePoint { date: string; views: number }
interface Breakdown  { name: string; views: number }

interface ClickItem {
  id: string;
  country: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  ip: string | null;
  createdAt: string;
}

interface LinkData {
  id: string;
  domain?: string;
  slug: string;
  originalUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  totalClicks: number;
  countries: string[];
  clicks: ClickItem[];
  timeSeries: { month: TimePoint[]; year: TimePoint[]; all: TimePoint[] };
  countriesBreakdown: Breakdown[];
  devicesBreakdown:   Breakdown[];
}

export default function LinkDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"dashboard" | "map" | "entries" | "settings">("dashboard");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; views: number; percentage: string } | null>(null);
  const [position, setPosition] = useState({ coordinates: [10, 0], zoom: 1 });

  useEffect(() => {
    fetchLink();
  }, [id]);

  const fetchLink = async () => {
    try {
      const res = await fetch(`/api/links/${id}`);
      const data = await res.json();
      if (data.success) {
        setLink(data.link);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = () => {
    if (!link) return;
    if (link.active) {
      setShowDeactivateModal(true);
    } else {
      executeToggle(true);
    }
  };

  const executeToggle = async (active: boolean) => {
    if (!link) return;
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (data.success) {
        setLink({ ...link, active });
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const executeDelete = async () => {
    if (!link) return;
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCopy = () => {
    if (!link) return;
    const protocol = window.location.protocol;
    const shortUrl = link.domain ? `${protocol}//${link.domain}/${link.slug}` : `${window.location.origin}/${link.slug}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOriginal = () => {
    if (!link) return;
    navigator.clipboard.writeText(link.originalUrl);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyShort = () => {
    if (!link) return;
    const protocol = window.location.protocol;
    const shortUrl = link.domain ? `${protocol}//${link.domain}/${link.slug}` : `${window.location.origin}/${link.slug}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedShort(true);
    setTimeout(() => setCopiedShort(false), 2000);
  };

  const handleExportCSV = () => {
    if (!link || !link.clicks || link.clicks.length === 0) return;
    const headers = ["Timestamp", "Country", "Device", "OS", "Browser", "Referrer", "IP"];
    const rows = link.clicks.map((c) => [
      new Date(c.createdAt).toISOString(),
      c.country || "Unknown",
      c.device || "Unknown",
      c.os || "Unknown",
      c.browser || "Unknown",
      c.referrer || "Direct Traffic",
      c.ip || "Unknown",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", encodedUri);
    linkElement.setAttribute("download", `clicks_${link.slug}_export.csv`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0818] text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-[#0e0818] text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-400">Link not found</div>
      </div>
    );
  }

  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const shortUrl = link.domain ? `${protocol}//${link.domain}/${link.slug}` : `${window.location.origin}/${link.slug}`;

  return (
    <div className="link-details-page min-h-screen bg-[#0e0818] text-zinc-100">
      {/* Navbar */}
      <header className="link-details-navbar border-b border-[#2b1f47]/50 bg-[#120c22]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="navbar-container max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="back-button flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="brand-logo flex items-center gap-2 text-sm font-bold text-[#834dfb]">
            <LinkIcon size={14} />
            <span>LinkPlanet</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="main-content max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="header-section bg-[#120c22] border border-[#2b1f47]/50 rounded-2xl p-6 mb-6">
          {/* Original URL with Toggle */}
          <div className="original-url-container mb-8 md:mb-[44px]">
            <div className="original-url-header flex items-center justify-between mb-2">
              <div className="original-url-label text-sm font-bold uppercase tracking-widest text-zinc-400">
                Original URL
              </div>
              {/* Status Toggle */}
              <div className="toggle-container flex-shrink-0">
                <div className="toggle-switch">
                  <input
                    className="toggle-switch-input"
                    id="switch1"
                    type="checkbox"
                    checked={link.active}
                    onChange={handleToggleClick}
                  />
                  <label className="toggle-switch-label" htmlFor="switch1">
                    Check
                    <span></span>
                  </label>
                </div>
              </div>
            </div>
            <a 
              href={link.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block original-url-text text-white font-medium text-lg md:text-xl lg:text-[24px] leading-tight truncate hover:underline hover:text-white underline-offset-4 decoration-[#834dfb] transition-all" 
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {link.originalUrl}
            </a>
          </div>

          {/* Shortened URL */}
          <div className="shortened-url-container">
            <div className="shortened-url-label text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Shortened URL
            </div>
            <div className="shortened-url-input-group flex flex-wrap items-center gap-3">
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="shortened-url-input block overflow-hidden flex-1 bg-[#0e0818] border border-[#2b1f47]/50 rounded-lg px-4 py-3 text-zinc-300 font-mono text-xs sm:text-sm truncate hover:text-white hover:underline underline-offset-4 decoration-[#834dfb] transition-all"
              >
                {shortUrl}
              </a>
              <button
                onClick={handleCopy}
                className={`copy-button flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm transition-all copy-button-ripple ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 copy-button-success"
                    : "bg-[#2b1f47]/60 text-zinc-300 border border-[#2b1f47]/80 hover:bg-[#2b1f47] hover:text-white"
                }`}
              >
                {copied ? (
                  <Check size={16} className="checkmark-animate" />
                ) : (
                  <Copy size={16} />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-button flex items-center justify-center gap-2 px-5 py-3 bg-[#834dfb] hover:bg-[#743deb] rounded-lg text-white font-medium text-sm transition-all"
              >
                <ExternalLink size={16} />
                Visit
              </a>
            </div>
          </div>
        </div>


        {/* Analytics Section */}
        <div className="analytics-section bg-[#120c22] border border-[#2b1f47]/50 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="analytics-tabs flex border-b border-[#2b1f47]/50 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`tab-button flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "text-[#834dfb] border-b-2 border-[#834dfb]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <BarChart3 size={16} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`tab-button flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "map"
                  ? "text-[#834dfb] border-b-2 border-[#834dfb]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Map size={16} />
              Map
            </button>
            <button
              onClick={() => setActiveTab("entries")}
              className={`tab-button flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "entries"
                  ? "text-[#834dfb] border-b-2 border-[#834dfb]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <List size={16} />
              Each Entries
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`tab-button flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "settings"
                  ? "text-[#834dfb] border-b-2 border-[#834dfb]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Info size={16} />
              Details
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content p-6 sm:p-8">
            {activeTab === "dashboard" && (
              link.timeSeries ? (
                <LinkAnalyticsCharts
                  timeSeries={link.timeSeries}
                  countriesBreakdown={link.countriesBreakdown}
                  devicesBreakdown={link.devicesBreakdown}
                  onMapTabClick={() => setActiveTab("map")}
                />
              ) : (
              <div className="tab-placeholder flex flex-col items-center justify-center text-center py-8 sm:py-12">
                <div className="placeholder-icon w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#834dfb]/20 border border-[#834dfb]/30 flex items-center justify-center mb-4">
                  <BarChart3 size={24} className="text-[#834dfb]" />
                </div>
                <h3 className="placeholder-title text-lg sm:text-xl font-bold text-white mb-2">Deep Analytics Visualizer</h3>
                <p className="placeholder-description text-zinc-400 text-sm max-w-md px-4">
                  Visualizing real-time geographic data, referral sources, and device distribution metrics for your campaign link.
                </p>
              </div>
              )
            )}
            {activeTab === "map" && (() => {
              const countriesBreakdown = link.countriesBreakdown || [];
              const totalViews = countriesBreakdown.reduce((sum, item) => sum + item.views, 0);
              const maxViews = Math.max(...countriesBreakdown.map(c => c.views)) || 1;

              return (
                <div className="flex flex-col gap-6 w-full text-left">
                  {/* Header Row (Satellite design feed style matching reference) */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b1f47]/30 pb-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
                        Live Feed Map View
                      </h3>
                      <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">
                        Satellite View Real-Time Redirection Analytics
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-0.5 bg-[#834dfb] inline-block rounded" />
                        <span>Telemetry Node: Active Edge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-0.5 bg-[#10b981] inline-block rounded" />
                        <span>Click Event Feed (Real-Time)</span>
                      </div>
                    </div>
                  </div>

                  {/* Layout Panel (Stacked vertically) */}
                  <div className="flex flex-col gap-6 w-full">
                    {/* Map Container Card - Solid background, 500px tall filled map */}
                    <div className="w-full bg-[#0e0818] border border-[#2b1f47]/60 rounded-[20px] p-6 relative overflow-hidden shadow-2xl h-[500px] flex items-center justify-center">
                      
                      {/* Subtle Concentric Radar Grid Rings (Reference style) */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                        <div className="w-[120px] h-[120px] rounded-full border border-[#2b1f47]/20 absolute" />
                        <div className="w-[280px] h-[280px] rounded-full border border-[#2b1f47]/15 absolute" />
                        <div className="w-[450px] h-[450px] rounded-full border border-[#2b1f47]/10 absolute" />
                        <div className="w-[620px] h-[620px] rounded-full border border-[#2b1f47]/5 absolute" />
                      </div>

                      <div className="w-full h-full relative select-none flex items-center justify-center z-2">
                        <ComposableMap
                          projectionConfig={{ scale: 220, center: [10, 10] }}
                          style={{ width: "100%", height: "100%", display: "block" }}
                          height={460}
                        >
                          <defs>
                            {/* Neon Glow Filter */}
                            <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="3.5" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates as [number, number]}
                            onMoveEnd={(pos: any) => setPosition(pos)}
                          >
                            <Geographies geography={GEO_URL}>
                              {({ geographies }: { geographies: any[] }) =>
                                geographies.map((geo: any) => {
                                  const countryCodeA3 = geo.properties?.ADM0_A3 ?? geo.id;
                                  const countryCodeA2 = Object.keys(A2_TO_A3).find(key => A2_TO_A3[key] === countryCodeA3);
                                  const breakdownItem = countriesBreakdown.find(
                                    b => b.name.toUpperCase() === countryCodeA2 || b.name.toUpperCase() === countryCodeA3
                                  );
                                  const isHit = !!breakdownItem;
                                  const views = breakdownItem ? breakdownItem.views : 0;
                                  const percentage = totalViews > 0 ? ((views / totalViews) * 100).toFixed(1) : "0";

                                  return (
                                    <Geography
                                      key={geo.rsmKey}
                                      geography={geo}
                                      style={{
                                        default: { 
                                          fill: isHit ? "#231545" : "#120b22", 
                                          stroke: isHit ? "#00ff88" : "#241b3d", 
                                          strokeWidth: isHit ? 1.5 : 0.5, 
                                          outline: "none",
                                          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                                        },
                                        hover: { 
                                          fill: isHit ? "#341d6b" : "#1c1236", 
                                          stroke: isHit ? "#00ff88" : "#834dfb",
                                          strokeWidth: isHit ? 1.8 : 0.6,
                                          outline: "none",
                                          cursor: "pointer",
                                          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                                        },
                                        pressed: { outline: "none" }
                                      }}
                                      onMouseEnter={() => {
                                        setHoveredCountry({
                                          name: geo.properties?.NAME || geo.properties?.ADMIN || "Unknown Country",
                                          views,
                                          percentage
                                        });
                                      }}
                                      onMouseLeave={() => {
                                        setHoveredCountry(null);
                                      }}
                                    />
                                  );
                                })
                              }
                            </Geographies>

                            {/* Neon glowing active markers on top of map */}
                            {countriesBreakdown.map((item) => {
                              const coords = COUNTRY_COORDS[item.name.toUpperCase()];
                              if (!coords) return null;
                              return (
                                <Marker key={item.name} coordinates={coords}>
                                  {/* Pulsing ring */}
                                  <circle r={16} fill="#10b981" opacity={0.25} className="animate-ping" style={{ transformOrigin: "center" }} />
                                  {/* Glowing aura */}
                                  <circle r={6.5} fill="#10b981" opacity={0.5} filter="url(#glow-green)" />
                                  {/* Solid core */}
                                  <circle r={3.2} fill="#10b981" stroke="#0e0818" strokeWidth={1} />
                                </Marker>
                              );
                            })}
                          </ZoomableGroup>
                        </ComposableMap>

                        {/* Hover Tooltip (Luxury Glassmorphism style) */}
                        {hoveredCountry && (
                          <div className="absolute top-4 left-4 bg-[#120c22]/95 border border-[#10b981]/40 backdrop-blur-md rounded-xl p-3 shadow-xl pointer-events-none transition-all duration-150 animate-fade-in flex flex-col gap-1 z-10">
                            <span className="text-white text-sm font-bold uppercase tracking-wider leading-none">
                              {hoveredCountry.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-[#10b981] font-bold font-mono">{hoveredCountry.views} {hoveredCountry.views === 1 ? "click" : "clicks"}</span>
                              <span className="text-zinc-500 font-medium">({hoveredCountry.percentage}%)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Zoom Controls Overlay */}
                      <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 z-10">
                        <button
                          onClick={() => setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.3, 8) }))}
                          className="w-8 h-8 rounded-lg bg-[#120c22]/90 border border-[#2b1f47]/80 hover:border-[#10b981]/60 flex items-center justify-center text-white text-base font-bold backdrop-blur-xs hover:bg-[#10b981]/10 transition-all cursor-pointer shadow-lg"
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.3, 1) }))}
                          className="w-8 h-8 rounded-lg bg-[#120c22]/90 border border-[#2b1f47]/80 hover:border-[#10b981]/60 flex items-center justify-center text-white text-base font-bold backdrop-blur-xs hover:bg-[#10b981]/10 transition-all cursor-pointer shadow-lg"
                          title="Zoom Out"
                        >
                          &minus;
                        </button>
                        <button
                          onClick={() => setPosition({ coordinates: [10, 10], zoom: 1 })}
                          className="w-8 h-8 rounded-lg bg-[#120c22]/90 border border-[#2b1f47]/80 hover:border-[#10b981]/60 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs hover:bg-[#10b981]/10 transition-all cursor-pointer shadow-lg"
                          title="Reset Zoom"
                        >
                          R
                        </button>
                      </div>
                    </div>

                    {/* Metrics List Panel - Stacks below map with h-fit height */}
                    <div className="bg-[#0e0818] border border-[#2b1f47]/60 rounded-[20px] p-6 flex flex-col gap-4 shadow-2xl h-fit w-full">
                      <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
                          Visitor Distribution
                        </h4>
                        <p className="text-zinc-500 text-xs mt-1">
                          Breakdown of campaign performance by country.
                        </p>
                      </div>

                      {countriesBreakdown.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm py-12">
                          No location data captured yet.
                        </div>
                      ) : (
                        <div className="w-full h-[260px] bg-[#0d0b1a]/40 border border-[#2b1f47]/30 rounded-xl p-4 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={countriesBreakdown} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                              <defs>
                                <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#834dfb" />
                                  <stop offset="100%" stopColor="#130924" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#2b1f47"
                                opacity={0.2}
                              />
                              <XAxis
                                dataKey="name"
                                stroke="#52525b"
                                fontSize={11}
                                fontWeight={600}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.toUpperCase()}
                              />
                              <YAxis
                                stroke="#52525b"
                                fontSize={11}
                                fontWeight={600}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tickCount={4}
                              />
                              <RechartsTooltip
                                cursor={{ fill: 'rgba(131, 77, 251, 0.03)' }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-[#120c22]/95 border border-[#834dfb]/40 backdrop-blur-md rounded-lg p-2.5 shadow-xl flex flex-col gap-0.5 text-xs font-semibold">
                                        <span className="text-white uppercase font-bold">{data.name}</span>
                                        <span className="text-[#834dfb] font-mono">{data.views} {data.views === 1 ? "click" : "clicks"}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar dataKey="views" radius={[8, 8, 0, 0]} maxBarSize={20}>
                                {countriesBreakdown.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill="url(#barGlow)" />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            {activeTab === "entries" && (() => {
              const totalEntries = link.clicks?.length || 0;
              const allEntries = link.clicks || [];

              return (
                <div className="flex flex-col gap-6 w-full text-left">
                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b border-[#2b1f47]/30 pb-4">
                    <div className="flex items-center gap-2 text-white">
                      <List size={18} className="text-[#834dfb]" />
                      <h3 className="text-base font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
                        Click Entries
                      </h3>
                    </div>
                    {totalEntries > 0 && (
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2b1f47]/60 border border-[#2b1f47]/80 rounded-lg hover:border-[#834dfb]/50 text-zinc-300 hover:text-white font-medium text-xs transition-all active:scale-95 group cursor-pointer"
                      >
                        <Download size={13} className="text-[#834dfb]" />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>

                  {/* Table / Data Panel */}
                  {totalEntries === 0 ? (
                    <div className="tab-placeholder flex flex-col items-center justify-center text-center py-12 bg-[#120c22]/30 border border-[#2b1f47]/30 rounded-2xl">
                      <div className="placeholder-icon w-14 h-14 rounded-full bg-[#834dfb]/10 border border-[#834dfb]/20 flex items-center justify-center mb-4">
                        <List size={22} className="text-[#834dfb]" />
                      </div>
                      <h3 className="placeholder-title text-base font-bold text-white mb-1">No Entries Yet</h3>
                      <p className="placeholder-description text-zinc-500 text-sm max-w-sm px-4">
                        This link hasn't received any clicks yet. Share the link to start collecting analytics.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#120c22]/40 border border-[#2b1f47]/50 rounded-[20px] overflow-hidden shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0d0b1a]/40 border-b border-[#2b1f47]/50">
                              <th className="px-6 py-4 uppercase tracking-widest text-[11px] font-bold text-zinc-400">Country / IP</th>
                              <th className="px-6 py-4 uppercase tracking-widest text-[11px] font-bold text-zinc-400">Device</th>
                              <th className="px-6 py-4 uppercase tracking-widest text-[11px] font-bold text-zinc-400">OS / Browser</th>
                              <th className="px-6 py-4 uppercase tracking-widest text-[11px] font-bold text-zinc-400">Referrer</th>
                              <th className="px-6 py-4 uppercase tracking-widest text-[11px] font-bold text-zinc-400 text-right">Created On</th>
                            </tr>
                          </thead>
                          <tbody className="text-zinc-300 text-base">
                            {allEntries.map((c) => {
                              const isMobile = c.device?.toLowerCase() === "mobile";
                              const flagCode = c.country && c.country.length === 2 ? c.country : null;
                              return (
                                <tr key={c.id} className="border-b border-[#2b1f47]/30 hover:bg-[#834dfb]/5 transition-colors duration-150">
                                  {/* Country / IP */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-6 rounded overflow-hidden flex-shrink-0 bg-[#0d0b1a] shadow-sm border border-[#2b1f47]/40">
                                        {flagCode ? (
                                          <img
                                            className="w-full h-full object-cover"
                                            src={`https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`}
                                            alt={c.country || ""}
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-[#18102b] flex items-center justify-center text-[10px] text-zinc-600 font-bold uppercase">??</div>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <div className="font-bold text-white text-base leading-snug">{c.country || "Unknown Country"}</div>
                                        <div className="text-zinc-500 text-sm font-mono leading-none">{c.ip || "Direct/Unknown IP"}</div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Device */}
                                  <td className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                      isMobile
                                        ? "bg-zinc-800/40 text-zinc-400 border border-zinc-700/60"
                                        : "bg-[#834dfb]/10 border border-[#834dfb]/30 text-[#a78bfa]"
                                    }`}>
                                      {isMobile ? <Smartphone size={14} /> : <Monitor size={14} />}
                                      <span className="uppercase tracking-wider text-[11px]">{c.device || "Unknown"}</span>
                                    </div>
                                  </td>

                                  {/* OS / Browser */}
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5 text-base">
                                      <div className="text-zinc-300 font-semibold leading-snug">{c.os || "Unknown OS"}</div>
                                      <div className="text-zinc-500 text-sm font-medium leading-none">{c.browser || "Unknown Browser"}</div>
                                    </div>
                                  </td>

                                  {/* Referrer */}
                                  <td className="px-6 py-4">
                                    {c.referrer ? (
                                      <a
                                        className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-[#834dfb] transition-colors max-w-[220px] truncate font-mono text-base font-semibold"
                                        href={c.referrer}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink size={13} className="text-[#834dfb] flex-shrink-0" />
                                        <span className="truncate">{c.referrer.replace(/^https?:\/\//, "")}</span>
                                      </a>
                                    ) : (
                                      <span className="text-zinc-500 italic text-base font-medium">Direct Traffic</span>
                                    )}
                                  </td>

                                  {/* Created On */}
                                  <td className="px-6 py-4 text-right">
                                    <span className="font-mono text-sm uppercase font-bold text-zinc-400 bg-[#18102b] border border-[#2b1f47]/50 px-3 py-1.5 rounded-lg">
                                      {timeAgo(c.createdAt)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Info (No pagination) */}
                      <div className="bg-[#0d0b1a]/40 border-t border-[#2b1f47]/50 px-6 py-4 flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Total: {totalEntries} {totalEntries === 1 ? "entry" : "entries"} tracked
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-6 w-full text-left">
                {/* General Configuration Card */}
                <div className="bg-[#120c22]/50 border border-[#2b1f47]/50 rounded-[20px] p-6 flex flex-col gap-6">
                  {/* Header Row */}
                  <div className="flex items-center gap-2 text-white border-b border-[#2b1f47]/30 pb-4">
                    <Sliders size={18} className="text-[#834dfb]" />
                    <h3 className="text-base font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
                      General Configuration
                    </h3>
                  </div>

                  {/* Preview Asset (Microlink Screenshot) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-500" style={{ fontFamily: "var(--font-syne)" }}>
                      Preview Asset
                    </span>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group overflow-hidden rounded-xl h-[220px] bg-[#0e0818] border border-[#2b1f47]/30 block cursor-pointer"
                    >
                      <img
                        src={getScreenshotUrl(link.originalUrl)}
                        alt={link.slug}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = "none";
                          if (el.parentElement) {
                            el.parentElement.style.background =
                              "linear-gradient(135deg, #1e1732 0%, #2b1f47 60%, #18102b 100%)";
                          }
                        }}
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors">
                          <span>View Link</span>
                          <ExternalLink size={14} />
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Source Destination */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-zinc-500" style={{ fontFamily: "var(--font-syne)" }}>
                      <span>Source_Destination</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-[#0e0818] border border-[#2b1f47]/50 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm">
                      <span className="truncate flex-1 pr-4" style={{ fontFamily: "var(--font-syne)" }}>{link.originalUrl}</span>
                      <button
                        onClick={handleCopyOriginal}
                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title="Copy original URL"
                      >
                        {copiedOriginal ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Redirect Alias */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-zinc-500" style={{ fontFamily: "var(--font-syne)" }}>
                      <span>Redirect_Alias</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-[#0e0818] border border-[#2b1f47]/50 rounded-lg px-4 py-3 text-[#a78bfa] font-mono text-sm">
                      <span className="truncate flex-1 pr-4">{shortUrl}</span>
                      <button
                        onClick={handleCopyShort}
                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title="Copy short URL"
                      >
                        {copiedShort ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Metadata */}
                  <div className="flex flex-col gap-2 border-t border-[#2b1f47]/30 pt-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-500" style={{ fontFamily: "var(--font-syne)" }}>
                      Timestamp_Created
                    </span>
                    <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold">
                      <Calendar size={14} className="text-[#834dfb]" />
                      <span>{new Date(link.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Critical Operations Card (Full Width) */}
                <div className="border border-red-500/30 rounded-[20px] p-6 bg-red-500/5 flex flex-col gap-4 w-full">
                  <div className="flex items-center gap-2 text-red-400 border-b border-[#2b1f47]/30 pb-4">
                    <AlertTriangle size={18} />
                    <h3 className="text-base font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
                      Critical Operations
                    </h3>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-zinc-300 text-sm font-semibold">
                        Permanently delete this link and all associated click tracking analytics.
                      </p>
                      <p className="text-red-500 text-xs font-bold uppercase tracking-wider">
                        WARNING: THIS ACTION CANNOT BE ROLLED BACK.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-5 py-2.5 border border-red-600/40 hover:border-red-500 text-red-400 hover:bg-red-500/10 rounded-[8px] transition-colors cursor-pointer flex items-center gap-2 font-bold uppercase text-xs tracking-wider"
                    >
                      <Trash2 size={15} />
                      Purge Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmDeactivateModal
        isOpen={showDeactivateModal}
        onConfirm={async () => {
          await executeToggle(false);
          setShowDeactivateModal(false);
        }}
        onCancel={() => setShowDeactivateModal(false)}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title={(() => {
          try {
            return new URL(link.originalUrl).hostname.replace("www.", "");
          } catch {
            return link.slug;
          }
        })()}
        slug={link.slug}
        originalUrl={link.originalUrl}
        clicks={link.totalClicks}
        onConfirm={async () => {
          await executeDelete();
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
