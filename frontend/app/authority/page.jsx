'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Lock, 
  MapPin, 
  Scale, 
  AlertTriangle, 
  User, 
  Phone, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  LogOut,
  Map as MapIcon,
  Search,
  Eye,
  Camera,
  Cpu,
  Radar
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (SSR issues)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function AuthorityPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const AUTH_TOKEN = 'Bearer mehfooz-admin-2024';
  const MASTER_PASSWORD = 'mehfooz-admin-2024';

  const handleLogin = (e) => {
    e.preventDefault();
    setScanning(true);
    
    setTimeout(() => {
      if (password === MASTER_PASSWORD) {
        setIsAuthenticated(true);
        fetchCases();
      } else {
        setError('ACCESS_DENIED: INVALID_CREDENTIALS');
        setScanning(false);
      }
    }, 1500);
  };

  const fetchCases = async () => {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const response = await axios.get(`${baseUrl}/api/v1/authority/cases`, {
        headers: { 'Authorization': AUTH_TOKEN }
      });
      const fetchedCases = response.data.data || [];
      setCases(fetchedCases);
      if (fetchedCases.length > 0) {
        setSelectedCase(fetchedCases[0]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('CORE_SYNC_FAILURE');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080f10] flex items-center justify-center font-mono p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#00F0FF]/10 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#00F0FF]/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-[#192122]/40 backdrop-blur-3xl border border-[#00F0FF]/30 p-8 rounded-xl shadow-[0_0_100px_rgba(0,240,255,0.15)] relative overflow-hidden">
            {/* Scanning Line */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="w-full h-[2px] bg-[#00F0FF] shadow-[0_0_15px_#00F0FF] animate-[scan_1.5s_ease-in-out_infinite]" />
              </div>
            )}

            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-[#00F0FF]/5 rounded-xl flex items-center justify-center border border-[#00F0FF]/20 relative">
                  <Shield className="text-[#00F0FF]" size={40} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00F0FF] rounded-full animate-pulse shadow-[0_0_10px_#00F0FF]" />
                </div>
                <Radar className="absolute -bottom-2 -left-2 text-[#00F0FF]/40 animate-spin" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-[-0.05em]">AUTHORITY PORTAL</h1>
              <div className="mt-2 px-3 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full">
                <p className="text-[#00F0FF] text-[10px] font-bold uppercase tracking-[0.3em]">Restricted Intelligence Access</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[#00F0FF]/60 text-[10px] font-bold uppercase tracking-widest">Access Key</label>
                  <span className="text-[10px] font-mono text-[#00F0FF]/40">SEC_LEVEL_04</span>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00F0FF]/40 group-focus-within:text-[#00F0FF] transition-colors" size={18} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={scanning}
                    className="w-full bg-[#0d1515]/80 border border-[#00F0FF]/20 rounded-lg p-4 pl-12 text-white font-mono placeholder:text-white/10 focus:outline-none focus:border-[#00F0FF] transition-all focus:ring-1 focus:ring-[#00F0FF]/50"
                    placeholder="ENTER AUTHORIZATION"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-[#ff3131]/10 border border-[#ff3131]/30 p-3 rounded text-center">
                  <p className="text-[#ff3131] text-[10px] font-bold uppercase animate-pulse">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={scanning}
                className="w-full py-4 bg-transparent border border-[#00F0FF] text-[#00F0FF] font-bold rounded-lg hover:bg-[#00F0FF]/10 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-[#00F0FF]/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10">{scanning ? 'VERIFYING IDENTITY...' : 'INITIATE SECURE SESSION'}</span>
                {!scanning && <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-[#00F0FF]/10">
              <div className="flex items-center justify-between text-[#00F0FF]/20 text-[9px] font-mono uppercase tracking-widest">
                <span>IP_LOGGED: 192.168.1.*</span>
                <span className="animate-pulse">ENCRYPTION_ACTIVE</span>
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-center text-white/10 text-[10px] uppercase tracking-[0.4em]">
            System monitored by Central Command. Unauthorized access is a federal crime.
          </p>
        </div>

        <style jsx>{`
          @keyframes scan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080f10] text-[#dce4e5] font-sans flex flex-col overflow-hidden selection:bg-[#00F0FF]/30">
      {/* Header */}
      <header className="h-16 border-b border-[#00F0FF]/10 bg-[#192122]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00F0FF]/10 rounded border border-[#00F0FF]/30 flex items-center justify-center">
              <Activity size={18} className="text-[#00F0FF] animate-pulse" />
            </div>
            <div>
              <span className="font-bold tracking-[-0.05em] text-xl block leading-none">MEHFOOZ <span className="text-[#00F0FF]">CORE</span></span>
              <span className="text-[9px] font-mono text-[#00F0FF]/40 uppercase tracking-widest">Tactical Intelligence v1.0.4</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/5" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-ping" />
              LIVE_FEED_ACTIVE
            </div>
            <span className="text-[8px] text-white/20 font-mono">ENCRYPTED_LATENCY: 12ms</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 px-4 py-2 bg-black/40 rounded-full border border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-white/40 uppercase">Incidents</span>
              <span className="text-xs font-bold text-[#00F0FF]">{(cases || []).length}</span>
            </div>
            <div className="w-[1px] bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-white/40 uppercase">Alerts</span>
              <span className="text-xs font-bold text-[#FF3131]">{(cases || []).filter(c => c.credibility_score > 80).length}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[9px] text-[#00F0FF]/40 uppercase font-mono leading-none">AGENT_ID</p>
              <p className="text-xs font-bold text-white uppercase tracking-wider">COMMAND_NODE_01</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="w-10 h-10 flex items-center justify-center hover:bg-[#ff3131]/10 text-[#ff3131] rounded-full transition-all border border-transparent hover:border-[#ff3131]/20 group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Intelligence Feed */}
        <aside className="w-[340px] border-r border-[#00F0FF]/10 flex flex-col shrink-0 bg-[#0d1515]/50 backdrop-blur-xl z-40">
          <div className="p-5 border-b border-[#00F0FF]/10 bg-[#192122]/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input 
                placeholder="FILTER INTEL..." 
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[10px] font-mono text-white focus:outline-none focus:border-[#00F0FF]/40 transition-all uppercase tracking-widest"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="p-12 text-center space-y-4">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 border-2 border-[#00F0FF]/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
                  <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00F0FF]/40" size={16} />
                </div>
                <p className="text-[10px] font-mono text-[#00F0FF]/40 tracking-[0.2em]">SYNCING_INTELLIGENCE...</p>
              </div>
            ) : (
              (cases || []).map((c) => (
                <div 
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`relative p-5 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 group ${selectedCase?.id === c.id ? 'bg-[#00F0FF]/5' : ''}`}
                >
                  {selectedCase?.id === c.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-[#00F0FF]/60 font-bold tracking-widest">#{(c.id || '').split('-')[0]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-white/20 font-mono">{new Date(c.created_at).toLocaleTimeString()}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${c.credibility_score > 80 ? 'bg-[#FF3131] animate-pulse shadow-[0_0_5px_#FF3131]' : 'bg-[#00F0FF]'}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wide group-hover:text-[#00F0FF] transition-colors">{c.title}</h3>
                  
                  <div className="flex items-center gap-3">
                    <div className="px-2 py-0.5 bg-white/5 rounded border border-white/10">
                      <span className="text-[8px] font-mono text-white/40 uppercase">CRED: </span>
                      <span className={`text-[9px] font-bold ${c.credibility_score > 70 ? 'text-[#00F0FF]' : 'text-yellow-500'}`}>{c.credibility_score}%</span>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${c.status === 'REPORTED' ? 'bg-[#ff3131]/10 text-[#ff3131] border-[#ff3131]/20' : 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20'} uppercase tracking-tighter`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center: Intelligence Map */}
        <section className="flex-1 relative bg-[#080f10] z-10">
          {/* Tactical Overlays */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,15,16,0.4)_100%)]" />
            <div className="absolute top-10 left-10 text-[10px] font-mono text-[#00F0FF]/40 space-y-1">
              <p>COORD_LAT: {selectedCase?.latitude?.toFixed(6) || '---'}</p>
              <p>COORD_LNG: {selectedCase?.longitude?.toFixed(6) || '---'}</p>
              <p>ZOOM_LVL: 12.0</p>
            </div>
            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,240,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,1)_1px,transparent_1px)] bg-[size:100px_100px]" />
          </div>

          <div className="w-full h-full relative">
            <MapContainer 
              center={[24.8607, 67.0011]} 
              zoom={12} 
              style={{ height: '100%', width: '100%', background: '#080f10' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              {(cases || []).filter(c => c.latitude && c.longitude).map((c) => (
                <Marker 
                  key={c.id} 
                  position={[c.latitude, c.longitude]}
                  eventHandlers={{
                    click: () => setSelectedCase(c),
                  }}
                >
                  <Popup className="tactical-popup">
                    <div className="bg-[#192122] text-[#dce4e5] p-3 font-mono text-[10px] border border-[#00F0FF]/30 rounded shadow-xl">
                      <p className="font-bold border-b border-[#00F0FF]/20 pb-2 mb-2 text-[#00F0FF] uppercase tracking-widest">INCIDENT_{c.id.split('-')[0]}</p>
                      <p className="mb-1">{c.category}</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                        <span className="text-[#FF3131]">VERIFIED: {c.credibility_score}%</span>
                        <span className="opacity-40">{new Date(c.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedCase?.latitude && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                  <div className="bg-[#192122]/90 backdrop-blur-xl border border-[#00F0FF] px-6 py-3 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FF3131] rounded-full animate-ping" />
                      <span className="text-white text-[11px] font-bold uppercase tracking-[0.2em]">TARGET_LOCK</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/20" />
                    <span className="text-[#00F0FF] text-[10px] font-mono tracking-widest uppercase">
                      {selectedCase.latitude.toFixed(6)} N / {selectedCase.longitude.toFixed(6)} E
                    </span>
                  </div>
                </div>
              )}
            </MapContainer>
          </div>
        </section>

        {/* Right: Dossier View */}
        <aside className="w-[500px] border-l border-[#00F0FF]/10 bg-[#192122]/40 backdrop-blur-xl flex flex-col overflow-y-auto z-40 relative">
          {selectedCase ? (
            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
              {/* Profile Header */}
              <div className="relative">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <div className="w-20 h-20 bg-black/40 rounded border border-[#00F0FF]/30 flex items-center justify-center relative overflow-hidden">
                        <User size={40} className="text-[#00F0FF]/20" />
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,240,255,0.1)_50%,transparent_100%)] bg-[size:100%_4px] animate-[pulse_2s_infinite]" />
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00F0FF]" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00F0FF]" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00F0FF]" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00F0FF]" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#00F0FF] rounded flex items-center justify-center border-2 border-[#192122]">
                        <Eye size={12} className="text-black" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white uppercase tracking-tighter leading-tight">{selectedCase.complainant_name || 'ANONYMOUS SOURCE'}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-[0.2em] px-2 py-0.5 bg-[#00F0FF]/10 rounded">VERIFIED_SOURCE</span>
                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">ID_{selectedCase.sender_phone?.slice(-4) || 'NULL'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-center min-w-[100px]">
                    <p className="text-[9px] text-white/30 uppercase font-mono mb-1">INTEL_SCORE</p>
                    <p className={`text-2xl font-bold ${selectedCase.credibility_score > 70 ? 'text-[#00F0FF]' : 'text-yellow-500'}`}>{selectedCase.credibility_score}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 border border-white/5 rounded-lg relative group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-[#00F0FF]/40 uppercase font-bold mb-2 flex items-center gap-2">
                      <Phone size={12} /> CONTACT_FIELD
                    </p>
                    <p className="text-base font-mono text-white tracking-wider">{selectedCase.sender_phone || '---'}</p>
                  </div>
                  <div className="bg-black/30 p-4 border border-white/5 rounded-lg relative group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-[#00F0FF]/40 uppercase font-bold mb-2 flex items-center gap-2">
                      <FileText size={12} /> IDENT_TOKEN (CNIC)
                    </p>
                    <p className="text-base font-mono text-white tracking-wider">{selectedCase.complainant_cnic || 'NOT_PROVIDED'}</p>
                  </div>
                </div>
              </div>

              {/* Perpetrator Intelligence */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#FF3131] uppercase tracking-[0.3em] flex items-center gap-2">
                    <AlertTriangle size={14} /> SUBJECT_INTEL_EXTRACT
                  </h3>
                  <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-[#FF3131]/20 to-transparent" />
                </div>
                
                <div className="bg-[#FF3131]/5 border border-[#FF3131]/20 p-6 rounded-xl space-y-5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,49,49,0.02)_50%,transparent_75%)] bg-[size:200%_200%] animate-[shimmer_5s_linear_infinite]" />
                  
                  {selectedCase.perpetrator_data ? (
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8 relative z-10">
                      {Object.entries(selectedCase.perpetrator_data).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[9px] text-[#FF3131]/60 uppercase font-bold tracking-widest mb-1">{key.replace('_', ' ')}</span>
                          <span className="text-sm text-white/90 font-medium">{val || 'NOT_IDENTIFIED'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4 space-y-3 opacity-30">
                      <Search size={24} />
                      <p className="text-[10px] uppercase tracking-widest">SCANNING_FOR_SUBJECT_DATA...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#00F0FF] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Camera size={14} /> EVIDENCE_REPOSITORY
                  </h3>
                  <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-[#00F0FF]/20 to-transparent" />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {selectedCase.evidence_urls && selectedCase.evidence_urls.length > 0 ? (
                    selectedCase.evidence_urls.map((url, i) => (
                      <div key={i} className="aspect-square bg-black/40 border border-white/10 rounded overflow-hidden relative group cursor-pointer hover:border-[#00F0FF]/40 transition-colors">
                        <img src={url} alt={`Evidence ${i}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-full h-1 bg-[#00F0FF] shadow-[0_0_10px_#00F0FF] animate-[scan_2s_linear_infinite]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-black/40 border border-white/10 rounded overflow-hidden relative group cursor-pointer hover:border-[#00F0FF]/40 transition-colors">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                          <Camera size={24} />
                        </div>
                        <div className="absolute bottom-1 right-1 text-[8px] font-mono text-white/20">NO_DATA</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">INTELLIGENCE_SUMMARY</h3>
                  <div className="h-[1px] flex-1 mx-4 bg-white/5" />
                </div>
                <div className="bg-black/30 border border-white/5 p-6 rounded-xl relative">
                  <p className="text-sm leading-relaxed text-white/70 italic">"{selectedCase.summary}"</p>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1 h-1 bg-[#00F0FF]/30 rounded-full" />
                    <div className="w-1 h-1 bg-[#00F0FF]/30 rounded-full" />
                    <div className="w-1 h-1 bg-[#00F0FF]/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-8 border-t border-white/5">
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF] rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#00F0FF] hover:text-black transition-all group">
                    <Scale size={16} className="group-hover:scale-110 transition-transform" />
                    GENERATE_FIR_DOC
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#FF3131] text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#FF3131]/90 transition-all shadow-[0_0_20px_rgba(255,49,49,0.2)] group">
                    <Shield size={16} className="group-hover:rotate-12 transition-transform" />
                    DISPATCH_FORCE
                  </button>
                </div>
                <button className="w-full py-3 bg-white/5 border border-white/10 text-white/40 rounded-lg text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white/60 transition-all">
                  ESCALATE_TO_CENTRAL_INTELLIGENCE
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 relative">
                <div className="absolute inset-0 border border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
                <FileText size={40} className="text-white/10" />
              </div>
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-[0.4em] mb-2">AWAITING_SELECTION</h4>
              <p className="text-[10px] text-white/20 uppercase tracking-widest max-w-[200px] mx-auto">Select a record from the live stream to initialize tactical analysis.</p>
            </div>
          )}
        </aside>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-10 bg-[#0d1515] border-t border-[#00F0FF]/10 px-6 flex items-center justify-between text-[10px] font-mono text-[#00F0FF]/40 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_5px_#00F0FF]" />
            <span>DB_SYNC: SYNCHRONIZED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_5px_#00F0FF]" />
            <span>AI_ANALYSER: STANDBY</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_5px_#00F0FF]" />
            <span>V_LINK: AES_256_ENCRYPTED</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 opacity-60">
            <MapIcon size={12} />
            <span>SECTOR_KHI_01</span>
          </div>
          <div className="w-[1px] h-3 bg-white/10" />
          <span>MEHFOOZ_OS_SESSION_{new Date().getTime().toString().slice(-8)}</span>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .font-mono {
          font-family: 'Space Grotesk', monospace !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.3);
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .tactical-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border-radius: 4px !important;
          box-shadow: none !important;
        }
        .tactical-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .tactical-popup .leaflet-popup-tip {
          background: #192122 !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
        }

        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
