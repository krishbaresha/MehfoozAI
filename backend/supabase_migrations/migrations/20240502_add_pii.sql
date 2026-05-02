-- Add PII and Intelligence columns to incidents table
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS complainant_name TEXT,
ADD COLUMN IF NOT EXISTS complainant_email TEXT,
ADD COLUMN IF NOT EXISTS complainant_cnic TEXT,
ADD COLUMN IF NOT EXISTS perpetrator_data JSONB,
ADD COLUMN IF NOT EXISTS evidence_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS incident_type TEXT,
ADD COLUMN IF NOT EXISTS credibility_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intent_analysis TEXT;

-- Update column names if they differ from save_incident mapping
-- In save_incident we use "location", but schema has "location_name"
-- Let's add "location" as an alias or rename it. 
-- Actually, let's just add "location" as TEXT.
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location TEXT;
