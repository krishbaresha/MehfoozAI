
"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

/* Leaflet must be loaded client-side only (no SSR) */
const LiveSafetyMap = dynamic(() => import('./LiveSafetyMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      padding: '16px 26px 20px', display: 'flex', flex: 1,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #2dd4bf',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <div style={{ fontSize: 13, color: '#2dd4bf' }}>Loading map…</div>
      </div>
    </div>
  ),
});





/* ─── TWEAK DEFAULTS ────────────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#e8637a",
  "density": "comfortable",
  "showUrdu": true,
  "animationsOn": true
}/*EDITMODE-END*/;

/* ─── PALETTE (JS mirrors CSS vars for dynamic use) ────────────────────── */
const C = {
  midnight:"#0b0f1a", deep:"#111827", surface:"#1a2236", surface2:"#212d45",
  border:"rgba(255,255,255,0.07)", border2:"rgba(255,255,255,0.12)",
  rose:"#e8637a", roseLight:"#f28fa0", roseDim:"rgba(232,99,122,0.15)",
  amber:"#f5a623", amberDim:"rgba(245,166,35,0.15)",
  teal:"#2dd4bf", tealDim:"rgba(45,212,191,0.12)",
  lavender:"#a78bfa", lavenderDim:"rgba(167,139,250,0.12)",
  text:"#f0f4ff", text2:"#8b9bb4", text3:"#4a5568",
  green:"#34d399", greenDim:"rgba(52,211,153,0.12)",
  red:"#f87171",
};

/* Mock data has been removed to use live database data exclusively. */

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
const ICONS = {
  shield:   `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  message:  `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  file:     `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
  map:      `<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>`,
  alert:    `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  check:    `<polyline points="20 6 9 17 4 12"/>`,
  clock:    `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  pin:      `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  scale:    `<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
  users:    `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  trend:    `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  eye:      `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  lock:     `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  grid:     `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
  chevronL: `<polyline points="15 18 9 12 15 6"/>`,
  wa:       null, // custom below
};

const Ico = ({ name, size=18, color="currentColor", style:s }) => {
  if (name === "wa") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={s}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}
      dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />
  );
};

/* ─── SHARED COMPONENTS ──────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:  { label:"Pending",  bg:C.amberDim,    color:C.amber,    dot:true },
    drafted:  { label:"Drafted",  bg:C.lavenderDim, color:C.lavender, dot:true },
    routed:   { label:"Routed",   bg:C.tealDim,     color:C.teal,     dot:false },
    closed:   { label:"Solved",   bg:C.greenDim,    color:C.green,    dot:false },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
      borderRadius:20, background:c.bg, color:c.color,
      fontSize:10, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
      {c.dot && <span style={{ width:5, height:5, borderRadius:"50%", background:c.color, flexShrink:0, animation:"pulse 2s infinite" }} />}
      {c.label}
    </span>
  );
};

const UrgencyDot = ({ urgency }) => {
  const colors = { low:C.green, medium:C.amber, high:C.rose, critical:C.red };
  return <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%",
    background:colors[urgency]||C.green, flexShrink:0 }} />;
};

const Card = ({ children, style:s, className }) => (
  <div className={className} style={{ background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:16, ...s }}>{children}</div>
);

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */
const Sidebar = ({ active, setActive, caseCount }) => {
  const NAV = [
    { id:"dashboard", icon:"grid",    label:"Overview" },
    { id:"whatsapp",  icon:"wa",      label:"WhatsApp Intake" },
    { id:"cases",     icon:"file",    label:"Case Tracker",   badge: caseCount > 0 ? caseCount : null },
    { id:"fir",       icon:"scale",   label:"FIR Viewer" },
    { id:"heatmap",   icon:"map",     label:"Safety Map" },
    { id:"solved",    icon:"check",   label:"Solved Cases" },
  ];

  return (
    <div style={{ width:216, background:C.deep, borderRight:`1px solid ${C.border}`,
      display:"flex", flexDirection:"column", flexShrink:0, height:"100vh" }}>
    {/* Logo */}
    <div style={{ padding:"22px 18px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
          background:"linear-gradient(135deg,#e8637a,#b5395a)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 14px rgba(232,99,122,0.4)" }}>
          <Ico name="shield" size={17} color="white" />
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, fontFamily:"var(--font-display)",
            letterSpacing:"-0.02em", color:C.text, lineHeight:1 }}>MehfoozAI</div>
          <div style={{ fontSize:10, color:C.text3, letterSpacing:"0.07em",
            textTransform:"uppercase", marginTop:2 }}>Women's Safety</div>
        </div>
      </div>
      {/* Mobile close button */}
      <button className="mobile-only" onClick={() => setActive('close')} style={{ background:"transparent", border:"none", color:C.text2, cursor:"pointer", padding:5 }}>
        <Ico name="chevronL" size={20} />
      </button>
    </div>

    {/* Nav */}
    <nav style={{ padding:"10px 8px", flex:1, display:"flex", flexDirection:"column", gap:2 }}>
      {NAV.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} className="nav-btn"
            onClick={() => setActive(item.id)}
            style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px",
              borderRadius:10, border:"none", cursor:"pointer", width:"100%", textAlign:"left",
              fontFamily:"var(--font-body)", fontSize:13, fontWeight: isActive ? 600 : 400,
              background: isActive ? C.roseDim : "transparent",
              color: isActive ? C.roseLight : C.text2 }}>
            <span style={{ opacity: isActive ? 1 : 0.55, flexShrink:0 }}>
              <Ico name={item.icon} size={15} color="currentColor" />
            </span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ background:C.rose, color:"white", borderRadius:10,
                fontSize:9, fontWeight:700, padding:"1px 6px", minWidth:18, textAlign:"center" }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    {/* Public Landing Link */}
    <div style={{ padding:"0 8px 10px" }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px",
              borderRadius:10, textDecoration: "none", width:"100%", textAlign:"left",
              fontFamily:"var(--font-body)", fontSize:13, color: C.text3 }}>
            <span style={{ opacity: 0.55, flexShrink:0 }}>
              <Ico name="chevronL" size={15} color="currentColor" />
            </span>
            <span>Public Landing</span>
      </Link>
    </div>

    {/* Status footer */}
    <div style={{ padding:"12px 14px", borderTop:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 10px",
        borderRadius:8, background:C.tealDim, border:`1px solid rgba(45,212,191,0.15)` }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:C.teal,
          animation:"pulse 2s infinite", flexShrink:0 }} />
        <span style={{ fontSize:11, color:C.teal, fontWeight:500 }}>System Active</span>
        <Ico name="lock" size={11} color={C.teal} style={{ marginLeft:"auto", opacity:0.7 }} />
      </div>
      <div style={{ marginTop:8, fontSize:11, color:C.text3, lineHeight:1.6, paddingLeft:2 }}>
        All data encrypted · Identity protected
      </div>
    </div>
  </div>
);
};

