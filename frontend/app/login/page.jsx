"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Fingerprint, User, Globe, Activity, ChevronLeft } from "lucide-react";

export default function AuthorityPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [badgeId, setBadgeId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial load animation
      gsap.fromTo(
        ".animate-in",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
      
      gsap.to(".scan-line", {
        y: "100vh",
        duration: 3,
        repeat: -1,
        ease: "linear",
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScan = () => {
    if (!badgeId || !accessKey) {
      setError("CREDENTIALS REQUIRED — ALL FIELDS MUST BE POPULATED");
      gsap.fromTo(".form-container", { x: -5 }, { x: 0, duration: 0.05, repeat: 5, yoyo: true });
      return;
    }

    setIsScanning(true);
    setError(null);

    // Instant frontend validation — no network round-trip needed
    const VALID_BADGE = "MHZ-AUTH-8829";
    const VALID_KEY   = "mehfooz2024";

    if (badgeId.trim() === VALID_BADGE && accessKey.trim() === VALID_KEY) {
      // Short scan animation then redirect
      gsap.to(".scan-indicator", {
        height: "100%",
        duration: 0.8,
        ease: "power1.inOut",
        onComplete: () => {
          // ✅ Store auth token — sessionStorage for client guard + cookie for middleware
          sessionStorage.setItem("mhz_auth", "MHZ-AUTH-8829");
          document.cookie = "mhz_auth=MHZ-AUTH-8829; path=/; SameSite=Strict";
          router.push("/dashboard");
        },
      });
    } else {
      setIsScanning(false);
      setError("ACCESS DENIED — INVALID NODE CREDENTIALS");
      gsap.to(".scan-indicator", { height: "0%", duration: 0.3 });
      gsap.fromTo(".form-container", { x: -5 }, { x: 0, duration: 0.05, repeat: 5, yoyo: true });
    }
  };

  const toggleMode = () => {
    gsap.to(formRef.current, {
      opacity: 0,
      scale: 0.97,
      duration: 0.3,
      onComplete: () => {
        setIsLogin(!isLogin);
        gsap.fromTo(
          formRef.current,
          { opacity: 0, scale: 1.03 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
        );
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#020617] text-white flex flex-col font-sans relative overflow-hidden selection:bg-[#00ffff]/30"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Radial Glow for center focus */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2)_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 animate-in">
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 group"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900/50 border border-white/5 backdrop-blur-md
                          group-hover:border-[#00ffff]/40 group-hover:bg-slate-900/80
                          transition-all duration-300">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00ffff]/10 
                            group-hover:bg-[#00ffff]/20 transition-all duration-300">
              <ChevronLeft size={14} className="text-[#00ffff] transition-colors" />
            </div>
            <span className="font-medium text-xs tracking-wider uppercase text-slate-300 group-hover:text-[#00ffff] transition-colors duration-300">
              Return to Nexus
            </span>
          </div>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-20 flex-grow flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-[460px]">
          
          {/* Form Container */}
          <div className="animate-in form-container relative group">
            
            <div className="backdrop-blur-[24px] bg-[#020813]/40 bg-gradient-to-b from-white/[0.04] to-transparent border border-[#00ffff]/30 rounded-[40px] px-10 py-12 sm:px-12 sm:py-14 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8),0_0_50px_rgba(0,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden">
              {/* Inner subtle glow / border highlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-[#00ffff]/60 to-transparent shadow-[0_0_15px_rgba(0,255,255,0.8)]"></div>

              {/* Logo Header */}
              <div className="text-center mb-12 flex flex-col items-center">
                <div className="relative flex items-center justify-center w-16 h-16 mb-5">
                  <Shield className="w-16 h-16 text-slate-300 stroke-[1.2] drop-shadow-[0_0_10px_rgba(0,255,255,0.2)]" />
                  <div className="absolute inset-0 flex items-center justify-center ml-[-1px] mt-[-2px]">
                    <span className="font-bold text-[28px] text-slate-200 tracking-tighter">M</span>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold tracking-wide mb-2 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  MEHFOOZ<span className="text-[#00ffff]">AI</span>
                </h1>
                <p className="text-slate-400 text-[11px] tracking-[0.2em] uppercase font-medium">
                  Authority Intelligence Portal
                </p>
              </div>

              <div ref={formRef} className="relative z-10 w-full">
                {isLogin ? (
                  /* ── Login Form ── */
                  <div className="space-y-8 w-full">

                    {/* Officer Badge ID Field */}
                    <div className="space-y-6 group/input">
                      <label className="text-sm  font-medium text-slate-300 block ml-1 tracking-wide mb-4">
                        Officer Badge ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Shield size={20} className="text-slate-400 group-focus-within/input:text-[#00ffff] transition-colors" />
                        </div>
                        <input 
                          type="text" 
                          value={badgeId || ""}
                          onChange={(e) => setBadgeId(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleScan()}
                          className="block w-full pl-14 pr-5 py-[16px] bg-slate-900/50 border border-[#00ffff]/50 text-white placeholder-slate-500 
                                     focus:outline-none focus:border-[#00ffff] focus:bg-slate-900/80 focus:shadow-[0_0_20px_rgba(0,255,255,0.2),inset_0_2px_10px_rgba(0,0,0,0.5)]
                                     transition-all duration-300 text-[15px] rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                          placeholder="Enter your Badge ID"
                        />
                      </div>
                    </div>

                    {/* Access Key Field */}
                    <div className="space-y-3 group/input">
                      <label className="text-sm font-medium text-slate-300 block ml-1 tracking-wide">
                        Access Key
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Lock size={20} className="text-slate-400 group-focus-within/input:text-[#00ffff] transition-colors" />
                        </div>
                        <input 
                          type="password" 
                          value={accessKey || ""}
                          onChange={(e) => setAccessKey(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleScan()}
                          className="block w-full pl-14 pr-5 py-[18px] bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 
                                     focus:outline-none focus:border-[#00ffff]/60 focus:bg-slate-900/80 focus:shadow-[0_0_20px_rgba(0,255,255,0.1),inset_0_2px_10px_rgba(0,0,0,0.5)]
                                     transition-all duration-300 text-[15px] rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                          placeholder="Enter your Access Key"
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="text-center pt-1">
                        <p className="text-[15px] text-red-400 font-medium">{error}</p>
                      </div>
                    )}

                    {/* Biometric Scan Section */}
                    <div className="flex flex-col items-center justify-center pt-6 pb-2">
                      <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        id="biometric-scan-btn"
                        className={`relative w-20 h-20 flex items-center justify-center rounded-full bg-slate-900/50 border-2 
                          ${isScanning ? 'border-[#00ffff] shadow-[0_0_30px_rgba(0,255,255,0.6)]' : 'border-[#00ffff]/80 shadow-[0_0_20px_rgba(0,255,255,0.3)]'} 
                          transition-all duration-500 group/scan active:scale-95`}
                      >
                        {isScanning && (
                          <div className="absolute inset-0 rounded-full border border-[#00ffff] animate-ping opacity-30"></div>
                        )}
                        
                        <Fingerprint className={`w-10 h-10 ${isScanning ? 'text-[#00ffff] animate-pulse' : 'text-[#00ffff]'} transition-colors duration-500`} />
                      </button>

                      <p className="mt-6 text-[12px] font-semibold tracking-widest text-slate-300">
                        {isScanning ? 'AUTHENTICATING...' : 'TAP TO SCAN BIOMETRICS'}
                      </p>
                    </div>

                    {/* SECURE LOGIN Button */}
                    <div className="pt-2">
                      <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="w-full bg-gradient-to-r from-[#00ffff] to-[#00cccc] text-black py-[18px] rounded-full font-bold text-[15px] tracking-[0.1em] shadow-[0_0_25px_rgba(0,255,255,0.4)]
                                   hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] hover:brightness-110
                                   transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isScanning ? 'PROCESSING...' : 'SECURE LOGIN'}
                      </button>
                    </div>
                    
                    {/* Footer Links */}
                    <div className="flex flex-col items-center gap-4 pt-6 text-[15px] font-medium text-slate-400">
                      <button className="hover:text-white transition-colors">Forgot Password?</button>
                      <button onClick={toggleMode} className="hover:text-[#00ffff] transition-colors">Request Access</button>
                    </div>

                  </div>
                ) : (
                  /* ── Registration Form ── */
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2.5">
                        <label className="text-sm font-medium text-slate-300 ml-1 tracking-wide">First Name</label>
                        <input type="text" className="block w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffff]/60 transition-all text-[15px] rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" placeholder="Ahmed" />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-medium text-slate-300 ml-1 tracking-wide">Last Name</label>
                        <input type="text" className="block w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffff]/60 transition-all text-[15px] rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" placeholder="Khan" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300 ml-1 tracking-wide"><Globe size={16} /> Official Department</label>
                      <input type="text" className="block w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffff]/60 transition-all text-[15px] rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" placeholder="Cyber Division" />
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-sm font-medium text-slate-300 ml-1 tracking-wide">Security Clearance</label>
                      <select className="block w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffff]/60 transition-all text-[15px] appearance-none rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                        <option className="bg-slate-900 text-white">Level 1 (Standard Access)</option>
                        <option className="bg-slate-900 text-white">Level 2 (Investigative)</option>
                        <option className="bg-slate-900 text-white">Level 3 (Admin / Full Clear)</option>
                      </select>
                    </div>

                    <div className="pt-6">
                      <button 
                        onClick={() => setIsLogin(true)}
                        className="w-full relative bg-transparent border-2 border-[#00ffff]/40 text-[#00ffff] py-4 text-[15px] font-bold tracking-[0.1em] hover:bg-[#00ffff]/10 hover:border-[#00ffff]/80 transition-all duration-300 rounded-full"
                      >
                        Request Access Code
                      </button>
                    </div>
                    
                    <div className="flex flex-col items-center pt-6 text-[15px] font-medium text-slate-400">
                      <button onClick={toggleMode} className="hover:text-white transition-colors">Already have access? Verify Credentials</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #1e293b inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      ` }} />
    </div>
  );
}
