"use client";
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { C } from '../lib/theme';
import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { Features } from '../components/home/Features';
import { Guide } from '../components/home/Guide';
import { Stats } from '../components/home/Stats';
import { Team } from '../components/home/Team';
import { Footer } from '../components/home/Footer';
import './home.css';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const container = useRef(null);

  useGSAP(() => {
    // Navbar Animation
    gsap.from('.nav-container', {
      y: -50,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      delay: 0.1
    });

    // Hero Animations
    gsap.from('.hero-content > *', {
      y: 50,
      opacity: 1,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.hero-spline', {
      scale: 0.8,
      opacity: 1,
      duration: 1.5,
      ease: 'power3.out',
      delay: 0.4
    });

    // Feature Cards
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 80%',
      },
      y: 60,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.2)'
    });

    // Guide Section
    gsap.from('.guide-step', {
      scrollTrigger: {
        trigger: '.guide-section',
        start: 'top 80%',
      },
      x: -40,
      opacity: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out'
    });

    gsap.from('.guide-chat', {
      scrollTrigger: {
        trigger: '.guide-section',
        start: 'top 80%',
      },
      x: 40,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.2
    });

    // Stats
    gsap.from('.stat-item', {
      scrollTrigger: {
        trigger: '.stats-section',
        start: 'top 85%',
      },
      scale: 0.5,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.5)'
    });

    // Team Cards
    gsap.from('.team-card', {
      scrollTrigger: {
        trigger: '.team-section',
        start: 'top 80%',
      },
      y: 50,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out'
    });

    // Footer
    gsap.from('.footer-content > *', {
      scrollTrigger: {
        trigger: '.footer-section',
        start: 'top 85%',
      },
      y: 40,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out'
    });
  }, { scope: container });

  useEffect(() => {
    let tickingScroll = false;
    let tickingResize = false;

    const handleScroll = () => {
      if (!tickingScroll) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          tickingScroll = false;
        });
        tickingScroll = true;
      }
    };

    const handleResize = () => {
      if (!tickingResize) {
        window.requestAnimationFrame(() => {
          setIsMobile(window.innerWidth < 968);
          tickingResize = false;
        });
        tickingResize = true;
      }
    };
    
    handleScroll();
    handleResize();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={container} style={{ background: C.midnight, minHeight: "100vh", color: C.text, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MehfoozAI",
            "url": "https://mahfoozai.netlify.app/",
            "logo": "https://mahfoozai.netlify.app/favicon.ico",
            "description": "Pakistan's first anonymous, AI-powered harassment reporting platform. Report safely. Stay protected.",
          })
        }}
      />
      {/* Dynamic Background Elements */}
      <div style={{ position: "fixed", top: "-10%", left: "-10%", width: "40%", height: "40%", background: `radial-gradient(circle, ${C.rose}11 0%, transparent 70%)`, filter: "blur(100px)", zIndex: 0, pointerEvents: "none", transform: "translateZ(0)", willChange: "transform" }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: `radial-gradient(circle, ${C.lavender}08 0%, transparent 70%)`, filter: "blur(100px)", zIndex: 0, pointerEvents: "none", transform: "translateZ(0)", willChange: "transform" }} />

      <Navbar isMobile={isMobile} scrolled={scrolled} />
      <Hero isMobile={isMobile} />
      <Features isMobile={isMobile} />
      <Guide isMobile={isMobile} />
      <Stats isMobile={isMobile} />
      <Team isMobile={isMobile} />
      <Footer isMobile={isMobile} />
    </div>
  );
}