/* ─── TOP BAR ─────────────────────────────────────────────────────────────── */
const TopBar = ({ title, subtitle, activeCount = 0, onMenuClick, isMobile }) => (
  <header style={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: isMobile ? "14px 18px" : "16px 26px",
    background: "rgba(10, 11, 15, 0.4)",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${C.border}`,
    width: "100%",
    zIndex: 10
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {isMobile && (
        <button onClick={onMenuClick} style={{ 
          background: C.surface, 
          border: `1px solid ${C.border}`, 
          borderRadius: 8, 
          padding: 8, 
          color: C.text2, 
          cursor: "pointer",
          display: "flex",
          alignItems: "center"
        }}>
          <Ico name="grid" size={20} />
        </button>
      )}
      <div>
        <h1 style={{ fontSize: isMobile ? 18 : 21, fontWeight: 700, fontFamily: "var(--font-display)",
          letterSpacing: "-0.025em", color: C.text, lineHeight: 1.1 }}>{title}</h1>
        {subtitle && !isMobile && <p style={{ fontSize: 12.5, color: C.text2, marginTop: 4 }}>{subtitle}</p>}
      </div>
    </div>

    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <div className="hide-mobile" style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px",
        background:C.deep, borderRadius:20, border:`1px solid ${C.border}` }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:C.teal, animation:"pulse 2s infinite" }} />
        <span style={{ fontSize:10.5, color:C.teal, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>Live Sync</span>
      </div>
      
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px",
        background:C.roseDim, borderRadius:20, border:`1px solid rgba(232,99,122,0.22)` }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:C.rose, animation:"pulse 1.5s infinite" }} />
        <span style={{ fontSize:11.5, color:C.roseLight, fontWeight:500 }}>{activeCount} Alert{activeCount !== 1 ? 's' : ''}</span>
      </div>

      {!isMobile && (
        <div style={{ width:32, height:32, borderRadius:"50%", background:C.surface2,
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:`1px solid ${C.border2}` }}>
          <Ico name="users" size={18} color={C.text2} />
        </div>
      )}
    </div>
  </header>
);

/* ─── DASHBOARD SCREEN ───────────────────────────────────────────────────── */
const DashboardScreen = ({ apiData, isMobile }) => {
  const { stats: s, cases } = apiData;
  const stats = [
    { label:"Total Cases",   value:s.total_reports || "0", sub:"overall",         icon:"file",  color:C.rose,    trend:null },
    { label:"Cases Routed",  value:s.cases_routed || "0",  sub:"action taken",    icon:"check", color:C.green,   trend:null },
    { label:"FIRs Drafted",  value:s.firs_generated || "0",sub:"ready to dispatch",icon:"clock", color:C.amber,   trend:null },
    { label:"Heatmap Zones", value:s.heatmap_points || "0",sub:"active clusters", icon:"alert", color:C.red,     trend:null },
  ];

  const activity = cases.length > 0 ? cases.slice(0, 5).map(c => ({
    title: c.type,
    summary: c.summary || "No summary available.",
    time: "Just now",
    id: c.id,
    status: c.status,
    accent: c.status === 'routed' ? C.teal : C.lavender
  })) : [
    { title: "Waiting...", summary: "Waiting for new reports...", time: "Live Sync", id: "0", status: "pending", accent: C.teal }
  ];

  const counts = {};
  cases.forEach(c => counts[c.type] = (counts[c.type] || 0) + 1);
  const total = cases.length || 1;
  const colors = [C.rose, C.lavender, C.red, C.amber, C.teal];
  const breakdown = Object.entries(counts).map(([label, count], i) => ({
    label, pct: Math.round((count / total) * 100), color: colors[i % colors.length]
  })).sort((a,b) => b.pct - a.pct).slice(0, 5);

  return (
    <div className="dashboard-grid" style={{ padding:"16px 26px 20px", display:"flex", flexDirection:"column", gap:14, flex:1, overflowY:"auto" }}>
      {/* Stats */}
      <div className="stats-container" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:16, padding:"18px 20px", position:"relative", overflow:"hidden",
            opacity:0, transform:"translateY(20px)", animation:`fadeInUp 0.6s ease forwards ${i*0.1}s`,
            boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5), 0 0 20px ${s.color}05` }}>
            {/* Accent glow */}
            <div style={{ position:"absolute", top:"-20%", right:"-10%", width:100, height:100,
              borderRadius:"50%", background:s.color, filter: "blur(40px)", opacity:0.12 }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, position:"relative", zIndex:1 }}>
              <span style={{ fontSize:10.5, color:C.text2, fontWeight:500,
                letterSpacing:"0.05em", textTransform:"uppercase" }}>{s.label}</span>
              <div style={{ padding:8, background:`${s.color}11`, borderRadius:10 }}>
                <Ico name={s.icon} size={16} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize:32, fontWeight:800, fontFamily:"var(--font-display)",
              color:C.text, lineHeight:1, marginBottom:6, position:"relative", zIndex:1, letterSpacing:"-0.03em" }}>{s.value}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, position:"relative", zIndex:1 }}>
              {s.trend && <span style={{ fontSize:10.5, color:C.green, fontWeight:600 }}>{s.trend}</span>}
              <span style={{ fontSize:11, color:C.text3 }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lower panels */}
      <div className="panels-container" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, flex:1 }}>
        {/* Activity feed */}
        <Card style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13.5, fontWeight:600, color:C.text }}>Recent Activity</span>
            <span style={{ fontSize:11, color:C.text3, cursor:"pointer" }}>View all →</span>
          </div>
          <div>
            {activity.map((a, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0",
                borderBottom: i < activity.length-1 ? `1px solid ${C.border}` : "none",
              }}>  
                <div style={{ width:2.5, background:a.accent, borderRadius:2,
                  flexShrink:0, margin:"2px 0", alignSelf:"stretch" }} />
                <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:12.5, color:C.text, fontWeight:600 }}>{a.title}</div>
                    <div style={{ fontSize:10, color:C.text3 }}>{a.time}</div>
                  </div>
                  <div style={{ fontSize:11.5, color:C.text2, marginTop:4, lineHeight:1.5, fontStyle:"italic" }}>
                    "{a.summary}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Breakdown */}
        <Card style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:12 }}>
          <span style={{ fontSize:13.5, fontWeight:600, color:C.text }}>Incident Breakdown</span>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {breakdown.map((item, i) => (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:C.text2 }}>{item.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:item.color }}>{item.pct}%</span>
                </div>
                <div style={{ height:3, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${item.pct}%`, background:item.color,
                    borderRadius:2, transition:"width 1.2s ease" }} />
                </div>
              </div>
            ))}
          </div>
          {/* Hotspot callout */}
          <div style={{ marginTop:4, padding:"11px 14px", background:C.midnight,
            borderRadius:10, display:"flex", alignItems:"center", gap:10,
            border:`1px solid ${C.border}` }}>
            <Ico name="map" size={16} color={C.teal} />
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:C.text }}>Karachi Hotspot Alert</div>
              <div style={{ fontSize:11, color:C.text2 }}>Saddar sees 5× more reports than avg.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ─── WHATSAPP SCREEN ────────────────────────────────────────────────────── */
const WhatsAppScreen = ({ showUrdu, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  const startDemo = () => {
    setStarted(true);
    setMessages([]);
    const CHAT_FLOW = [
      { from:"user", text:"Assalam-o-Alaikum, mujhe madad chahiye", time:"Just now" },
      { from:"bot",  text:"Wa Alaikum Assalam! MehfoozAI apki awaz sun raha hai. Aap safely baat kar sakti hain — sab kuch anonymous hai. Kya hua?", time:"Just now", urdu:true },
      { from:"user", text:"Aaj subah Empress Market ke paas ek aadmi mujhe follow kar raha tha aur gandi baatein kar raha tha", time:"Just now" },
      { from:"bot",  text:"Main samajh sakta hun. Aap bilkul safe hain abhi. Kya aap location aur waqt bata sakti hain?", time:"Just now", urdu:true },
      { from:"user", text:"Saddar, Karachi. Aaj 9 baje subah", time:"Just now" },
      { from:"bot",  text:"Shukriya. Kya perpetrator ka koi description hai? (optional)", time:"Just now", urdu:true },
      { from:"user", text:"30-35 saal ka admi, neela shalwar kameez, darhi thi", time:"Just now" },
      { from:"bot",  isProcessing:true, text:"🔄 Processing your report…\n\n📋 FIR draft being prepared\n⚖️ PPC sections being identified\n📍 Nearest authority being located", time:"Just now" },
      { from:"bot",  isFinal:true, text:"✅ Case ID: MHZ-LIVE-TEST\n\nYour FIR has been drafted and routed to Saddar Women Police Station.\n\nPPC: Section 509, 290\nMadadgaar Helpline: 15\n\nYour identity is fully protected.", time:"Just now", urdu:true },
    ];

    let idx = 0;
    const next = () => {
      if (idx >= CHAT_FLOW.length) return;
      const msg = CHAT_FLOW[idx];
      idx++;
      const preDelay = msg.from === "bot" ? 600 : 200;
      const typeDelay = msg.from === "bot" ? 1100 : 50;
      setTimeout(() => {
        if (msg.from === "bot") setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages(prev => [...prev, msg]);
          setTimeout(next, msg.from === "user" ? 500 : 200);
        }, typeDelay);
      }, preDelay);
    };
    next();
  };

  const agentProgress = messages.length;

  return (
    <div className="whatsapp-container" style={{ padding:"16px 26px 20px", display:"flex", flex:1, gap:16, overflow:"hidden" }}>
      <style>{`
        @media (max-width: 1024px) {
          .whatsapp-container { flex-direction: column !important; overflow-y: auto !important; padding: 12px 16px !important; }
          .phone-mockup { flex: none !important; width: 100% !important; max-width: 340px; margin: 0 auto; }
        }
      `}</style>
      {/* Phone */}
      <div className="phone-mockup" style={{ display:"flex", flexDirection:"column", flex:"0 0 340px", gap:10 }}>
        <div style={{ fontSize:12, color:C.text2, fontWeight:500 }}>Live WhatsApp Simulation</div>
        <div style={{ flex:1, background:"#0a0f1a", borderRadius:22,
          border:`1px solid ${C.border2}`, overflow:"hidden", display:"flex",
          flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.55)", maxHeight:500 }}>
          {/* WA header */}
          <div style={{ background:"#1a2b28", padding:"11px 14px", display:"flex",
            alignItems:"center", gap:9, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#e8637a,#b5395a)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ico name="shield" size={16} color="white" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:600, color:C.text }}>MehfoozAI</div>
              <div style={{ fontSize:10.5, color:"#4caf76" }}>● Online · Anonymous</div>
            </div>
            <Ico name="lock" size={12} color={C.text3} />
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"12px 10px",
            display:"flex", flexDirection:"column", gap:5, background:"#0d1117" }}>
            {!started && (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", gap:14, padding:"30px 0" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:C.roseDim,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ico name="wa" size={26} color={C.rose} />
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13.5, color:C.text, fontWeight:600, marginBottom:4 }}>
                    Simulate Intake Flow
                  </div>
                  <div style={{ fontSize:11.5, color:C.text2, maxWidth:190, lineHeight:1.55 }}>
                    Watch how MehfoozAI handles a harassment report via WhatsApp
                  </div>
                </div>
                <button onClick={startDemo} style={{ padding:"9px 22px",
                  background:"linear-gradient(135deg,#e8637a,#b5395a)", color:"white",
                  border:"none", borderRadius:20, fontSize:12.5, fontWeight:600,
                  cursor:"pointer", boxShadow:"0 4px 16px rgba(232,99,122,0.4)" }}>
                  Start Demo
                </button>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.from === "user";
              const useUrduFont = msg.urdu && showUrdu;
              return (
                <div key={i} style={{ display:"flex", justifyContent: isUser ? "flex-end" : "flex-start",
                  animation:"fadeIn 0.25s ease" }}>
                  <div style={{ maxWidth:"82%", padding:"8px 11px",
                    borderRadius: isUser ? "13px 13px 3px 13px" : "13px 13px 13px 3px",
                    background: isUser ? "#1a5c40" : (msg.isFinal ? "#162436" : C.surface),
                    border: msg.isFinal ? `1px solid rgba(45,212,191,0.28)` : "none",
                    fontSize: useUrduFont ? 13 : 12.5, lineHeight:1.6, color:C.text,
                    whiteSpace:"pre-line",
                    fontFamily: useUrduFont ? "var(--font-urdu)" : "var(--font-body)",
                    direction: useUrduFont ? "rtl" : "ltr",
                    textAlign: useUrduFont ? "right" : "left" }}>
                    {msg.text}
                    <div style={{ fontSize:9.5, color:C.text3, marginTop:3,
                      textAlign:"right", direction:"ltr" }}>{msg.time}</div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div style={{ display:"flex", animation:"fadeIn 0.2s ease" }}>
                <div style={{ background:C.surface, padding:"9px 13px",
                  borderRadius:"13px 13px 13px 3px", display:"flex", gap:3, alignItems:"center" }}>
                  {[0,1,2].map(j => (
                    <span key={j} style={{ width:5, height:5, borderRadius:"50%",
                      background:C.text3, display:"block",
                      animation:`dotBlink 1s ${j*0.18}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10, overflow:"hidden" }}>
        <div style={{ fontSize:12, color:C.text2, fontWeight:500 }}>AI Agent Pipeline</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { label:"Intake Agent",  desc:"Extracts structured details using Llama 3.3-70b",       color:C.rose,     doneAt:4 },
            { label:"FIR Drafter",   desc:"Drafts FIR in English & Urdu, maps PPC sections",       color:C.lavender, doneAt:7 },
            { label:"Router Agent",  desc:"Identifies nearest police station & NGO support",        color:C.teal,     doneAt:9 },
          ].map((a, i) => {
            const isDone   = agentProgress >= a.doneAt;
            const isActive = agentProgress >= a.doneAt - 3 && !isDone;
            return (
              <Card key={i} style={{ padding:"14px 16px",
                border:`1px solid ${isActive ? a.color+"44" : C.border}`,
                transition:"border-color 0.4s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                      background: isDone ? C.green : isActive ? a.color : C.text3,
                      animation: isActive ? "pulse 1s infinite" : "none" }} />
                    <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.label}</span>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.05em",
                    color: isDone ? C.green : isActive ? a.color : C.text3 }}>
                    {isDone ? "✓ Done" : isActive ? "Processing…" : "Waiting"}
                  </span>
                </div>
                <div style={{ fontSize:12, color:C.text2, lineHeight:1.45, paddingLeft:15 }}>{a.desc}</div>
                <div style={{ marginTop:8, paddingLeft:15 }}>
                  <span style={{ fontSize:10, color:C.text3, background:C.midnight,
                    padding:"2px 9px", borderRadius:10, border:`1px solid ${C.border}` }}>
                    Groq · llama-3.3-70b-versatile
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Whisper card */}
        <Card style={{ padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.amber, flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:600, color:C.text }}>Whisper Transcription</span>
          </div>
          <div style={{ fontSize:12, color:C.text2, lineHeight:1.45 }}>
            Voice messages in Urdu, Punjabi &amp; Sindhi transcribed via Groq Whisper Large v3
          </div>
          <div style={{ marginTop:9, display:"flex", gap:5 }}>
            {["Urdu","Punjabi","Sindhi"].map(l => (
              <span key={l} style={{ fontSize:10, color:C.amber, background:C.amberDim,
                padding:"2px 9px", borderRadius:10 }}>{l}</span>
            ))}
          </div>
        </Card>

        {/* Tech stack */}
        <Card style={{ padding:"14px 16px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>Tech Stack</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {["FastAPI","LangGraph","Groq","Supabase","Twilio","WhatsApp Business API"].map(t => (
              <span key={t} style={{ fontSize:10.5, color:C.text2, background:C.midnight,
                padding:"3px 10px", borderRadius:10, border:`1px solid ${C.border}` }}>{t}</span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ─── RESOLVE MODAL ──────────────────────────────────────────────────────── */
const ResolveModal = ({ caseData, onClose, onResolved }) => {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleResolve = async () => {
    setSending(true);
    try {
      const res = await fetch(`${API}/api/v1/cases/${caseData.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send_message: true, custom_message: msg }),
      });
      const json = await res.json();
      setResult({ ok: true, text: json.message_sent
        ? `✅ Case resolved & message sent to ${json.sender}`
        : "✅ Case marked resolved (no phone on file — message not sent)" });
      setTimeout(() => { onResolved(caseData.id); onClose(); }, 2000);
    } catch (e) {
      setResult({ ok: false, text: "❌ Failed — is backend running?" });
    } finally { setSending(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.65)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:C.surface, border:`1px solid ${C.border2}`, borderRadius:20,
        padding:28, width:480, maxWidth:"90vw", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.text }}>✅ Resolve Case</div>
            <div style={{ fontSize:11.5, color:C.text2, marginTop:3 }}>{caseData.id} · {caseData.phone}</div>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:"none",
            color:C.text3, fontSize:20, cursor:"pointer" }}>×</button>
        </div>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11.5, color:C.text2, marginBottom:6 }}>
            Resolution message (WhatsApp) — leave blank for default Urdu message:
          </div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Aapka case solve ho gaya hai..."
            rows={4}
            style={{ width:"100%", background:C.midnight, border:`1px solid ${C.border2}`,
              borderRadius:10, color:C.text, fontSize:13, padding:"10px 12px",
              resize:"vertical", fontFamily:"var(--font-body)", boxSizing:"border-box", outline:"none" }} />
        </div>

        {result && (
          <div style={{ marginBottom:14, padding:"9px 14px", borderRadius:10,
            background: result.ok ? C.greenDim : C.roseDim,
            border:`1px solid ${result.ok ? "rgba(52,211,153,0.3)" : "rgba(232,99,122,0.3)"}`,
            fontSize:12.5, color: result.ok ? C.green : C.rose }}>
            {result.text}
          </div>
        )}

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"8px 18px", borderRadius:10,
            border:`1px solid ${C.border2}`, background:"transparent",
            color:C.text2, fontSize:13, cursor:"pointer" }}>Cancel</button>
          <button onClick={handleResolve} disabled={sending} style={{ padding:"8px 22px",
            borderRadius:10, border:"none",
            background:"linear-gradient(135deg,#34d399,#059669)",
            color:"white", fontSize:13, fontWeight:600, cursor: sending ? "not-allowed" : "pointer",
            boxShadow:"0 4px 14px rgba(52,211,153,0.35)" }}>
            {sending ? "Resolving…" : "Mark Resolved & Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── CASES SCREEN ───────────────────────────────────────────────────────── */
const CasesScreen = ({ cases, onSelectCase, onResolve, isMobile }) => {
  const [filter, setFilter] = useState("all");
  const [resolveTarget, setResolveTarget] = useState(null);
  const FILTERS = ["all","pending","drafted","routed"];
  const activeCases = cases.filter(c => c.status !== "closed");
  const filtered = filter === "all" ? activeCases : activeCases.filter(c => c.status === filter);

  return (
    <div style={{ padding:"16px 26px 20px", display:"flex", flexDirection:"column",
      gap:14, flex:1, overflow:"hidden" }}>
      {/* Filter pills */}
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        {FILTERS.map(f => (
          <button key={f} className="pill-btn"
            onClick={() => setFilter(f)}
            style={{ padding:"5px 14px", borderRadius:20, border:`1px solid ${filter===f ? C.rose : C.border}`,
              background: filter===f ? C.roseDim : "transparent",
              color: filter===f ? C.roseLight : C.text2,
              fontSize:12, fontWeight:500, cursor:"pointer", textTransform:"capitalize" }}>
            {f}
          </button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:11, color:C.text3 }}>{filtered.length} cases</span>
      </div>

      {/* Table */}
      <Card style={{ overflow:"hidden", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ overflowX:"auto" }}>
          <div style={{ minWidth: 800 }}>
            {/* Header row */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr 100px 80px 40px" : "150px 100px 120px 1fr 120px 90px 70px 145px",
              padding: isMobile ? "10px 12px" : "9px 18px", 
              borderBottom: `1px solid ${C.border}`, 
              background: C.midnight 
            }} className="header-row">
              {["Case ID","Type","Location","Quick Intel","PPC Sections","Status","Cred.","Actions"].map((h, idx) => {
                const isHiddenOnMobile = [0, 3, 4, 6].includes(idx);
                return (
                  <div key={h} className={isHiddenOnMobile ? "col-hide-mobile" : ""} 
                    style={{ fontSize: 9.5, fontWeight: 600, color: C.text3,
                    letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</div>
                );
              })}
            </div>
            {/* Rows */}
            <div style={{ overflowY:"auto", maxHeight:"calc(100vh - 250px)" }}>
              {filtered.map((c, i) => (
                <div key={c.id} className="row-hover"
                  onClick={() => onSelectCase(c)}
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr 100px 80px 40px" : "150px 100px 120px 1fr 120px 90px 70px 145px",
                    padding: isMobile ? "12px" : "13px 18px", 
                    alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                  {/* Case ID */}
                  <div className="col-hide-mobile" style={{ fontSize: 10, color: C.text3, fontWeight: 600, fontFamily: "monospace" }}>{c.id}</div>
                  
                  {/* Type */}
                  <div style={{ fontSize: isMobile ? 13 : 12, fontWeight: 700, color: C.text }}>{c.type}</div>
                  
                  {/* Location */}
                  <div style={{ fontSize: 11, color: C.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.location}</div>
                  
                  {/* Quick Intel */}
                  <div className="col-hide-mobile" style={{ fontSize: 10.5, color: C.green, lineHeight: 1.4, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 15 }}>
                    {c.summary || "Pending intelligence extraction..."}
                  </div>

                  {/* PPC */}
                  <div className="col-hide-mobile" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(c.ppc || []).slice(0, 2).map(p => (
                      <span key={p} style={{ fontSize: 8.5, padding: "2px 5px", background: "rgba(167,139,250,0.1)", color: C.lavender, borderRadius: 4, fontWeight: 700 }}>{p}</span>
                    ))}
                  </div>

                  {/* Status */}
                  <div><StatusBadge status={c.status} /></div>

                  {/* Credibility */}
                  <div className="col-hide-mobile">
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 32, height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${c.credibility}%`, background: c.credibility > 70 ? C.green : C.amber, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: C.text3 }}>{c.credibility}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: isMobile ? "flex-end" : "flex-start" }}>
                    {!isMobile && (
                      <button onClick={e => { e.stopPropagation(); onSelectCase(c); }}
                        style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px",
                          borderRadius: 7, border: `1px solid ${C.border2}`, background: "transparent",
                          color: C.text2, fontSize: 10.5, cursor: "pointer" }}>
                        <Ico name="eye" size={11} color="currentColor" />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); setResolveTarget(c); }}
                      style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px",
                        borderRadius: 7, border: "1px solid rgba(52,211,153,0.3)",
                        background: "rgba(52,211,153,0.08)",
                        color: C.green, fontSize: 10.5, cursor: "pointer", whiteSpace: "nowrap" }}>
                      ✅
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding:"40px", textAlign:"center", color:C.text3, fontSize:13 }}>
                  No active cases. Check <strong style={{color:C.green}}>Solved Cases</strong> for resolved ones.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      {resolveTarget && (
        <ResolveModal
          caseData={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onResolved={(id) => { onResolve(id); setResolveTarget(null); }}
        />
      )}
    </div>
  );
};

