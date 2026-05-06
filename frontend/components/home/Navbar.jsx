import React from 'react';
import Link from 'next/link';
import { C } from '../../lib/theme';
import { Ico } from '../ui/Ico';

export const Navbar = ({ isMobile, scrolled }) => (
  <nav className="nav-container" style={{ 
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
      <Link href="/login" className="nav-link" style={{ fontSize: isMobile ? 12 : 14 }}>Login</Link>
      <Link href="https://wa.me/923350095429" target="_blank" className="primary-btn-sm" style={{ padding: isMobile ? "8px 12px" : "10px 20px", fontSize: isMobile ? 11 : 13 }}>
        {isMobile ? "Report" : "Report Anonymously"}
      </Link>
    </div>
  </nav>
);
