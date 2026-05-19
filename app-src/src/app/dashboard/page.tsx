"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import NatureScene from "@/components/NatureScene";
import { Plus, Link as LinkIcon, Home, Grid, BarChart2, Settings } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const dummyLinks = [
    { slug: "myoffer.link/abc123", clicks: 4320 },
    { slug: "myoffer.link/xyz789", clicks: 2980 },
    { slug: "myoffer.link/hello10", clicks: 1850 },
    { slug: "myoffer.link/promo24", clicks: 940 },
    { slug: "myoffer.link/vip", clicks: 520 },
  ];

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
          
          {/* 3. ContentWrapper: left padding = right padding + scrollbar gutter (6px) so content stays visually centered */}
          {/* Using standard Tailwind classes to ensure reliable JIT compilation */}
          <div className="w-full px-6 md:px-12 lg:px-20 pt-10 md:pt-14 pb-32 flex flex-col gap-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Welcome Greeting Header - indents beautifully to align perfectly with the list content icons (40px mobile / 104px desktop from viewport edge) */}
              <div className="pl-4 md:pl-6">
                <h1 
                  className="font-cinzel text-3xl font-bold text-[var(--text-primary)]"
                  style={{ padding: '16px 0' }}
                >
                  Welcome back, <br className="sm:hidden"/>
                  <span className="text-[var(--accent)]">Traveler ✦</span>
                </h1>
              </div>

              {/* 4. Apple/Airbnb Style Premium List Container */}
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
                      {dummyLinks.length} Active
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
                  {dummyLinks.map((link, i) => (
                    <div key={link.slug} className="w-full flex flex-col">
                      
                      {/* Divider line spanning edge-to-edge of the card */}
                      {i > 0 && <div className="border-t border-stone-200/20" />}
                      
                      {/* Each Link Row: min-height 64px mobile / 72px desktop */}
                      {/* Responsive inner padding (16px mobile, 24px tablet, 32px PC) forced via raw CSS */}
                      <div 
                        className="group flex items-center justify-between min-h-[64px] md:min-h-[72px] responsive-row-padding hover:bg-[rgba(231,199,122,0.06)] transition-all duration-[180ms] ease-out cursor-pointer hover:shadow-[0_4px_12px_rgba(231,199,122,0.03)]"
                      >
                        {/* Left Side: Icon + URL (gap between icon and url: 14px) */}
                        <div className="flex items-center gap-[14px]">
                          {/* Link Icon Capsule */}
                          <div className="w-10 h-10 flex-shrink-0 bg-[var(--accent-glow)] text-[#b88e3c] rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                            <LinkIcon size={18} />
                          </div>
                          
                          {/* Slug Details */}
                          <div className="flex flex-col">
                            <p className="text-[13px] md:text-sm font-semibold text-[var(--text-primary)] tracking-wide">{link.slug}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
