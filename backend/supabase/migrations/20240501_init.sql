-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    transcription TEXT,
    media_url TEXT,
    category TEXT, -- Harassment, Verbal, Physical, etc.
    status TEXT DEFAULT 'pending', -- pending, drafted, routed, closed
    location_name TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    ppc_sections   TEXT[], -- Array of Pakistan Penal Code sections
    is_emergency   BOOLEAN DEFAULT false,
    fir_draft      TEXT,
    routing_info   JSONB,
    safety_zone    JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create safety_heatmap table for visualization
CREATE TABLE IF NOT EXISTS safety_heatmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    intensity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_heatmap ENABLE ROW LEVEL SECURITY;

-- Allow public read access to heatmap for visualization
CREATE POLICY "Public Read Heatmap" ON safety_heatmap FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service Role Full Access Incidents" ON incidents 
    USING (auth.role() = 'service_role');

CREATE POLICY "Service Role Full Access Heatmap" ON safety_heatmap 
    USING (auth.role() = 'service_role');
