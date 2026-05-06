import React from 'react';
import Link from 'next/link';
import { C } from '../../lib/theme';
import { Ico } from '../ui/Ico';

export const Hero = ({ isMobile }) => (
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
    <div className="hero-content" style={{ textAlign: isMobile ? "center" : "left" }}>
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
      <div style={{ display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row", alignItems: "center", flexWrap: "wrap" }}>
        <Link href="https://wa.me/923350095429" target="_blank" className="primary-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, whiteSpace: "nowrap", flex: 1, minWidth: 260 }}>
          <Ico name="wa" size={24} color="#fff" />
          Report via WhatsApp
        </Link>
        <Link href="/login" className="secondary-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, whiteSpace: "nowrap", flex: 1, minWidth: 260 }}>
          Authority Portal
        </Link>
      </div>
    </div>
    <div className="hero-spline" style={{ 
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
          clipPath: "inset(0px 0px 50px 0px)",
          pointerEvents: "auto"
        }}
      />
    </div>
  </section>
);