/* ─── SOLVED CASES SCREEN ───────────────────────────────────────────────── */
const SolvedCasesScreen = ({ cases = [], isMobile }) => {
  const solved = cases.filter(c => c.status === "closed");

  return (
    <div style={{ padding: isMobile ? "12px" : "16px 26px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ padding: "8px 14px", borderRadius: 20, background: C.greenDim, color: C.green, fontSize: 12, fontWeight: 700 }}>
          {solved.length} Cases Resolved
        </div>
      </div>
      
      {solved.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0.6 }}>
          <Ico name="shield" size={40} color={C.text3} />
          <div style={{ color: C.text3, fontSize: 14 }}>No cases have been resolved yet.</div>
        </div>
      ) : (
        <div className="panels-container" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {solved.map(c => (
            <Card key={c.id} style={{ padding: 16, border: `1px solid ${C.greenDim}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: C.text3, fontWeight: 600 }}>{c.id}</div>
                <div style={{ fontSize: 10, color: C.green, fontWeight: 800, textTransform: "uppercase" }}>Resolved ✓</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{c.type}</div>
              <div style={{ fontSize: 12, color: C.text2, marginBottom: 12 }}>{c.location} · {c.time}</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.5, background: C.midnight, padding: 10, borderRadius: 8 }}>
                {c.desc.substring(0, 100)}...
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── FIR VIEWER ─────────────────────────────────────────────────────────── */
const FIRViewer = ({ selectedCase, onBack, isMobile }) => {
  const c = selectedCase || { id: "MHZ-XXXX", time: "N/A", authority: "N/A", type: "N/A", location: "N/A", desc: "No case selected", ppc: [], urgency: "low" };
  const [lang, setLang] = useState("en");

  const firEn = `FIRST INFORMATION REPORT (FIR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Case ID        : ${c.id}
Date / Time    : ${c.time}
Police Station : ${c.authority}

COMPLAINANT    : Anonymous (Identity Protected)
INCIDENT TYPE  : ${c.type}
LOCATION       : ${c.location}

TACTICAL SUMMARY (AI):
${c.summary || "No summary available."}

STATEMENT OF FACTS:
${c.desc}

RELEVANT PPC SECTIONS:
${c.ppc.map(p => `  • ${p}`).join("\n")}

RECOMMENDED AUTHORITY:
  Primary : ${c.authority}
  Support : Madadgaar Helpline (15)
            Panah Shelter Home

LEGAL ADVICE:
  Preserve any evidence (screenshots, recordings).
  You have the right to file an FIR at the nearest
  Women Police Station at no cost.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by MehfoozAI · Encrypted · Anonymous`;

  const firUr = `پہلی اطلاع رپورٹ (ایف آئی آر)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

کیس نمبر      : ${c.id}
تاریخ و وقت   : ${c.time}
تھانہ         : ${c.authority}

درخواست گزار  : گمنام (شناخت محفوظ)
واقعہ کی قسم  : ${c.type}
مقام          : ${c.location}

واقعے کی تفصیل:
${c.desc}

متعلقہ دفعات:
${c.ppc.map(p => `  • ${p}`).join("\n")}

تجویز کردہ ادارہ:
  بنیادی  : ${c.authority}
  معاونت  : مددگار ہیلپ لائن (15)

قانونی مشورہ:
  کوئی بھی ثبوت محفوظ رکھیں۔
  آپ کو مفت قانونی مدد کا حق حاصل ہے۔

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
محفوظ اے آئی · خفیہ کاری · گمنام`;

  return (
    <div style={{ padding:"16px 26px 20px", display:"flex", flexDirection:"column",
      gap:14, flex:1, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {onBack && (
          <button onClick={onBack} style={{ padding:"5px 14px", borderRadius:20,
            border:`1px solid ${C.border}`, background:"transparent",
            color:C.text2, fontSize:12, cursor:"pointer" }}>
            ← Back to Cases
          </button>
        )}
        <div style={{ display:"flex", gap:5, marginLeft:"auto" }}>
          {[{id:"en",label:"English"},{id:"ur",label:"اردو"}].map(l => (
            <button key={l.id} onClick={() => setLang(l.id)}
              style={{ padding:"5px 14px", borderRadius:20,
                border:`1px solid ${lang===l.id ? C.lavender : C.border}`,
                background: lang===l.id ? C.lavenderDim : "transparent",
                color: lang===l.id ? C.lavender : C.text2,
                fontSize:12, cursor:"pointer" }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fir-layout" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:14, flex:1, overflow:"hidden" }}>
        {/* FIR document */}
        <Card style={{ padding:"22px 26px", overflowY:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18,
            paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:C.lavenderDim,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico name="scale" size={18} color={C.lavender} />
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>FIR Document</div>
              <div style={{ fontSize:11, color:C.text2 }}>AI-Generated · Auto-Verified</div>
            </div>
            <div style={{ marginLeft:"auto" }}><StatusBadge status={c.status} /></div>
          </div>
          <pre style={{ fontFamily: lang==="ur" ? "var(--font-urdu)" : "monospace",
            fontSize: lang==="ur" ? 14 : 12, color:C.text, lineHeight:1.9,
            whiteSpace:"pre-wrap", wordBreak:"break-word",
            direction: lang==="ur" ? "rtl" : "ltr",
            textAlign: lang==="ur" ? "right" : "left" }}>
            {lang==="en" ? firEn : firUr}
          </pre>
        </Card>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, overflowY:"auto" }}>
          {/* PPC */}
          <Card style={{ padding:"15px" }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>PPC Sections</div>
            {c.ppc.map((p, i) => (
              <div key={i} style={{ padding:"10px 12px", background:C.lavenderDim,
                borderRadius:8, marginBottom: i<c.ppc.length-1 ? 6 : 0,
                border:`1px solid rgba(167,139,250,0.18)` }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.lavender }}>{p}</div>
                <div style={{ fontSize:11, color:C.text2, marginTop:3, lineHeight:1.45 }}>
                  {p.includes("509") ? "Words or gestures intended to insult the modesty of a woman" :
                   p.includes("354-A") ? "Stalking — following or contacting a person against their will" :
                   p.includes("354") ? "Assault to outrage modesty of a woman" :
                   p.includes("337") ? "Causing hurt by rash or negligent act" :
                   p.includes("290") ? "Causing public nuisance" :
                   p.includes("PECA") ? "PECA 2016 — Cyber harassment offense" :
                   p.includes("Women Act") ? "Protection Against Harassment of Women at Workplace Act 2010" :
                   "Pakistan Penal Code section"}
                </div>
              </div>
            ))}
          </Card>

          {/* Routing */}
          <Card style={{ padding:"15px" }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>Routing Decision</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <div style={{ padding:"10px 12px", background:C.tealDim,
                borderRadius:8, border:`1px solid rgba(45,212,191,0.2)` }}>
                <div style={{ fontSize:9.5, color:C.teal, fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>Primary Authority</div>
                <div style={{ fontSize:12.5, color:C.text, marginTop:3, fontWeight:500 }}>{c.authority}</div>
              </div>
              <div style={{ padding:"10px 12px", background:C.amberDim,
                borderRadius:8, border:`1px solid rgba(245,166,35,0.2)` }}>
                <div style={{ fontSize:9.5, color:C.amber, fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>NGO Support</div>
                <div style={{ fontSize:12.5, color:C.text, marginTop:3 }}>
                  Madadgaar 15 · Panah Shelter Home
                </div>
              </div>
            </div>
          </Card>

          {/* Verification & Evidence */}
          <Card style={{ padding:"15px" }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:12 }}>Verification & Evidence</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ padding:"10px 12px", background:C.surface2, borderRadius:8, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:10.5, color:C.text2 }}>AI Credibility</span>
                      <span style={{ fontSize:10.5, color: (c.credibility || 50) > 70 ? C.green : C.amber, fontWeight:700 }}>{c.credibility || 50}%</span>
                  </div>
                  <div style={{ height:4, background:C.midnight, borderRadius:2, overflow:"hidden" }}>
                      <div style={{ width:`${c.credibility || 50}%`, height:"100%", background: (c.credibility || 50) > 70 ? C.green : C.amber }} />
                  </div>
              </div>
              
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 4px" }}>
                  <Ico name="phone" size={13} color={C.text3} />
                  <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, color:C.text3, textTransform:"uppercase" }}>Sender Phone</div>
                      <div style={{ fontSize:11.5, color:C.text2, fontFamily:"monospace" }}>{c.phone || "Anonymous"}</div>
                  </div>
                  {c.is_verified && <div style={{ background:C.greenDim, color:C.green, fontSize:8, padding:"2px 5px", borderRadius:4, fontWeight:800 }}>VERIFIED</div>}
              </div>

              {c.evidence && c.evidence.length > 0 && (
                <div style={{ marginTop:4 }}>
                  <div style={{ fontSize:10, color:C.text3, marginBottom:6, fontWeight:600 }}>Media Evidence ({c.evidence.length})</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {c.evidence.map((u, idx) => (
                      <a key={idx} href={u} target="_blank" rel="noreferrer"
                        style={{ width:32, height:32, borderRadius:6, background:C.midnight,
                          border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
                          justifyContent:"center", cursor:"pointer", transition:"0.2s" }}>
                        <Ico name="image" size={14} color={C.lavender} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Urgency */}
          <Card style={{ padding:"15px",
            border:`1px solid ${c.urgency==="critical" ? "rgba(248,113,113,0.3)" : C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
              <UrgencyDot urgency={c.urgency} />
              <span style={{ fontSize:12, fontWeight:600, color:C.text, textTransform:"capitalize" }}>
                Urgency: {c.urgency}
              </span>
            </div>
            <div style={{ fontSize:11.5, color:C.text2, lineHeight:1.55 }}>
              {c.urgency==="critical"
                ? "⚠️ Immediate response required. Dispatch patrol and medical assistance."
                : c.urgency==="high"
                ? "Action required within 2 hours. Victim may still be at risk."
                : "Standard processing. Follow-up within 24 hours."}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ─── HEATMAP SCREEN ─────────────────────────────────────────────────────── */
/* Uses the real Leaflet LiveSafetyMap component (dynamically imported above) */
const HeatmapScreen = () => <LiveSafetyMap />;

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */
const App = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const [tweaks, setTweak] = useState({
    "accentColor": "#e8637a",
    "density": "comfortable",
    "showUrdu": true,
    "animationsOn": true
  });
  const [screen, setScreen] = useState("dashboard");
  const [selectedCase, setSelectedCase] = useState(null);
  const [apiData, setApiData] = useState({
    stats: { total_reports: 0, cases_routed: 0, firs_generated: 0, heatmap_points: 0 },
    cases: []
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && META[tab]) {
      setScreen(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      try {
        console.log("🔗 Fetching from:", baseUrl);
        const statsRes = await fetch(`${baseUrl}/api/v1/dashboard/stats`);
        const stats = await statsRes.json();
        console.log("📊 Stats received:", stats);
        
        const casesRes = await fetch(`${baseUrl}/api/v1/dashboard/cases`);
        const casesData = await casesRes.json();
        console.log("📂 Cases received:", casesData.data?.length || 0);
        
        const mappedCases = (casesData.data || []).map(c => {
          try {
            return {
              id: c.case_id || `MHZ-ID-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
              status: c.status || 'pending',
              type: c.category || 'Harassment',
              location: c.location_name || 'Unknown',
              time: c.created_at ? new Date(c.created_at).toLocaleString() : 'N/A',
              ppc: Array.isArray(c.ppc_sections) ? c.ppc_sections : [],
              authority: c.routing_info?.primary_authority || 'Unknown Station',
              urgency: c.is_emergency ? 'critical' : 'high',
              desc: c.description || c.transcription || 'No description available',
              credibility: c.credibility_score || 50,
              phone: c.sender_phone || 'Anonymous',
              evidence: Array.isArray(c.evidence_urls) ? c.evidence_urls : [],
              is_verified: !!c.is_verified
            };
          } catch (e) {
            console.error("Error mapping case:", e);
            return null;
          }
        }).filter(c => c !== null);
        
        setApiData({ stats, cases: mappedCases });
      } catch (err) {
        console.error("Failed to fetch API data", err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCase = (c) => { setSelectedCase(c); setScreen("fir"); };
  const handleNav = (s) => { 
    if (s === 'close') {
      setSidebarOpen(false);
      return;
    }
    setScreen(s); 
    setSidebarOpen(false); // Close on mobile after selection
    if (s !== "fir") setSelectedCase(null); 
  };

  const handleCaseResolved = (caseId) => {
    setApiData(prev => ({
      ...prev,
      cases: prev.cases.map(c =>
        c.id === caseId ? { ...c, status: "closed" } : c
      )
    }));
  };

  const META = {
    dashboard: { title:"Overview",          sub:"MehfoozAI — Women's Safety Platform, Pakistan" },
    whatsapp:  { title:"WhatsApp Intake",    sub:"AI-powered anonymous reporting pipeline" },
    cases:     { title:"Case Tracker",       sub:"Active incidents — click ✅ Resolve to close a case" },
    fir:       { title:"FIR Viewer",         sub:"Auto-generated First Information Reports with PPC mapping" },
    heatmap:   { title:"Safety Heatmap",     sub:"Live incident heatmap — syncs every 10 seconds" },
    solved:    { title:"Solved Cases",       sub:"Cases that have been resolved and closed" },
  };
  const meta = META[screen];

  return (
    <div className="intelligence-grid" style={{ display:"flex", height:"100vh", width:"100vw", overflow:"hidden", position:"relative" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dotBlink { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
        
        .row-hover { transition: all 0.2s; cursor: pointer; border-bottom: 1px solid ${C.border}; }
        .row-hover:hover { background: rgba(255,255,255,0.02); }
        .nav-item { transition: all 0.3s; }
        .nav-item:hover { background: rgba(255,255,255,0.05); }
        .pill-btn { transition: all 0.2s; }
        .pill-btn:hover { transform: translateY(-1px); }
        
        .mobile-only { display: none !important; }
        .mobile-sidebar-overlay { display: none; }

        @media (max-width: 1024px) {
          .mobile-only { display: flex !important; }
          .hide-mobile { display: none !important; }
          
          .mobile-sidebar {
            position: fixed; top: 0; left: 0; z-index: 1000;
            height: 100vh; width: 280px !important;
            transform: translateX(${sidebarOpen ? '0' : '-100%'});
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 20px 0 50px rgba(0,0,0,0.6);
            background: ${C.deep};
          }
          .mobile-sidebar-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px); z-index: 999;
            display: ${sidebarOpen ? 'block' : 'none'};
            animation: fadeIn 0.3s ease;
          }
          
          .stats-container { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .panels-container { grid-template-columns: 1fr !important; }
          .fir-layout { grid-template-columns: 1fr !important; overflow-y: auto !important; }
          .dashboard-grid { padding: 12px !important; overflow-y: auto !important; }
          .whatsapp-container { flex-direction: column !important; overflow-y: auto !important; padding: 12px !important; }
          
          .col-hide-mobile { display: none !important; }
        }
      `}</style>
      
      <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      <div className="mobile-sidebar" style={{ height: '100%' }}>
        <Sidebar active={screen} setActive={handleNav} caseCount={apiData.cases.filter(c => c.status !== 'closed').length} />
      </div>
      
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <TopBar 
          title={meta.title} 
          subtitle={meta.sub} 
          activeCount={apiData.cases.filter(c => c.status !== 'closed').length} 
          onMenuClick={() => setSidebarOpen(true)}
          isMobile={isMobile}
        />
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {screen === "dashboard" && <DashboardScreen apiData={apiData} isMobile={isMobile} />}
          {screen === "whatsapp"  && <WhatsAppScreen showUrdu={tweaks.showUrdu} isMobile={isMobile} />}
          {screen === "cases"     && <CasesScreen cases={apiData.cases} onSelectCase={handleSelectCase} onResolve={handleCaseResolved} isMobile={isMobile} />}
          {screen === "fir"       && <FIRViewer selectedCase={selectedCase || apiData.cases[0]} onBack={() => setScreen("cases")} isMobile={isMobile} />}
          {screen === "heatmap"   && <HeatmapScreen />}
          {screen === "solved"    && <SolvedCasesScreen cases={apiData.cases} isMobile={isMobile} />}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => (
  <Suspense fallback={<div style={{ color: 'white', padding: 20 }}>Loading...</div>}>
    <App />
  </Suspense>
);

export default DashboardPage;

