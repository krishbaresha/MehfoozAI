import React from 'react';
import { C } from '../../lib/theme';
import { Ico } from '../ui/Ico';
import { GlassCard } from '../ui/GlassCard';

export const Guide = ({ isMobile }) => (
  <section className="guide-section" style={{ padding: isMobile ? "40px 20px" : "80px 60px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
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
              <div key={i} className="guide-step" style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.rose, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.title}</h4>
                  <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.5 }}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="guide-chat" style={{ background: "#0a0f1a", borderRadius: 20, border: `1px solid ${C.border}`, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
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
);
