import React from 'react';
import { C } from '../../lib/theme';

export const Stats = ({ isMobile }) => (
  <section className="stats-section" style={{ padding: isMobile ? "60px 20px" : "100px 60px", background: "rgba(255,255,255,0.01)", borderBottom: `1px solid ${C.border}`, borderTop: `1px solid ${C.border}`, position: "relative" }}>
    <div style={{ maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 30 : 40, textAlign: "center" }}>
      {[
        { val: "12k+", label: "Safe Reports" },
        { val: "92", label: "Police Units" },
        { val: "15", label: "NGO Partners" },
        { val: "100%", label: "Anonymity" }
      ].map((s, i) => (
        <div key={i} className="stat-item">
          <div style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, color: i % 2 === 0 ? C.rose : C.lavender, marginBottom: 12, letterSpacing: "-0.02em" }}>{s.val}</div>
          <div style={{ fontSize: isMobile ? 10 : 12, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>{s.label}</div>
        </div>
      ))}
    </div>
  </section>
);
