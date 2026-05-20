"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import NatureScene from "@/components/NatureScene";
import { Plus, Link as LinkIcon, Home, Grid, BarChart2, Settings, Loader2 } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/links")
      .then(res => res.json())
      .then(data => {
        if (data.success) setLinks(data.links);
      })
      .catch(err => console.error("Failed to fetch links:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeLinks = links.filter(l => l.active);

  return (
    // 1. DashboardShell: Outer viewport wrapper with locked document context
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-deep)] overflow-hidden">
      
      {/* Time-Based Interactive Nature Scene (Fixed/Sticky at top viewport panel) */}
      <div className="h-[38vh] md:h-[50vh] w-full flex-shrink-0 relative overflow-hidden z-10">
        <NatureScene />
        {/* Seamless fade overlay to smoothly blur the scene into the deep background color */}
        <div className="absolute inset-x-0 bottom-0 h-12 md:h-20 bg-gradient-to-t from-[var(--bg-deep)] to-transparent pointer-events-none z-20" />
      </div>

      {/* 2. ScrollArea: Center-aligned relative scroll viewport that captures scrolling */}
      <div className="flex-1 overflow-hidden w-full md:max-w-4xl self-center z-20 relative">
        <div 
          className="w-full h-full overflow-y-auto premium-scrollbar bg-[var(--bg-deep)]"
          style={{ 
            maskImage: 'linear-gradient(to bottom, transparent, black 16px, black 100%)', 
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px, black 100%)' 
          }}
        >
          
          {/* 3. ContentWrapper */}
          <div className="w-full px-6 md:px-12 lg:px-20 pt-10 md:pt-14 pb-32 flex flex-col gap-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Welcome Greeting Header */}
              <div className="pl-4 md:pl-6">
                <h1 
                  className="font-cinzel text-3xl font-bold text-[var(--text-primary)]"
                  style={{ padding: '16px 0' }}
                >
                  Welcome back, <br className="sm:hidden"/>
                  <span className="text-[var(--accent)]">Traveler ✦</span>
                </h1>
              </div>

              {/* 4. Premium List Container */}
              <div 
                className="w-full bg-white/75 backdrop-blur-xl border border-[rgba(231,199,122,0.25)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col"
              >
                
                {/* Header panel with badge + CTA */}
                <div 
                  className="responsive-row-padding border-b border-stone-200/25 flex justify-between items-center"
                  style={{ paddingTop: '24px', paddingBottom: '8px' }}
                >
                  <h3 className="font-semibold text-sm md:text-base text-[var(--text-primary)]">Shortened Links</h3>
                  <div className="flex items-center" style={{ gap: '10px' }}>
                    <span 
                      className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-[var(--accent-glow)] rounded-full text-[#b88e3c] flex-shrink-0"
                      style={{ padding: '4px 12px' }}
                    >
                      {activeLinks.length} Active
                    </span>
                    <button 
                      onClick={() => router.push('/dashboard/create')}
                      className="primary-cta flex items-center flex-shrink-0"
                      style={{ padding: '6px 14px', gap: '6px' }}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-wider">New Link</span>
                    </button>
                  </div>
                </div>

                {/* Rows container */}
                <div className="flex flex-col">
                  {loading ? (
                    /* Loading Skeleton */
                    <div className="flex items-center justify-center" style={{ padding: '40px 0' }}>
                      <Loader2 size={20} className="animate-spin text-[var(--text-muted)]" />
                      <span className="text-[12px] font-semibold text-[var(--text-muted)] ml-2">Loading links...</span>
                    </div>
                  ) : links.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center" style={{ padding: '40px 0' }}>
                      <div className="w-12 h-12 bg-[var(--accent-glow)] text-[#b88e3c] rounded-2xl flex items-center justify-center" style={{ marginBottom: '12px' }}>
                        <LinkIcon size={22} />
                      </div>
                      <p className="text-[13px] font-semibold text-[var(--text-secondary)]">No links yet</p>
                      <p className="text-[11px] text-[var(--text-muted)]" style={{ marginTop: '4px' }}>Create your first shortened link to get started</p>
                    </div>
                  ) : (
                    /* Link Rows */
                    links.map((link, i) => (
                      <div key={link.id} className="w-full flex flex-col">
                        
                        {/* Divider line spanning edge-to-edge of the card */}
                        {i > 0 && <div className="border-t border-stone-200/20" />}
                        
                        {/* Each Link Row */}
                        <div 
                          className="group flex items-center justify-between min-h-[64px] md:min-h-[72px] responsive-row-padding hover:bg-[rgba(231,199,122,0.06)] transition-all duration-[180ms] ease-out cursor-pointer hover:shadow-[0_4px_12px_rgba(231,199,122,0.03)]"
                        >
                          {/* Left Side: Icon + URL */}
                          <div className="flex items-center gap-[14px]">
                            <div className="w-10 h-10 flex-shrink-0 bg-[var(--accent-glow)] text-[#b88e3c] rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                              <LinkIcon size={18} />
                            </div>
                            <div className="flex flex-col">
                              <p className="text-[13px] md:text-sm font-semibold text-[var(--text-primary)] tracking-wide">
                                myoffer.link/{link.slug}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)] font-medium" style={{ marginTop: '2px' }}>
                                {link.originalUrl.length > 40 ? link.originalUrl.substring(0, 40) + '...' : link.originalUrl}
                              </p>
                            </div>
                          </div>
                          {/* Right Side: Click Count */}
                          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex-shrink-0">
                            {link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Nav Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-nav rounded-2xl p-4 flex justify-between items-center z-50 md:hidden">
        <button className="nav-btn active"><Home size={22} /></button>
        <button className="nav-btn"><Grid size={22} /></button>
        <button className="nav-btn"><BarChart2 size={22} /></button>
        <button className="nav-btn"><Settings size={22} /></button>
      </div>
    </div>
  );
}
