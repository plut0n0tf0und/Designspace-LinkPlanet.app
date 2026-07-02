"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, ReferenceDot,
  PieChart, Pie, Cell,
} from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TimePoint { date: string; views: number }
interface Breakdown  { name: string; views: number }
interface Props {
  timeSeries: { month: TimePoint[]; year: TimePoint[]; all: TimePoint[] };
  countriesBreakdown: Breakdown[];
  devicesBreakdown:   Breakdown[];
  onMapTabClick:      () => void;
}
type Filter = "month" | "year" | "all";

// ── Palette ───────────────────────────────────────────────────────────────────

const COUNTRY_COLORS = ["#834dfb","#a78bfa","#6366f1","#818cf8","#c084fc","#7c3aed","#94a3b8"];
const DEVICE_COLORS: Record<string,string> = { Mobile:"#834dfb", Desktop:"#6366f1", Tablet:"#a78bfa", Unknown:"#374151" };
const DEVICE_FALLBACK = "#4b5563";
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO alpha-2 → alpha-3
const A2_TO_A3: Record<string,string> = {
  AF:"AFG",AL:"ALB",DZ:"DZA",AO:"AGO",AR:"ARG",AM:"ARM",AU:"AUS",AT:"AUT",AZ:"AZE",
  BH:"BHR",BD:"BGD",BY:"BLR",BE:"BEL",BJ:"BEN",BO:"BOL",BA:"BIH",BW:"BWA",BR:"BRA",
  BN:"BRN",BG:"BGR",KH:"KHM",CM:"CMR",CA:"CAN",CF:"CAF",TD:"TCD",CL:"CHL",CN:"CHN",
  CO:"COL",CD:"COD",CR:"CRI",HR:"HRV",CU:"CUB",CY:"CYP",CZ:"CZE",DK:"DNK",DO:"DOM",
  EC:"ECU",EG:"EGY",SV:"SLV",ET:"ETH",FJ:"FJI",FI:"FIN",FR:"FRA",GA:"GAB",GE:"GEO",
  DE:"DEU",GH:"GHA",GR:"GRC",GT:"GTM",GN:"GIN",HT:"HTI",HN:"HND",HU:"HUN",IS:"ISL",
  IN:"IND",ID:"IDN",IR:"IRN",IQ:"IRQ",IE:"IRL",IL:"ISR",IT:"ITA",JM:"JAM",JP:"JPN",
  JO:"JOR",KZ:"KAZ",KE:"KEN",KP:"PRK",KR:"KOR",KW:"KWT",KG:"KGZ",LA:"LAO",LV:"LVA",
  LB:"LBN",LY:"LBY",LT:"LTU",LU:"LUX",MG:"MDG",MY:"MYS",ML:"MLI",MX:"MEX",MD:"MDA",
  MN:"MNG",ME:"MNE",MA:"MAR",MZ:"MOZ",MM:"MMR",NA:"NAM",NP:"NPL",NL:"NLD",NZ:"NZL",
  NI:"NIC",NE:"NER",NG:"NGA",NO:"NOR",OM:"OMN",PK:"PAK",PA:"PAN",PG:"PNG",PY:"PRY",
  PE:"PER",PH:"PHL",PL:"POL",PT:"PRT",QA:"QAT",RO:"ROU",RU:"RUS",RW:"RWA",SA:"SAU",
  SN:"SEN",RS:"SRB",SG:"SGP",SK:"SVK",SI:"SVN",SO:"SOM",ZA:"ZAF",ES:"ESP",LK:"LKA",
  SD:"SDN",SE:"SWE",CH:"CHE",SY:"SYR",TW:"TWN",TJ:"TJK",TZ:"TZA",TH:"THA",TG:"TGO",
  TN:"TUN",TR:"TUR",TM:"TKM",UG:"UGA",UA:"UKR",AE:"ARE",GB:"GBR",US:"USA",UY:"URY",
  UZ:"UZB",VE:"VEN",VN:"VNM",YE:"YEM",ZM:"ZMB",ZW:"ZWE",
};

// ── Mini Map ──────────────────────────────────────────────────────────────────

