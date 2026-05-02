"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const C = {
  midnight: "#051424",
  deep: "#010f1f",
  surface: "rgba(255, 255, 255, 0.03)",
  surfaceLight: "rgba(255, 255, 255, 0.08)",
  rose: "#e8637a",
  roseLight: "#ffb2bb",
  lavender: "#a78bfa",
  lavenderLight: "#cebdff",
  text: "#d4e4fa",
  textDim: "#94a3b8",
  border: "rgba(255, 255, 255, 0.08)",
  borderLight: "rgba(255, 255, 255, 0.15)",
  glow: "rgba(232, 99, 122, 0.15)"
};

const GlassCard = ({ children, style, hover = true }) => (
  <div className={hover ? "glass-card-hover" : ""} style={{
    background: C.surface,
    backdropFilter: "blur(32px)",
    borderRadius: 24,
    border: `1px solid ${C.border}`,
    padding: 40,
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    ...style
  }}>
    {children}
  </div>
);

const Ico = ({ name, size = 24, color = "currentColor" }) => {
  const icons = {
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    msg: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    wa: `<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>`
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'wa' ? color : "none"} 
      stroke={name === 'wa' ? "none" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: icons[name] || "" }} />
  );
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 968);
    
    handleScroll();
    handleResize();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ background: C.midnight, minHeight: "100vh", color: C.text, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: "fixed", top: "-10%", left: "-10%", width: "40%", height: "40%", background: `radial-gradient(circle, ${C.rose}11 0%, transparent 70%)`, filter: "blur(100px)", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: `radial-gradient(circle, ${C.lavender}08 0%, transparent 70%)`, filter: "blur(100px)", zIndex: 0 }} />

      {/* Navigation */}
      <nav style={{ 
        padding: isMobile ? "12px 20px" : scrolled ? "16px 60px" : "24px 60px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        position: "fixed", 
        top: 0, 
        width: "100%", 
        zIndex: 1000, 
        background: scrolled ? "rgba(5, 20, 36, 0.85)" : "transparent", 
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.4s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, 
            background: `linear-gradient(135deg, ${C.rose}, ${C.lavender})`, 
            borderRadius: 10, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: `0 4px 15px ${C.rose}44`
          }}>
            <Ico name="shield" size={isMobile ? 16 : 20} color="#fff" />
          </div>
          <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>MehfoozAI</span>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 15 : 40, alignItems: "center" }}>
          <Link href="/dashboard" className="nav-link" style={{ fontSize: isMobile ? 12 : 14 }}>Portal</Link>
          <Link href="https://wa.me/15556461678" target="_blank" className="primary-btn-sm" style={{ padding: isMobile ? "8px 12px" : "10px 20px", fontSize: isMobile ? 11 : 13 }}>
            {isMobile ? "Report" : "Report Anonymously"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        position: "relative", 
        padding: isMobile ? "120px 20px 60px" : "180px 60px 120px", 
        maxWidth: 1300, 
        margin: "0 auto", 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", 
        gap: isMobile ? 60 : 40, 
        alignItems: "center", 
        zIndex: 1 
      }}>
        <div style={{ animation: "fadeInUp 0.8s ease-out", textAlign: isMobile ? "center" : "left" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(232, 99, 122, 0.08)", borderRadius: 100, border: `1px solid ${C.rose}33`, marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.rose, boxShadow: `0 0 10px ${C.rose}` }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.roseLight, textTransform: "uppercase", letterSpacing: "0.1em" }}>Active Safeguard in Pakistan</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 42 : 76, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.05em", marginBottom: 24, color: "#fff" }}>
            MehfoozAI — <br/><span style={{ background: `linear-gradient(to right, ${C.rose}, ${C.roseLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aapki Awaz, Aapki Hifazat</span>
          </h1>
          <p style={{ fontSize: isMobile ? 18 : 22, color: C.textDim, lineHeight: 1.6, marginBottom: 40, maxWidth: isMobile ? "100%" : 580, marginInline: isMobile ? "auto" : "unset" }}>
            The first AI-driven sanctuary for anonymous harassment reporting. No apps, no exposure—just a simple WhatsApp message to secure your justice.
          </p>
          <div style={{ display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row", alignItems: "stretch" }}>
            <Link href="https://wa.me/15556461678" target="_blank" className="primary-btn" style={{ justifyContent: "center" }}>
              <Ico name="wa" size={24} color="#fff" />
              Report via WhatsApp
            </Link>
            <Link href="/dashboard" className="secondary-btn" style={{ justifyContent: "center" }}>
              Authority Dashboard
            </Link>
          </div>
        </div>
        <div style={{ 
          position: "relative", 
          height: isMobile ? 450 : 700, 
          width: isMobile ? "100%" : "115%", 
          marginLeft: isMobile ? 0 : "-7.5%",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 1
        }}>
          <div style={{ position: "absolute", width: "120%", height: "120%", background: `radial-gradient(circle, ${C.rose}08 0%, transparent 60%)`, zIndex: -1 }} />
          <iframe 
            src='https://my.spline.design/genkubgreetingrobot-MXmB22qa7WZvCGPGvxLyH2Z6/' 
            frameBorder='0' 
            style={{ 
              width: "100%", 
              height: "100%", 
              border: "none",
              position: "absolute",
              transform: isMobile ? "scale(0.8)" : "scale(0.9)",
              clipPath: "inset(0px 0px 50px 0px)", // Perfectly hides the watermark
              pointerEvents: "auto"
            }}
          />
        </div>
      </section>

      {/* Features / How it Works */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 60px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 40 : 80 }}>
          <h2 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 800, marginBottom: 20, color: "#fff" }}>Securing Your Journey</h2>
          <p style={{ fontSize: isMobile ? 16 : 18, color: C.textDim, maxWidth: 600, margin: "0 auto" }}>Three simple steps to break the silence while maintaining absolute privacy and professional legal support.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 20 : 32 }}>
          {[
            { 
              title: "Report Anonymously", 
              desc: "Send a voice note or text on WhatsApp. Our system masks your identity before it even reaches a human agent.", 
              icon: "msg", 
              color: C.rose,
              delay: "0.1s"
            },
            { 
              title: "AI Analysis", 
              desc: "Intelligent agents analyze your report, draft a formal FIR, and identify specific Pakistan Penal Code (PPC) sections.", 
              icon: "zap", 
              color: C.lavender,
              delay: "0.2s"
            },
            { 
              title: "Rapid Response", 
              desc: "Cases are routed instantly to specialized Women Police Stations or verified NGO partners for legal and mental aid.", 
              icon: "shield", 
              color: "#34d399",
              delay: "0.3s"
            }
          ].map((item, i) => (
            <GlassCard key={i} style={{ animation: `fadeInUp 0.8s ease-out ${item.delay} backwards` }}>
              <div style={{ 
                width: 64, height: 64, 
                background: `${item.color}08`, 
                borderRadius: 18, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: 32, 
                border: `1px solid ${item.color}22` 
              }}>
                <Ico name={item.icon} size={30} color={item.color} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "#fff" }}>{item.title}</h3>
              <p style={{ fontSize: 16, color: C.textDim, lineHeight: 1.7 }}>{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How to Report Guide */}
      <section style={{ padding: isMobile ? "40px 20px" : "80px 60px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <GlassCard style={{ padding: isMobile ? "24px" : "50px", border: `1px solid ${C.rose}22`, background: "rgba(232, 99, 122, 0.02)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 60, alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: isMobile ? 32 : 40, fontWeight: 800, marginBottom: 24, color: "#fff" }}>How to Report?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { step: "1", title: "Start the Chat", text: "Send 'Hi' or 'Help' to our WhatsApp. Our AI will greet you safely." },
                  { step: "2", title: "Describe Incident", text: "Tell us what happened in any language. Voice notes are also supported." },
                  { step: "3", title: "Share Location", text: "Tell us the landmark or area. We identify nearest help automatically." },
                  { step: "4", title: "Stay Safe", text: "Your identity is hidden. We handle the routing and legal aid." }
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.rose, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.title}</h4>
                      <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.5 }}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#0a0f1a", borderRadius: 20, border: `1px solid ${C.border}`, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ background: "#1a2b28", padding: "10px 14px", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.rose, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="shield" size={14} color="white" /></div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>MehfoozAI</div>
                  <div style={{ fontSize: 9, color: "#4caf76" }}>Online · Anonymous</div>
                </div>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#162436", padding: "8px 12px", borderRadius: "0 10px 10px 10px", fontSize: 12, alignSelf: "flex-start", maxWidth: "85%", color: C.text }}>As-salamu alaykum. How can I help you safely today?</div>
                <div style={{ background: "#1a5c40", padding: "8px 12px", borderRadius: "10px 10px 0 10px", fontSize: 12, alignSelf: "flex-end", maxWidth: "85%", color: "#fff" }}>Salam, market mein ek admi tang kar raha hai...</div>
                <div style={{ background: "#162436", padding: "8px 12px", borderRadius: "0 10px 10px 10px", fontSize: 12, alignSelf: "flex-start", maxWidth: "85%", color: C.text }}>Landmark batayie? Wo kaisa dikhta tha?</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Impact Stats */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 60px", background: "rgba(255,255,255,0.01)", borderY: `1px solid ${C.border}`, position: "relative" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 30 : 40, textAlign: "center" }}>
          {[
            { val: "12k+", label: "Safe Reports" },
            { val: "92", label: "Police Units" },
            { val: "15", label: "NGO Partners" },
            { val: "100%", label: "Anonymity" }
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, color: i % 2 === 0 ? C.rose : C.lavender, marginBottom: 12, letterSpacing: "-0.02em" }}>{s.val}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <footer style={{ padding: isMobile ? "60px 20px" : "140px 60px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 800, background: `radial-gradient(circle, ${C.rose}05 0%, transparent 70%)`, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, marginBottom: 28, color: "#fff", letterSpacing: "-0.03em" }}>Ready to reclaim your safety?</h2>
          <p style={{ fontSize: isMobile ? 16 : 20, color: C.textDim, marginBottom: 56, maxWidth: 600, margin: "0 auto 56px" }}>Your voice is your power. Every report is a step toward a safer Pakistan for everyone.</p>
          <Link href="https://wa.me/15556461678" target="_blank" className="primary-btn-lg" style={{ padding: isMobile ? "16px 32px" : "24px 60px", fontSize: isMobile ? 18 : 22 }}>
            <Ico name="wa" size={isMobile ? 24 : 28} color="#fff" />
            Chat with MehfoozAI
          </Link>
          
          <div style={{ marginTop: isMobile ? 60 : 120, borderTop: `1px solid ${C.border}`, paddingTop: 60, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 30 : 0, justifyContent: "space-between", alignItems: "center", fontSize: 14, color: C.textDim }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, background: C.rose, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico name="shield" size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, color: "#fff" }}>MehfoozAI</span>
            </div>
            <p>© 2024 MehfoozAI. A Secure Sanctuary Project.</p>
            <div style={{ display: "flex", gap: isMobile ? 15 : 32, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/dashboard" className="footer-link">Dashboard</Link>
              <Link href="/authority" className="footer-link">Authority Login</Link>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body { margin: 0; background: ${C.midnight}; }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: ${C.textDim};
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .nav-link:hover { color: #fff; }

        .footer-link {
          color: inherit;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .footer-link:hover { color: ${C.rose}; }

        .primary-btn {
          background: linear-gradient(135deg, ${C.rose}, #f48296);
          color: #fff;
          padding: 18px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px ${C.rose}33;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px ${C.rose}44;
        }

        .primary-btn-sm {
          background: ${C.rose};
          color: #fff;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 15px ${C.rose}22;
          transition: all 0.3s ease;
        }
        .primary-btn-sm:hover {
          background: #f48296;
          transform: translateY(-1px);
        }

        .primary-btn-lg {
          background: linear-gradient(135deg, ${C.rose}, ${C.lavender});
          color: #fff;
          padding: 24px 60px;
          border-radius: 20px;
          font-size: 22px;
          font-weight: 800;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 20px 50px ${C.rose}22;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .primary-btn-lg:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 25px 60px ${C.rose}44;
        }

        .secondary-btn {
          background: ${C.surface};
          backdrop-filter: blur(10px);
          color: #fff;
          padding: 18px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid ${C.border};
          transition: all 0.3s ease;
        }
        .secondary-btn:hover {
          background: ${C.surfaceLight};
          border-color: ${C.borderLight};
        }

        .glass-card-hover:hover {
          transform: translateY(-8px);
          border-color: ${C.rose}44;
          background: ${C.surfaceLight};
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
