import React from 'react';
import Link from 'next/link';
import { C } from '../../lib/theme';
import { Ico } from '../ui/Ico';

export const Footer = ({ isMobile }) => (
  <footer className="footer-section" style={{ padding: isMobile ? "60px 20px" : "140px 60px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) translateZ(0)", width: 800, height: 800, background: `radial-gradient(circle, ${C.rose}05 0%, transparent 70%)`, zIndex: 0, pointerEvents: "none", willChange: "transform" }} />
    
    <div className="footer-content" style={{ position: "relative", zIndex: 1 }}>
      <h2 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, marginBottom: 28, color: "#fff", letterSpacing: "-0.03em" }}>Ready to reclaim your safety?</h2>
      <p style={{ fontSize: isMobile ? 16 : 20, color: C.textDim, marginBottom: 56, maxWidth: 600, margin: "0 auto 56px" }}>Your voice is your power. Every report is a step toward a safer Pakistan for everyone.</p>
      <Link href="https://wa.me/923350095429" target="_blank" className="primary-btn-lg" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12, whiteSpace: "nowrap", padding: isMobile ? "16px 32px" : "24px 60px", fontSize: isMobile ? 18 : 22 }}>
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p>© 2024 MehfoozAI. A Secure Sanctuary Project.</p>
          <div className="made-by-badge" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255, 255, 255, 0.03)", borderRadius: 100, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, color: C.textDim, fontWeight: 500 }}>Made with</span>
            <span className="heart-beat" style={{ fontSize: 14 }}>❤️</span>
            <span style={{ fontSize: 13, color: C.textDim, fontWeight: 500 }}>by</span>
            <span style={{ fontSize: 14, fontWeight: 800, background: `linear-gradient(135deg, ${C.rose}, ${C.lavender})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Krish and Team</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 15 : 32, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/legal" className="footer-link">Legal & Privacy</Link>
        </div>
      </div>
    </div>
  </footer>
);
