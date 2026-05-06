import React from 'react';
import Link from 'next/link';
import { C } from '../../lib/theme';
import { Ico } from '../ui/Ico';
import { GlassCard } from '../ui/GlassCard';

export const Team = ({ isMobile }) => (
  <section className="team-section" style={{ padding: isMobile ? "80px 20px" : "120px 60px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
    <div style={{ textAlign: "center", marginBottom: isMobile ? 60 : 80 }}>
      <h2 style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, marginBottom: 20, color: "#fff" }}>The Minds Behind MehfoozAI</h2>
      <p style={{ fontSize: isMobile ? 16 : 18, color: C.textDim, maxWidth: 700, margin: "0 auto" }}>
        Dedicated to empowering voices through anonymous, AI-driven harassment reporting. Our team combines expertise in AI, cybersecurity, and social impact to create a safer digital world.
      </p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 24 : 32 }}>
      {[
        {
          name: "Krish Baresha",
          role: "Leader & Full Stack Architect",
          bio: "Driving the technical vision and AI pipeline of MehfoozAI.",
          link: "https://www.linkedin.com/in/krish-baresha/"
        },
        {
          name: "Alishba Irshad Ali",
          role: "Frontend & Python Specialist",
          bio: "Crafting intuitive and secure interfaces for empowerment.",
          link: "https://www.linkedin.com/in/alishba-irshad-bab639379"
        },
        {
          name: "Saad Khan Chanar",
          role: "Cybersecurity Lead",
          bio: "Ensuring the highest standards of anonymity and data protection.",
          link: "https://www.linkedin.com/in/saad-khan-channar/"
        },
        {
          name: "Talha Aslam",
          role: "Innovation & Business Dev",
          bio: "Scaling the impact of AI for social safety globally.",
          link: "https://www.linkedin.com/in/talha-aslam-mk/"
        },
        {
          name: "Areeba Ameer",
          role: "Game Dev & Systems Engineer",
          bio: "Building interactive and resilient system modules with Unity/C#.",
          link: "https://www.linkedin.com/in/areeba-ameer-903666407"
        },
        {
          name: "Shaleem Ashley Malik",
          role: "Tooling & Doc Support",
          bio: "Streamlining development and maintaining technical excellence.",
          link: "https://www.linkedin.com/in/shaleemashlin-malik-98035a3bb/"
        }
      ].map((member, i) => (
        <GlassCard key={i} className="team-card" style={{ padding: "32px", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ 
            width: 80, height: 80, 
            borderRadius: 20, 
            background: `linear-gradient(135deg, ${C.surfaceLight}, ${C.surface})`, 
            border: `1px solid ${C.border}`,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 800,
            color: i % 2 === 0 ? C.rose : C.lavender,
            textShadow: `0 0 20px ${i % 2 === 0 ? C.rose : C.lavender}44`
          }}>
            {member.name.charAt(0)}
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{member.name}</h3>
          <div style={{ fontSize: 13, fontWeight: 700, color: i % 2 === 0 ? C.roseLight : C.lavenderLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            {member.role}
          </div>
          <p style={{ fontSize: 15, color: C.textDim, lineHeight: 1.6, marginBottom: 24, flexGrow: 1 }}>
            {member.bio}
          </p>
          <Link href={member.link} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.text, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            <Ico name="li" size={18} color={C.textDim} />
            LinkedIn
          </Link>
        </GlassCard>
      ))}
    </div>
  </section>
);
