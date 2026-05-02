"use client";
/**
 * LiveSafetyMap — Real Leaflet + CartoDB Dark Matter tiles (free, no key)
 * FIX: Uses callback ref pattern to avoid "Map container not found" in Next.js
 * Live-syncs with /api/v1/heatmap every 10 seconds.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ZONE_LABELS = [
  { name: "Saddar",           lat: 24.8568, lng: 67.0104 },
  { name: "Gulshan-e-Iqbal",  lat: 24.9210, lng: 67.0911 },
  { name: "Lyari",            lat: 24.8607, lng: 67.0008 },
  { name: "Korangi",          lat: 24.8238, lng: 67.1282 },
  { name: "North Nazimabad",  lat: 24.9408, lng: 67.0397 },
  { name: "SITE",             lat: 24.8961, lng: 67.0124 },
  { name: "Defence (DHA)",    lat: 24.8128, lng: 67.0640 },
  { name: "Clifton",          lat: 24.8035, lng: 67.0314 },
  { name: "Orangi Town",      lat: 24.9479, lng: 66.9949 },
  { name: "Malir",            lat: 24.8804, lng: 67.1921 },
];

const C = {
  midnight:"#0b0f1a", deep:"#111827", surface:"#1a2236",
  border:"rgba(255,255,255,0.07)", border2:"rgba(255,255,255,0.12)",
  rose:"#e8637a", roseLight:"#f28fa0", roseDim:"rgba(232,99,122,0.15)",
  teal:"#2dd4bf", tealDim:"rgba(45,212,191,0.12)",
  amber:"#f5a623", lavender:"#a78bfa",
  green:"#34d399", red:"#f87171",
  text:"#f0f4ff", text2:"#8b9bb4", text3:"#4a5568",
};

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeZoneIntensities(points) {
  return ZONE_LABELS.map((zone) => {
    let total = 0;
    for (const p of points) {
      const d = distKm(zone.lat, zone.lng, p.lat, p.lng);
      if (d < 3.5) total += (p.intensity || 1);
    }
    const level =
      total === 0 ? 0 :
      total < 3   ? 1 :
      total < 8   ? 2 :
      total < 15  ? 3 :
      total < 25  ? 4 : 5;
    return { ...zone, count: total, level };
  }).sort((a, b) => b.count - a.count);
}

function intensityColor(level) {
  if (level >= 5) return C.red;
  if (level >= 4) return C.rose;
  if (level >= 3) return C.amber;
  if (level >= 2) return C.teal;
  return C.green;
}

export default function LiveSafetyMap() {
  // ── CRITICAL FIX: use a state-based container ref ──────────────────────
  // mapContainer state is set via callback ref once DOM node is mounted.
  // This guarantees Leaflet only runs AFTER the element exists in the DOM.
  const [mapContainer, setMapContainer] = useState(null);
  const leafletMap  = useRef(null);
  const heatLayer   = useRef(null);
  const pinsLayer   = useRef([]);   // holds active location pin markers

  const [points,     setPoints]    = useState([]);
  const [zones,      setZones]     = useState([]);
  const [lastSync,   setLastSync]  = useState(null);
  const [isLoading,  setIsLoading] = useState(true);
  const [totalCases, setTotalCases]= useState(0);

  /* callback ref — fires when the div mounts/unmounts */
  const containerRef = useCallback((node) => {
    if (node) setMapContainer(node);
  }, []);

  /* ── Fetch heatmap + draw live pins ─────────────────────────────────── */
  const fetchHeatmap = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/v1/heatmap`);
      const json = await res.json();
      const pts  = Array.isArray(json.data) ? json.data : [];

      setZones(computeZoneIntensities(pts));
      setLastSync(new Date());

      if (heatLayer.current && leafletMap.current) {
        // ── 1. Update heat layer (stronger intensity so blobs are visible) ──
        const lPts = pts.map((p) => [p.lat, p.lng, (p.intensity || 1) * 0.6]);
        heatLayer.current.setLatLngs(lPts);

        // ── 2. Aggregate points by nearest known zone ────────────────────
        // Build a bucket map: zone name → { lat, lng, count, color }
        const L = (await import("leaflet")).default;
        const buckets = {};
        for (const p of pts) {
          // find closest ZONE_LABELS entry
          let bestZone = null, bestDist = Infinity;
          for (const z of ZONE_LABELS) {
            const d = distKm(p.lat, p.lng, z.lat, z.lng);
            if (d < bestDist) { bestDist = d; bestZone = z; }
          }
          if (bestZone) {
            const key = bestZone.name;
            if (!buckets[key]) buckets[key] = { lat: bestZone.lat, lng: bestZone.lng, count: 0 };
            buckets[key].count += (p.intensity || 1);
          }
        }

        // ── 3. Remove old pins ───────────────────────────────────────────
        pinsLayer.current.forEach(m => m.remove());
        pinsLayer.current = [];

        // ── 4. Draw glowing circle pin + bold label per zone ────────────
        Object.entries(buckets).forEach(([name, { lat, lng, count }]) => {
          const intensity = count < 3 ? 1 : count < 8 ? 2 : count < 15 ? 3 : count < 25 ? 4 : 5;
          const color = [C.green, C.teal, C.amber, C.rose, C.red][Math.min(intensity - 1, 4)];
          const radius = 10 + intensity * 4;   // bigger circle for hotter zones

          // Glowing circle marker
          const circle = L.circleMarker([lat, lng], {
            radius,
            color,
            fillColor: color,
            fillOpacity: 0.25,
            weight: 2,
            opacity: 0.9,
          }).addTo(leafletMap.current)
            .bindTooltip(`<b>${name}</b><br/>${count} incident${count !== 1 ? 's' : ''}`, {
              permanent: false, direction: 'top', className: 'mhz-tooltip'
            });

          // Bold city label pinned to map
          const labelIcon = L.divIcon({
            className: '',
            html: `<div style="
              background: rgba(11,15,26,0.88);
              border: 1.5px solid ${color};
              color: ${color};
              font-size: 11px;
              font-family: 'DM Sans', sans-serif;
              font-weight: 700;
              padding: 2px 8px 2px 6px;
              border-radius: 20px;
              white-space: nowrap;
              backdrop-filter: blur(6px);
              pointer-events: none;
              box-shadow: 0 0 8px ${color}55;
              display: flex; align-items: center; gap: 5px;
            ">
              <span style="
                background:${color}; border-radius:50%;
                width:6px; height:6px; display:inline-block;
                box-shadow:0 0 6px ${color};
              "></span>
              ${name}
              <span style="
                background:${color}22; border:1px solid ${color}66;
                border-radius:10px; padding:0 5px; font-size:10px;
                color:${color};
              ">${count}</span>
            </div>`,
            iconAnchor: [0, -radius - 4],
          });
          const label = L.marker([lat, lng], { icon: labelIcon, interactive: false })
            .addTo(leafletMap.current);

          pinsLayer.current.push(circle, label);
        });

        // ── 5. Auto-fit bounds on first load or new case added ───────────
        setTotalCases(prev => {
          if (prev !== pts.length && pts.length > 0) {
            const lats = pts.map(p => p.lat);
            const lngs = pts.map(p => p.lng);
            leafletMap.current.fitBounds(
              [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
              { padding: [60, 60], maxZoom: 13 }
            );
          }
          return pts.length;
        });
      }

      setPoints(pts);
    } catch (err) {
      console.error("Heatmap fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Init Leaflet ONLY after DOM node is ready ──────────────────────── */
  useEffect(() => {
    if (!mapContainer) return;
    if (leafletMap.current) return; // prevent double-init

    let destroyed = false;

    const init = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // leaflet.heat doesn't have a default export; import for side-effects
        if (typeof window !== "undefined") {
          await import("leaflet.heat");
        }

        if (destroyed || !mapContainer) return;

        // Fix missing marker icons in Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapContainer, {
          center:          [24.8607, 67.0104],
          zoom:            12,
          zoomControl:     true,
          preferCanvas:    true,
          attributionControl: true,
        });

        leafletMap.current = map;

        // CartoDB Dark Matter — free, no API key needed
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: "abcd",
            maxZoom:    20,
          }
        ).addTo(map);

        // Heat layer — higher radius + lower min opacity for visibility
        const heat = L.heatLayer([], {
          radius:  40,
          blur:    30,
          maxZoom: 16,
          minOpacity: 0.4,
          max:     1.0,
          gradient: {
            0.0:  "transparent",
            0.2:  "#2dd4bf",
            0.45: "#f5a623",
            0.65: "#e8637a",
            0.85: "#f87171",
            1.0:  "#ffffff",
          },
        }).addTo(map);
        heatLayer.current = heat;
        // Dynamic pins are added in fetchHeatmap — no static zone labels here

        // Initial data load
        await fetchHeatmap();

      } catch (err) {
        console.error("Leaflet init error:", err);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      destroyed = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        heatLayer.current  = null;
      }
    };
  }, [mapContainer, fetchHeatmap]);

  /* ── Live sync every 10 seconds ─────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(fetchHeatmap, 10_000);
    return () => clearInterval(id);
  }, [fetchHeatmap]);

  const formatTime = (d) =>
    d
      ? d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "--:--";

  return (
    <div style={{ padding:"16px 26px 20px", display:"flex", flex:1, gap:14, overflow:"hidden" }}>

      {/* ── MAP ─────────────────────────────────────────────────────────── */}
      <div style={{
        flex:1, position:"relative", borderRadius:16,
        overflow:"hidden", border:`1px solid ${C.border}`,
        background:C.midnight,
      }}>
        {/* The div Leaflet mounts into — assigned via callback ref */}
        <div
          ref={containerRef}
          style={{ position:"absolute", inset:0, zIndex:1 }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div style={{
            position:"absolute", inset:0, zIndex:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(11,15,26,0.85)", backdropFilter:"blur(4px)",
          }}>
            <div style={{ textAlign:"center" }}>
              <div style={{
                width:40, height:40,
                border:`3px solid ${C.teal}`,
                borderTopColor:"transparent", borderRadius:"50%",
                animation:"spin 0.8s linear infinite",
                margin:"0 auto 12px",
              }} />
              <div style={{ fontSize:13, color:C.teal }}>Loading live map…</div>
            </div>
          </div>
        )}

        {/* Top-left info badge */}
        <div style={{
          position:"absolute", top:14, left:14, zIndex:20,
          background:"rgba(11,15,26,0.88)", backdropFilter:"blur(8px)",
          padding:"7px 13px", borderRadius:10, border:`1px solid ${C.border}`,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{
              width:7, height:7, borderRadius:"50%",
              background:C.teal, animation:"pulse 2s infinite", flexShrink:0,
            }} />
            <span style={{ fontSize:12, fontWeight:700, color:C.text }}>
              Live Safety Heatmap
            </span>
          </div>
          <div style={{ fontSize:10.5, color:C.text2, marginTop:2 }}>
            OpenStreetMap · syncs every 10s · {totalCases} incident{totalCases !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Sync timestamp */}
        <div style={{
          position:"absolute", bottom:14, left:14, zIndex:20,
          background:"rgba(11,15,26,0.82)", backdropFilter:"blur(6px)",
          padding:"5px 12px", borderRadius:8, border:`1px solid ${C.border}`,
          fontSize:10.5, color:C.text3,
        }}>
          Last sync: {formatTime(lastSync)}
        </div>
      </div>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <div style={{ width:260, display:"flex", flexDirection:"column", gap:12, overflowY:"auto" }}>

        {/* Intensity legend */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:16, padding:"15px",
        }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:12 }}>
            Intensity Scale
          </div>
          {[
            { level:5, label:"Critical Hotspot", color:C.red },
            { level:4, label:"High Activity",    color:C.rose },
            { level:3, label:"Moderate",         color:C.amber },
            { level:2, label:"Low Activity",     color:C.teal },
            { level:1, label:"Minimal",          color:C.green },
            { level:0, label:"No Data",          color:C.text3 },
          ].map(({ level, label, color }) => (
            <div key={level} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
              <div style={{
                width:10, height:10, borderRadius:"50%",
                background:color, flexShrink:0,
                boxShadow: level >= 3 ? `0 0 6px ${color}` : "none",
              }} />
              <span style={{ fontSize:12, color:C.text2, flex:1 }}>{label}</span>
              <div style={{ display:"flex", gap:2 }}>
                {Array.from({ length:5 }).map((_, j) => (
                  <div key={j} style={{
                    width:4, height:4, borderRadius:1,
                    background: j < level ? color : C.border2,
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Top Hotspots (live computed from real DB points) */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:16, padding:"15px", flex:1,
        }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:12 }}>
            Top Hotspots
          </div>
          {zones.slice(0, 8).map((z, i) => (
            <div key={z.name} style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"8px 0",
              borderBottom: i < 7 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize:11, color:C.text3, width:16, flexShrink:0 }}>
                #{i + 1}
              </span>
              <span style={{ fontSize:12.5, color:C.text, flex:1 }}>{z.name}</span>
              <div style={{ display:"flex", gap:2, alignItems:"center" }}>
                {Array.from({ length:5 }).map((_, j) => (
                  <div key={j} style={{
                    width:4, height:8, borderRadius:2,
                    background: j < z.level ? intensityColor(z.level) : C.border2,
                    transition:"background 0.5s",
                  }} />
                ))}
              </div>
              <span style={{
                fontSize:10, color:intensityColor(z.level),
                fontWeight:700, minWidth:18, textAlign:"right",
              }}>
                {z.count}
              </span>
            </div>
          ))}
          {zones.every(z => z.count === 0) && (
            <div style={{
              textAlign:"center", padding:"20px 0",
              fontSize:12, color:C.text3, lineHeight:1.6,
            }}>
              No incident data yet.<br/>
              Awaiting reports...
            </div>
          )}
        </div>

        {/* Live stats */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:16, padding:"15px",
        }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>
            Live Overview
          </div>
          {[
            { label:"Total Points",    value:totalCases,                            color:C.rose },
            { label:"Active Zones",    value:zones.filter(z => z.level > 0).length, color:C.teal },
            { label:"Critical Areas",  value:zones.filter(z => z.level >= 4).length, color:C.red },
            { label:"Sync Interval",   value:"10s",                                 color:C.amber },
          ].map((s, i) => (
            <div key={i} style={{
              display:"flex", justifyContent:"space-between",
              padding:"6px 0",
              borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize:12, color:C.text2 }}>{s.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        .leaflet-control-attribution {
          background: rgba(11,15,26,0.75) !important;
          color: #4a5568 !important;
          font-size: 9px !important;
          backdrop-filter: blur(4px);
        }
        .leaflet-control-attribution a { color: #4a5568 !important; }
        .leaflet-control-zoom a {
          background: rgba(26,34,54,0.9) !important;
          color: #8b9bb4 !important;
          border-color: rgba(255,255,255,0.07) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(45,212,191,0.15) !important;
          color: #2dd4bf !important;
        }
      `}</style>
    </div>
  );
}
