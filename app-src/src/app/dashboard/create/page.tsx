"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Link as LinkIcon, Sparkles, Copy, Check,
  BarChart3, Globe, MousePointerClick, Clock, Smartphone, MapPin,
  Home, Grid, BarChart2, Settings
} from "lucide-react";

export default function CreateLink() {
  const router = useRouter();
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const domain = "myoffer.link";

  const handleGenerate = async () => {
    if (!longUrl.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const slug = customSlug.trim() || Math.random().toString(36).substring(2, 8);
    setGeneratedLink(`${domain}/${slug}`);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValid = longUrl.trim().length > 0;

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-deep)] overflow-hidden">

      {/* Full-height ScrollArea — no NatureScene on inner pages */}
      <div className="flex-1 overflow-hidden w-full md:max-w-4xl self-center relative">
        <div className="w-full h-full overflow-y-auto premium-scrollbar bg-[var(--bg-deep)]">
          <div className="w-full px-6 md:px-12 lg:px-20 pt-10 md:pt-14 pb-32 flex flex-col">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Back Button + Page Title */}
              <div className="pl-4 md:pl-6" style={{ padding: '16px 0' }}>
                <button 
                  onClick={() => router.back()}
                  className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
                  style={{ gap: '8px', marginBottom: '8px' }}
                >
                  <ArrowLeft size={16} strokeWidth={2.5} />
                  <span className="text-[12px] font-bold uppercase tracking-wider">Back</span>
                </button>
                <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                  Create New Link
                </h1>
              </div>

              {/* ============================================ */}
              {/* FORM CARD: Long URL + Custom Endpoint        */}
              {/* ============================================ */}
              <div 
                className="w-full bg-white/75 backdrop-blur-xl border border-[rgba(231,199,122,0.25)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div 
                  className="responsive-row-padding border-b border-stone-200/25 flex items-center"
                  style={{ paddingTop: '24px', paddingBottom: '8px', gap: '10px' }}
                >
                  <LinkIcon size={16} className="text-[#b88e3c]" />
                  <h3 className="font-semibold text-sm md:text-base text-[var(--text-primary)]">Link Details</h3>
                </div>

                {/* Form Fields */}
                <div className="responsive-row-padding flex flex-col" style={{ padding: '24px 0' }}>
                  
                  {/* Long URL Input */}
                  <div className="responsive-row-padding flex flex-col" style={{ gap: '8px', paddingTop: '0', paddingBottom: '20px' }}>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Destination URL
                    </label>
                    <input
                      type="url"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                      placeholder="https://example.com/your-very-long-url-here"
                      className="lp-input"
                      style={{ padding: '14px 16px' }}
                    />
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                      Paste the long URL you want to shorten
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-stone-200/20" />

                  {/* Custom Slug Input */}
                  <div className="responsive-row-padding flex flex-col" style={{ gap: '8px', paddingTop: '20px', paddingBottom: '0' }}>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Custom Endpoint <span className="text-[var(--text-muted)] normal-case tracking-normal">(optional)</span>
                    </label>
                    <div className="flex items-center" style={{ gap: '0' }}>
                      <span 
                        className="text-[13px] font-semibold text-[#b88e3c] flex-shrink-0 bg-[var(--accent-glow)] rounded-l-xl border border-r-0 border-[rgba(231,199,122,0.2)]"
                        style={{ padding: '14px 12px' }}
                      >
                        {domain}/
                      </span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="my-custom-link"
                        className="lp-input"
                        style={{ padding: '14px 16px', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                      Leave empty to auto-generate a short code
                    </p>
                  </div>
                </div>

                {/* Generate CTA */}
                <div 
                  className="responsive-row-padding border-t border-stone-200/25 flex justify-end"
                  style={{ paddingTop: '16px', paddingBottom: '20px' }}
                >
                  <button
                    onClick={handleGenerate}
                    disabled={!isValid || isGenerating}
                    className="primary-cta flex items-center"
                    style={{ padding: '10px 24px', gap: '8px', opacity: isValid ? 1 : 0.5 }}
                  >
                    {isGenerating ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} strokeWidth={2.5} />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Generate Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ============================================ */}
              {/* RESULT CARD: Generated Short Link            */}
              {/* ============================================ */}
              {generatedLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full bg-white/75 backdrop-blur-xl border border-[rgba(231,199,122,0.25)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col"
                  style={{ marginTop: '16px' }}
                >
                  {/* Result Header */}
                  <div 
                    className="responsive-row-padding border-b border-stone-200/25 flex justify-between items-center"
                    style={{ paddingTop: '24px', paddingBottom: '8px' }}
                  >
                    <div className="flex items-center" style={{ gap: '10px' }}>
                      <Check size={16} className="text-[var(--success)]" />
                      <h3 className="font-semibold text-sm md:text-base text-[var(--text-primary)]">Your Link is Ready</h3>
                    </div>
                    <span 
                      className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-[rgba(56,161,105,0.15)] rounded-full text-[var(--success)] flex-shrink-0"
                      style={{ padding: '4px 12px' }}
                    >
                      Live
                    </span>
                  </div>

                  {/* Generated Link Display */}
                  <div 
                    className="responsive-row-padding flex items-center justify-between"
                    style={{ paddingTop: '20px', paddingBottom: '20px' }}
                  >
                    <div className="flex items-center" style={{ gap: '14px' }}>
                      <div 
                        className="w-10 h-10 flex-shrink-0 bg-[var(--accent-glow)] text-[#b88e3c] rounded-xl flex items-center justify-center"
                      >
                        <LinkIcon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[14px] md:text-[16px] font-bold text-[var(--text-primary)] tracking-wide">
                          {generatedLink}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium" style={{ marginTop: '2px' }}>
                          → {longUrl.length > 50 ? longUrl.substring(0, 50) + '...' : longUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="primary-cta flex items-center flex-shrink-0"
                      style={{ padding: '8px 16px', gap: '6px' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* ANALYTICS PREVIEW (DISABLED / PLACEHOLDER)   */}
              {/* ============================================ */}
              <div 
                className="w-full bg-white/75 backdrop-blur-xl border border-[rgba(231,199,122,0.25)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col analytics-disabled"
                style={{ marginTop: '16px' }}
              >
                {/* Analytics Badge Overlay */}
                <span className="analytics-badge">Coming Soon</span>

                {/* Analytics Header */}
                <div 
                  className="responsive-row-padding border-b border-stone-200/25 flex items-center"
                  style={{ paddingTop: '24px', paddingBottom: '8px', gap: '10px' }}
                >
                  <BarChart3 size={16} className="text-[#b88e3c]" />
                  <h3 className="font-semibold text-sm md:text-base text-[var(--text-primary)]">Analytics & Tracking</h3>
                </div>

                {/* Stats Grid */}
                <div 
                  className="responsive-row-padding grid grid-cols-2 md:grid-cols-4"
                  style={{ padding: '20px 0', gap: '0' }}
                >
                  {/* Total Clicks */}
                  <div className="responsive-row-padding flex flex-col items-center justify-center border-r border-b md:border-b-0 border-stone-200/20" style={{ padding: '16px 0' }}>
                    <MousePointerClick size={20} className="text-[var(--text-muted)]" />
                    <p className="text-[20px] font-bold text-[var(--text-primary)]" style={{ marginTop: '8px' }}>0</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Clicks</p>
                  </div>

                  {/* Unique Visitors */}
                  <div className="responsive-row-padding flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-200/20" style={{ padding: '16px 0' }}>
                    <Globe size={20} className="text-[var(--text-muted)]" />
                    <p className="text-[20px] font-bold text-[var(--text-primary)]" style={{ marginTop: '8px' }}>0</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Unique Visitors</p>
                  </div>

                  {/* Top Device */}
                  <div className="responsive-row-padding flex flex-col items-center justify-center border-r border-stone-200/20" style={{ padding: '16px 0' }}>
                    <Smartphone size={20} className="text-[var(--text-muted)]" />
                    <p className="text-[14px] font-bold text-[var(--text-primary)]" style={{ marginTop: '8px' }}>—</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Top Device</p>
                  </div>

                  {/* Top Location */}
                  <div className="responsive-row-padding flex flex-col items-center justify-center" style={{ padding: '16px 0' }}>
                    <MapPin size={20} className="text-[var(--text-muted)]" />
                    <p className="text-[14px] font-bold text-[var(--text-primary)]" style={{ marginTop: '8px' }}>—</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Top Location</p>
                  </div>
                </div>

                {/* Placeholder Chart Area */}
                <div className="responsive-row-padding border-t border-stone-200/20" style={{ padding: '24px 0' }}>
                  <div className="responsive-row-padding">
                    <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                      <div className="flex items-center" style={{ gap: '8px' }}>
                        <Clock size={14} className="text-[var(--text-muted)]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Click Timeline (7 days)
                        </span>
                      </div>
                    </div>
                    {/* Fake chart bars */}
                    <div className="flex items-end" style={{ gap: '4px', height: '80px' }}>
                      {[20, 35, 15, 50, 40, 25, 30].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-[var(--accent-glow)] rounded-t-md" 
                          style={{ height: `${h}%`, opacity: 0.5 }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between" style={{ marginTop: '8px' }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <span key={day} className="text-[9px] font-bold text-[var(--text-muted)] flex-1 text-center">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Nav Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-nav rounded-2xl p-4 flex justify-between items-center z-50 md:hidden">
        <button onClick={() => router.push('/dashboard')} className="nav-btn"><Home size={22} /></button>
        <button className="nav-btn"><Grid size={22} /></button>
        <button className="nav-btn"><BarChart2 size={22} /></button>
        <button className="nav-btn"><Settings size={22} /></button>
      </div>
    </div>
  );
}
