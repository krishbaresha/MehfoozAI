import React from 'react';
import { C } from '../../lib/theme';
import { Ico } from '../ui/Ico';
import { GlassCard } from '../ui/GlassCard';

export const Features = ({ isMobile }) => (
  <section className="features-section" style={{ padding: isMobile ? "60px 20px" : "100px 60px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
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
        },
        { 
          title: "AI Analysis", 
          desc: "Intelligent agents analyze your report, draft a formal FIR, and identify specific Pakistan Penal Code (PPC) sections.", 
          icon: "zap", 
          color: C.lavender,
        },
        { 
          title: "Rapid Response", 
          desc: "Cases are routed instantly to specialized Women Police Stations or verified NGO partners for legal and mental aid.", 
          icon: "shield", 
          color: "#34d399",
        }
      ].map((item, i) => (
        <GlassCard key={i} className="feature-card">
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
);
