-- Complete Database Schema Fix for AI Clinic Assistant
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (this will remove any existing data)
DROP TABLE IF EXISTS recordings CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create patients table with correct UUID schema
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recordings table with correct UUID schema
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    transcript TEXT DEFAULT '',
    patient_id UUID REFERENCES patients(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX idx_recordings_patient_id ON recordings(patient_id);
CREATE INDEX idx_patients_search ON patients(name, date_of_birth, phone);

-- Verify the schema
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('patients', 'recordings') 
ORDER BY table_name, ordinal_position; 