function MiniMap({ highlightedCountries }: { highlightedCountries: string[] }) {
  const highlighted = new Set(highlightedCountries.map(c => A2_TO_A3[c] ?? c));
  return (
    <ComposableMap
      projectionConfig={{ scale: 120, center: [0, 10] }}
      style={{ width: "100%", height: "auto", display: "block" }}
      height={110}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }: { geographies: any[] }) =>
          geographies.map((geo: any) => {
            const isHit = highlighted.has(geo.properties?.ADM0_A3 ?? geo.id);
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: isHit ? "#834dfb" : "#1e1535", stroke: "#0d0b1a", strokeWidth: 0.4, outline: "none" },
                  hover:   { fill: isHit ? "#a78bfa" : "#2b1f47", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtXLabel(date: string, filter: Filter): string {
  if (filter === "all") {
    const [y, m] = date.split("-");
    const mon = new Date(+y, +m - 1).toLocaleString("en", { month: "short" });
    return `${mon.toUpperCase()} ${y.slice(2)}`;
  }
  const d = new Date(date);
  return `${d.toLocaleString("en", { month: "short" }).toUpperCase()} ${d.getDate()}`;
}

function fmtYLabel(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return String(v);
}

function periodLabel(f: Filter): string {
  return f === "month" ? "last 30 days" : f === "year" ? "last 12 months" : "all time";
}

// ── Tooltips ──────────────────────────────────────────────────────────────────

function LineTooltip({ active, payload, label, filter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#15112b", border:"1px solid rgba(131,77,251,0.3)", borderRadius:10, padding:"10px 14px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
      <p style={{ color:"#71717a", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>
        {fmtXLabel(label, filter)}
      </p>
      <p style={{ color:"#fff", fontWeight:700, fontSize:16, lineHeight:1 }}>
        {payload[0].value.toLocaleString()}
        <span style={{ color:"#71717a", fontSize:11, fontWeight:400, marginLeft:4 }}>views</span>
      </p>
    </div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background:"#1a1030", border:"1px solid rgba(43,31,71,0.8)", borderRadius:12, padding:"10px 14px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
      <p style={{ color:"#a1a1aa", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{d.name}</p>
      <p style={{ color:"#fff", fontWeight:700, fontSize:15, lineHeight:1 }}>
        {d.value.toLocaleString()}
        <span style={{ color:"#71717a", fontSize:11, fontWeight:400, marginLeft:4 }}>views</span>
      </p>
    </div>
  );
}

// ── Peak annotation ───────────────────────────────────────────────────────────

function PeakLabel({ viewBox }: any) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g>
      <line x1={cx} y1={cy - 10} x2={cx} y2={cy - 36} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 3" />
      <text x={cx} y={cy - 42} textAnchor="middle" fill="#a78bfa" fontSize={10} fontWeight={700} letterSpacing={1.5} style={{ textTransform:"uppercase", fontFamily:"inherit" }}>
        PEAK VIEW
      </text>
    </g>
  );
}

// ── Filter pills ──────────────────────────────────────────────────────────────

function FilterGroup({ filter, onChange }: { filter: Filter; onChange: (f: Filter) => void }) {
  const opts: { key: Filter; label: string }[] = [
    { key:"month", label:"MONTH" }, { key:"year", label:"YEAR" }, { key:"all", label:"ALL" },
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", background:"rgba(14,8,24,0.7)", borderRadius:999, padding:"3px", gap:2 }}>
      {opts.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)} style={{
          padding:"6px 16px", borderRadius:999, fontSize:12, fontWeight:700,
          letterSpacing:"0.08em", border:"none", cursor:"pointer", transition:"all 0.2s ease",
          background: filter === key ? "#834dfb" : "transparent",
          color: filter === key ? "#fff" : "#71717a",
          boxShadow: filter === key ? "0 0 14px rgba(131,77,251,0.45)" : "none",
        }}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Donut legend ──────────────────────────────────────────────────────────────

function DonutLegend({ data, colors }: { data: Breakdown[]; colors: string[] | Record<string,string> }) {
  const total = data.reduce((s, d) => s + d.views, 0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:16 }}>
      {data.map((d, i) => {
        const color = Array.isArray(colors) ? colors[i % colors.length] : (colors as Record<string,string>)[d.name] ?? DEVICE_FALLBACK;
        const pct = total > 0 ? Math.round((d.views / total) * 100) : 0;
        return (
          <div key={d.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* Color dot */}
            <span style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:color, display:"inline-block" }} />
            {/* Name */}
            <span style={{ color:"#d4d4d8", fontSize:13, fontWeight:500, flex:1 }}>{d.name}</span>
            {/* View count — prominent */}
            <span style={{ color:"#d4d4d8", fontSize:13, fontWeight:700 }}>{d.views.toLocaleString()} views</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#52525b", fontSize:14 }}>No {label} data yet</div>;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LinkAnalyticsCharts({ timeSeries, countriesBreakdown, devicesBreakdown, onMapTabClick }: Props) {
  const [filter, setFilter] = useState<Filter>("month");
  const [mapHovered, setMapHovered] = useState(false);

  const series      = timeSeries[filter];
  const hasTimeSeries = series.some(p => p.views > 0);
  const hasCountries  = countriesBreakdown.length > 0;
  const hasDevices    = devicesBreakdown.length > 0;

  const peak  = useMemo(() => !series.length ? null : series.reduce((mx, p) => p.views > mx.views ? p : mx, series[0]), [series]);
  const total = series.reduce((s, p) => s + p.views, 0);

  const tickStep = Math.max(1, Math.floor(series.length / 7));
  const ticks    = series.filter((_, i) => i % tickStep === 0).map(p => p.date);

  const cardStyle = { background:"#0d0b1a", border:"1px solid rgba(43,31,71,0.5)", borderRadius:20, padding:24 } as const;
  const labelStyle = { fontSize:12, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.12em", color:"#71717a" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Row 1 — Line chart */}
      <div style={{ ...cardStyle, padding:"28px 28px 20px 28px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <p style={{ ...labelStyle, marginBottom:6 }}>Views Over Time</p>
            <p style={{ fontSize:42, fontWeight:800, color:"#fff", lineHeight:1, display:"flex", alignItems:"baseline", gap:10 }}>
              {total.toLocaleString()}
              <span style={{ fontSize:14, fontWeight:400, color:"#71717a" }}>{periodLabel(filter)}</span>
            </p>
          </div>
          <FilterGroup filter={filter} onChange={setFilter} />
        </div>

        <div style={{ height:200 }}>
          {!hasTimeSeries ? <EmptyState label="views" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top:60, right:8, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4c2f8a" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#0d0b1a" stopOpacity={0} />
                  </linearGradient>
                  <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <XAxis dataKey="date" ticks={ticks} tickFormatter={v => fmtXLabel(v, filter)}
                  tick={{ fill:"#71717a", fontSize:12, fontWeight:600, fontFamily:"inherit" }}
                  axisLine={false} tickLine={false} dy={8} />
                <YAxis tickFormatter={fmtYLabel}
                  tick={{ fill:"#71717a", fontSize:12, fontWeight:600, fontFamily:"inherit" }}
                  axisLine={false} tickLine={false} width={40} tickCount={3} allowDecimals={false} />
                <Tooltip content={(p) => <LineTooltip {...p} filter={filter} />}
                  cursor={{ stroke:"rgba(131,77,251,0.25)", strokeWidth:1, strokeDasharray:"4 3" }} />
                <Area type="linear" dataKey="views" stroke="#b09af5" strokeWidth={1.8}
                  fill="url(#peakGrad)" dot={false}
                  activeDot={{ r:4, fill:"#b09af5", strokeWidth:2, stroke:"#0d0b1a" }}
                  style={{ filter:"url(#lineGlow)" }} />
                {peak && peak.views > 0 && (
                  <ReferenceDot x={peak.date} y={peak.views} r={5}
                    fill="#b09af5" stroke="#0d0b1a" strokeWidth={2}
                    label={<PeakLabel />} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2 — Countries + Devices */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20 }}>

        {/* Countries bar chart */}
        <div style={{ ...cardStyle, display:"flex", flexDirection:"column" }}>
          <p style={{ ...labelStyle, marginBottom:20 }}>Views by Country</p>

          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", gap:16 }}>
            {!hasCountries ? (
              <div style={{ textAlign:"center", color:"#52525b", fontSize:14 }}>No country data yet</div>
            ) : countriesBreakdown.slice(0, 3).map((d, i) => {
              const ctTotal = countriesBreakdown.reduce((s, c) => s + c.views, 0);
              const pct = ctTotal > 0 ? Math.round((d.views / ctTotal) * 100) : 0;
              const color = COUNTRY_COLORS[i % COUNTRY_COLORS.length];
              return (
                <div key={d.name} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontFamily:"monospace", fontSize:13, color:"#a1a1aa", fontWeight:500, minWidth:80, flexShrink:0 }}>{d.name}</span>
                  <div style={{ flex:1, height:8, background:"rgba(43,31,71,0.5)", borderRadius:999, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg, ${color}, #c4b5fd)`, borderRadius:999, transition:"width 0.6s ease" }} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:"#a1a1aa", minWidth:36, textAlign:"right", flexShrink:0 }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Mini map with hover overlay — pure React state, no Tailwind conflict */}
          <div
            onClick={onMapTabClick}
            onMouseEnter={() => setMapHovered(true)}
            onMouseLeave={() => setMapHovered(false)}
            style={{
              marginTop:20, width:"100%", position:"relative",
              background:"rgba(43,31,71,0.25)",
              border:`1px solid ${mapHovered ? "rgba(131,77,251,0.5)" : "rgba(43,31,71,0.6)"}`,
              borderRadius:12, overflow:"hidden", cursor:"pointer",
              transition:"border-color 0.2s",
            }}
          >
            <MiniMap highlightedCountries={countriesBreakdown.slice(0, 3).map(d => d.name)} />
            {/* Overlay — controlled by React state, no CSS class conflict */}
            <div style={{
              position:"absolute", inset:0,
              background:"rgba(13,11,26,0.75)",
              backdropFilter:"blur(3px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              borderRadius:12,
              opacity: mapHovered ? 1 : 0,
              transition:"opacity 0.2s ease",
              pointerEvents:"none",
            }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", color:"#a78bfa", textTransform:"uppercase" }}>
                View Full Map →
              </span>
            </div>
          </div>
        </div>

        {/* Devices donut */}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom:20 }}>Views by Device</p>
          {!hasDevices ? (
            <div style={{ height:180 }}><EmptyState label="device" /></div>
          ) : (
            <>
              <div style={{ height:180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={devicesBreakdown} dataKey="views" nameKey="name"
                      cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" paddingAngle={3} strokeWidth={0}>
                      {devicesBreakdown.map((d, i) => <Cell key={i} fill={DEVICE_COLORS[d.name] ?? DEVICE_FALLBACK} />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <DonutLegend data={devicesBreakdown} colors={DEVICE_COLORS} />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
