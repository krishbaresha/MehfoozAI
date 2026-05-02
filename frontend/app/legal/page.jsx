"use client";
import React from 'react';
import Link from 'next/link';

export default function LegalPage() {
  const C = {
    midnight: "#0b0f1a", deep: "#111827", surface: "#1a2236",
    border: "rgba(255,255,255,0.07)",
    lavender: "#a78bfa", text: "#f0f4ff", text2: "#8b9bb4"
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.midnight, color: C.text, fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "40px" }}>
        
        <Link href="/" style={{ color: C.lavender, textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: 32, marginBottom: 10 }}>Legal & Privacy</h1>
        <p style={{ color: C.text2, marginBottom: 40 }}>Last updated: May 2026</p>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, marginBottom: 16, color: C.lavender }}>1. Privacy Policy</h2>
          <p style={{ color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>
            MehfoozAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your information is collected, used, and protected when you use our anonymous harassment reporting platform.
          </p>
          <ul style={{ color: C.text2, lineHeight: 1.6, paddingLeft: 20 }}>
            <li><strong>Data Collection:</strong> We collect only the information you voluntarily provide via WhatsApp, including text, audio, and location data, strictly for the purpose of generating incident reports (FIRs).</li>
            <li><strong>Anonymity:</strong> We do not expose your phone number or identity to the authorities without your explicit consent. Your identity is masked by the system.</li>
            <li><strong>Third-Party Services:</strong> We use AI services to process text and audio. Data sent to these services is not used for training their models.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, marginBottom: 16, color: C.lavender }}>2. Terms of Service</h2>
          <p style={{ color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>
            By using MehfoozAI, you agree to use the platform responsibly. This service is designed to aid in the reporting of harassment and emergencies. False reporting or misuse of the platform may result in your number being blocked from the service. We provide AI-assisted legal drafting, but this does not constitute official legal counsel.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, marginBottom: 16, color: C.lavender }}>3. User Data Deletion Instructions</h2>
          <p style={{ color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>
            If you wish to delete your data or history from MehfoozAI:
          </p>
          <ul style={{ color: C.text2, lineHeight: 1.6, paddingLeft: 20 }}>
            <li>Send the word <strong>"DELETE MY DATA"</strong> to our WhatsApp bot.</li>
            <li>Alternatively, you can email us at <strong>krishbsha778@gmail.com</strong> with your registered WhatsApp number, and our team will wipe all records associated with your case within 24 hours.</li>
          </ul>
        </section>

        <hr style={{ borderColor: C.border, margin: "40px 0" }} />
        <p style={{ color: C.text2, fontSize: 14, textAlign: "center" }}>
          MehfoozAI Hackathon Demo Project. Built for Social Good.
        </p>
      </div>
    </div>
  );
}
