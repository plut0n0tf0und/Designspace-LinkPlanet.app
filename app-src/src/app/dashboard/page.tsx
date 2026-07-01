"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Link as LinkIcon, ExternalLink, Copy, Check, RefreshCw, Loader2, LogOut } from "lucide-react";

interface LinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  active: boolean;
  clicks: number;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [host, setHost] = useState("");

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
    // We can clear cookie by calling a logout API or client-side cookie expiration
    // Let's set it to expire in the past
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.active).length;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
              <LinkIcon size={16} />
            </div>
            <span>LinkPlanet</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your shortened URLs and review access statistics
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/create")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-sm font-semibold transition-colors shadow-sm self-start md:self-auto"
          >
            <Plus size={16} />
            Create Link
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">Total Links</span>
            <span className="text-3xl font-bold">{totalLinks}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">Active Links</span>
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeLinks}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">Total Clicks</span>
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalClicks}</span>
          </div>
        </div>

        {/* Links Table/List Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-lg">Shortened Links</h3>
            <button
              onClick={fetchLinks}
              disabled={loading}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
                <Loader2 size={32} className="animate-spin mb-4" />
                <span className="text-sm font-semibold">Loading your links...</span>
              </div>
            ) : links.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-4">
                  <LinkIcon size={24} />
                </div>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">No links created yet</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  Create a new shortened link to start sharing and capturing details analytics.
                </p>
                <button
                  onClick={() => router.push("/dashboard/create")}
                  className="mt-6 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold rounded-lg transition-colors"
                >
                  Create your first link
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-4">Short URL</th>
                    <th className="px-6 py-4">Original Destination</th>
                    <th className="px-6 py-4 text-center">Clicks</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-zinc-900 dark:text-zinc-100 font-semibold">
                        /{link.slug}
                      </td>
                      <td className="px-6 py-4 max-w-md truncate text-sm text-zinc-500 dark:text-zinc-400" title={link.originalUrl}>
                        {link.originalUrl}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {link.clicks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(link.slug, link.id)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Copy Short URL"
                          >
                            {copiedId === link.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                          </button>
                          <a
                            href={`${host}/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>

    </div>
  );
}
