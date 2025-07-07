-- Add missing demographic fields to patients table
-- Run this in your Supabase SQL editor or database admin tool

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS children_count INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS smoking BOOLEAN,
ADD COLUMN IF NOT EXISTS file_reference TEXT,
ADD COLUMN IF NOT EXISTS case_number TEXT,
ADD COLUMN IF NOT EXISTS referring_physician_name TEXT,
ADD COLUMN IF NOT EXISTS referring_physician_phone_1 TEXT,
ADD COLUMN IF NOT EXISTS referring_physician_email TEXT,
ADD COLUMN IF NOT EXISTS third_party_payer TEXT,
ADD COLUMN IF NOT EXISTS medical_ref_number TEXT;

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_patients_case_number ON patients(case_number);
CREATE INDEX IF NOT EXISTS idx_patients_file_reference ON patients(file_reference);
CREATE INDEX IF NOT EXISTS idx_patients_referring_physician ON patients(referring_physician_name);

-- Verify the fields were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position; 