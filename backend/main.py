import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List

import openai
from fastapi import FastAPI, File, HTTPException, UploadFile, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import Client, create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Clinic Assistant", version="1.0.0")

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY]):
    logger.error("Missing required environment variables")
    raise ValueError("Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY

# Helper functions for file processing
async def process_audio_file(file_content: bytes, unique_filename: str, content_type: str) -> str:
    """Process audio file with Whisper transcription and segmentation for long files."""
    try:
        logger.info("Starting audio transcription with OpenAI Whisper...")
        
        # Create temporary file for processing
        temp_file_path = f"/tmp/{unique_filename}"
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(file_content)
        
        # Use ffmpeg to get audio duration and segment if needed
        import subprocess
        import json
        
        # Get audio duration using ffprobe
        logger.info("Getting audio duration with ffprobe...")
        try:
            duration_cmd = [
                "ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_format", temp_file_path
            ]
            duration_result = subprocess.run(duration_cmd, capture_output=True, text=True, check=True)
            duration_info = json.loads(duration_result.stdout)
            duration_seconds = float(duration_info["format"]["duration"])
            duration_minutes = duration_seconds / 60
            logger.info(f"Audio duration: {duration_minutes:.2f} minutes ({duration_seconds:.1f} seconds)")
        except Exception as e:
            logger.error(f"Failed to get duration with ffprobe: {e}")
            # Fallback: assume it's a long file and try segmentation anyway
            duration_minutes = 15  # Default to assume it's long
            duration_seconds = duration_minutes * 60  # Convert to seconds
        
        if duration_minutes > 10:
            logger.info(f"Long audio detected ({duration_minutes:.2f} min). Segmenting into 5-minute chunks...")
            
            # Segment audio into 5-minute chunks using ffmpeg
            chunk_duration = 300  # 5 minutes in seconds
            transcripts = []
            chunk_number = 0
            
            start_time = 0
            while start_time < duration_seconds:
                chunk_number += 1
                chunk_filename = f"/tmp/chunk_{chunk_number}_{unique_filename}.wav"
                
                logger.info(f"Creating chunk {chunk_number} starting at {start_time:.1f}s")
                
                # Use ffmpeg to extract chunk
                try:
                    ffmpeg_cmd = [
                        "ffmpeg", "-i", temp_file_path,
                        "-ss", str(start_time),
                        "-t", str(chunk_duration),
                        "-acodec", "pcm_s16le",
                        "-ar", "16000",
                        "-ac", "1",
                        "-y",  # Overwrite output
                        chunk_filename
                    ]
                    subprocess.run(ffmpeg_cmd, capture_output=True, check=True)
                    
                    # Check if chunk file was created and has content
                    if os.path.exists(chunk_filename) and os.path.getsize(chunk_filename) > 1000:
                        logger.info(f"Chunk {chunk_number} created successfully")
                        
                        # Transcribe this chunk
                        try:
                            with open(chunk_filename, "rb") as chunk_file:
                                chunk_transcription = openai.audio.transcriptions.create(
                                    model="whisper-1",
                                    file=chunk_file,
                                    response_format="text"
                                )
                                chunk_transcript = chunk_transcription.strip()
                                
                            if chunk_transcript:
                                transcripts.append(f"[Segment {chunk_number}] {chunk_transcript}")
                                logger.info(f"Chunk {chunk_number} transcribed: {chunk_transcript[:50]}...")
                            else:
                                logger.warning(f"Chunk {chunk_number} produced empty transcript")
                                
                        except Exception as e:
                            logger.error(f"Failed to transcribe chunk {chunk_number}: {str(e)}")
                            transcripts.append(f"[Segment {chunk_number}] Transcription failed: {str(e)}")
                    else:
                        logger.warning(f"Chunk {chunk_number} file not created or too small")
                        
                except subprocess.CalledProcessError as e:
                    logger.error(f"FFmpeg failed for chunk {chunk_number}: {e}")
                    transcripts.append(f"[Segment {chunk_number}] Segmentation failed")
                
                finally:
                    # Clean up chunk file
                    try:
                        if os.path.exists(chunk_filename):
                            os.unlink(chunk_filename)
                    except:
                        pass
                
                start_time += chunk_duration
            
            # Combine all transcripts
            if transcripts:
                transcript = "\n\n".join(transcripts)
                logger.info(f"Segmented transcription completed. Total segments: {len(transcripts)}")
            else:
                transcript = "Transcription failed: No segments could be processed"
                logger.error("No successful segment transcriptions")
                
        else:
            # File is short enough, transcribe directly
            logger.info("Short audio file, transcribing directly...")
            
            # Check file size first (25MB limit)
            file_size_mb = len(file_content) / (1024 * 1024)
            logger.info(f"File size: {file_size_mb:.2f} MB")
            
            if file_size_mb > 25:
                # Convert to a more compressed format using ffmpeg
                logger.info("File too large, converting to compressed format with ffmpeg...")
                compressed_path = f"/tmp/compressed_{unique_filename}.wav"
                
                try:
                    compress_cmd = [
                        "ffmpeg", "-i", temp_file_path,
                        "-acodec", "pcm_s16le",
                        "-ar", "16000",
                        "-ac", "1",
                        "-y",  # Overwrite output
                        compressed_path
                    ]
                    subprocess.run(compress_cmd, capture_output=True, check=True)
                    
                    # Check compressed size
                    compressed_size_mb = os.path.getsize(compressed_path) / (1024 * 1024)
                    logger.info(f"Compressed file size: {compressed_size_mb:.2f} MB")
                    
                    if compressed_size_mb <= 25:
                        with open(compressed_path, "rb") as audio_file:
                            transcription_response = openai.audio.transcriptions.create(
                                model="whisper-1",
                                file=audio_file,
                                response_format="text"
                            )
                            transcript = transcription_response.strip()
                    else:
                        transcript = f"File too large even after compression ({compressed_size_mb:.2f} MB)"
                    
                except subprocess.CalledProcessError as e:
                    logger.error(f"FFmpeg compression failed: {e}")
                    transcript = "Transcription failed: Audio compression failed"
                
                # Clean up compressed file
                try:
                    if os.path.exists(compressed_path):
                        os.unlink(compressed_path)
                except:
                    pass
            else:
                # Direct transcription
                with open(temp_file_path, "rb") as audio_file:
                    transcription_response = openai.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="text"
                    )
                    transcript = transcription_response.strip()
            
            logger.info(f"Direct transcription completed: {transcript[:100]}...")
        
        # Clean up main temp file
        try:
            os.unlink(temp_file_path)
        except:
            pass
        
        return transcript
        
    except Exception as e:
        logger.error(f"Audio transcription failed: {str(e)}")
        return f"Audio transcription failed: {str(e)}"

async def process_pdf_file(file_content: bytes, unique_filename: str) -> str:
    """Extract text from PDF file."""
    try:
        # For now, return a placeholder - PDF text extraction requires additional libraries
        logger.info("PDF processing - placeholder implementation")
        return f"PDF file uploaded: {unique_filename}\n\n[PDF text extraction not yet implemented - please use manual transcript entry for PDF content]"
    except Exception as e:
        logger.error(f"PDF processing failed: {str(e)}")
        return f"PDF processing failed: {str(e)}"

# Response models
class Patient(BaseModel):
    id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    marital_status: Optional[str] = None
    children_count: Optional[int] = None
    phone_1: Optional[str] = None
    phone_2: Optional[str] = None
    phone: Optional[str] = None  # Legacy compatibility
    email: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    smoking: Optional[bool] = None
    country_of_birth: Optional[str] = None
    city_of_birth: Optional[str] = None
    file_reference: Optional[str] = None
    case_number: Optional[str] = None
    referring_physician_name: Optional[str] = None
    referring_physician_phone_1: Optional[str] = None
    referring_physician_email: Optional[str] = None
    third_party_payer: Optional[str] = None
    medical_ref_number: Optional[str] = None
    clinical_notes: Optional[str] = None
    created_at: Optional[datetime] = None

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: str
    marital_status: Optional[str] = None
    children_count: Optional[int] = None
    phone_1: str
    phone_2: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    smoking: Optional[bool] = None
    country_of_birth: Optional[str] = None
    city_of_birth: Optional[str] = None
    file_reference: Optional[str] = None
    case_number: Optional[str] = None
    referring_physician_name: Optional[str] = None
    referring_physician_phone_1: Optional[str] = None
    referring_physician_email: Optional[str] = None
    third_party_payer: Optional[str] = None
    medical_ref_number: Optional[str] = None
    clinical_notes: Optional[str] = None

class PatientSearch(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class UploadResponse(BaseModel):
    id: str
    filename: str
    transcript: Optional[str] = None
    summary: Optional[str] = None
    patient_id: Optional[str] = None
    created_at: datetime
    extraction_metadata: Optional[dict] = None  # New field to show which fields were extracted

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

class NewPatientConsultationData(BaseModel):
    first_name: str
    last_name: str
    gender: Optional[str] = None
    date_of_birth: str
    phone_1: str
    phone_2: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    national_id: Optional[str] = None

# AI Summary Generation Function
async def generate_consultation_summary(transcript: str) -> str:
    """Generate AI-powered consultation summary using GPT-4."""
    try:
        logger.info("Generating AI consultation summary with GPT-4...")
        
        # Skip summary if transcript is too short
        if len(transcript.strip()) < 50:
            logger.info("Transcript too short for meaningful summary")
            return "Transcript too short for summary generation."
        
        # Medical prompt for GPT-4 - multilingual support
        medical_prompt = """You are a medical assistant helping an oncologist. You can understand and respond in multiple languages.

IMPORTANT: Always respond in the same language as the input transcript. If the transcript is in Arabic, respond in Arabic. If it's in French, respond in French, etc.

Given the following transcript, create bullet points focusing on:
- history of present illness  
- significant past events
- planned investigations or treatments
- comorbidities and relevant medical history

Only include direct facts, no generic comments. Be precise and use a clinical tone. Remember to respond in the same language as the transcript."""
        
        # Create the chat completion request
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": medical_prompt},
                {"role": "user", "content": transcript}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        summary = response.choices[0].message.content.strip()
        logger.info(f"Generated summary: {len(summary)} characters")
        
        return summary
        
    except Exception as e:
        logger.error(f"Failed to generate AI summary: {str(e)}")
        return f"Summary generation failed: {str(e)}"

async def extract_patient_demographics_from_transcript(transcript: str) -> dict:
    """Extract patient demographic information from consultation transcript."""
    try:
        messages = [
            {
                "role": "system",
                "content": """You are a medical AI assistant specialized in extracting patient demographic information from consultation transcripts. 
                
IMPORTANT: The input transcript may be in any language (Arabic, English, French, etc.), but you MUST extract and return ALL demographic information in ENGLISH only. Translate names, places, occupations, and all other information to English.

Extract the following patient information from the transcript:
- First name (translate to English if needed)
- Last name (translate to English if needed)
- Father's name (translate to English if needed)
- Mother's name (translate to English if needed)
- Age or date of birth
- Gender (male/female/other - in English)
- Phone numbers (primary and secondary)
- Email address
- Home address (translate city/country names to English)
- Occupation (translate to English)
- Education level (translate to English)
- Marital status (single/married/divorced/widowed - in English)
- Number of children
- Country/city of birth (translate to English)
- National ID (if mentioned)
- File reference number (if mentioned)
- Case number (if mentioned)
- Referring physician name (translate to English if needed)
- Referring physician phone (if mentioned)
- Referring physician email (if mentioned)
- Third party payer/insurance (translate to English if needed)
- Medical reference number (if mentioned)
- Any other relevant demographic information

TRANSLATION EXAMPLES:
- If transcript says "اسمي أحمد محمد" → extract as "first_name": "Ahmed", "last_name": "Mohammed"
- If transcript says "Je suis médecin" → extract as "occupation": "Doctor"
- If transcript says "أنا متزوج" → extract as "marital_status": "married"
- If transcript says "أسكن في الرياض" → extract as "address": "Riyadh, Saudi Arabia"

Return a JSON object with the extracted information. Use null for fields that are not found or unclear. 
For fields that are extracted, include high confidence level. 
Always include an 'extraction_metadata' field showing which fields were successfully extracted vs not found.

Format:
{
    "first_name": "John",
    "last_name": "Smith",
    "father_name": "Robert Smith",
    "mother_name": "Mary Johnson",
    "age": 45,
    "date_of_birth": "1978-05-15",
    "gender": "male",
    "phone_1": "+1234567890",
    "phone_2": "+1234567891",
    "email": "john.smith@email.com",
    "address": "123 Main St, City, Country",
    "occupation": "Engineer",
    "education": "Bachelor's Degree",
    "marital_status": "married",
    "children_count": 2,
    "country_of_birth": "USA",
    "city_of_birth": "New York",
    "national_id": "123456789",
    "file_reference": "REF-2024-001",
    "case_number": "CASE-12345",
    "referring_physician_name": "Dr. Jane Doe",
    "referring_physician_phone_1": "+1234567892",
    "referring_physician_email": "jane.doe@clinic.com",
    "third_party_payer": "Health Insurance Co.",
    "medical_ref_number": "MED-67890",
    "extraction_metadata": {
        "extracted_fields": ["first_name", "last_name", "father_name", "age", "phone_1", "occupation"],
        "not_found_fields": ["mother_name", "phone_2", "email", "national_id", "city_of_birth"],
        "confidence_level": "high"
    }
}"""
            },
            {
                "role": "user",
                "content": f"Extract patient demographic information from this consultation transcript:\n\n{transcript}"
            }
        ]
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.1,
            max_tokens=2000
        )
        
        demographics_text = response.choices[0].message.content.strip()
        
        # Parse the JSON response
        import json
        demographics = json.loads(demographics_text)
        
        logger.info(f"Extracted demographics: {demographics}")
        return demographics
        
    except Exception as e:
        logger.error(f"Failed to extract demographics: {str(e)}")
        return {
            "extraction_metadata": {
                "extracted_fields": [],
                "not_found_fields": ["first_name", "last_name", "father_name", "mother_name", "age", "date_of_birth", "gender", "phone_1", "phone_2", "email", "address", "occupation", "education", "marital_status", "children_count", "country_of_birth", "city_of_birth", "national_id", "file_reference", "case_number", "referring_physician_name", "referring_physician_phone_1", "referring_physician_email", "third_party_payer", "medical_ref_number"],
                "confidence_level": "low",
                "error": str(e)
            }
        }

async def parse_clinical_data_from_summary(summary: str) -> dict:
    """Parse structured clinical data from consultation summary using OpenAI."""
    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        
        prompt = f"""
        Please extract both CLINICAL and DEMOGRAPHIC information from the following consultation summary.
        Return a JSON object with the following fields:
        
        CLINICAL FIELDS:
        - chief_complaint: Main reason for visit
        - history_present_illness: Current illness details
        - past_medical_history: Previous medical conditions
        - medications: Current medications list
        - allergies: Known allergies
        - diagnosis: Clinical diagnosis or impression
        - plan: Treatment plan and recommendations
        - plan: Treatment plan and recommendations
        
        DEMOGRAPHIC FIELDS:
        - age: Patient's age (number only)
        - gender: Male/Female/Other
        - occupation: Patient's job/profession
        - education: Education level
        - marital_status: Single/Married/Divorced/Widowed
        - children_count: Number of children (number only)
        - smoking: true/false if smoking status mentioned
        - country_of_birth: Country of birth if mentioned
        - city_of_birth: City of birth if mentioned
        - address: Full address if mentioned
        - emergency_contact: Emergency contact info if mentioned
        - insurance: Insurance information if mentioned
        
        IMPORTANT INSTRUCTIONS:
        - For demographic fields, ONLY extract information explicitly mentioned in the conversation
        - If any field is not mentioned or unclear, use null for that field
        - For age, extract actual number mentioned (e.g., if "52 years old" mentioned, return 52)
        - For smoking, return true if patient smokes, false if explicitly non-smoker, null if not mentioned
        - Be very careful to only extract information actually stated in the conversation
        
        Consultation Summary:
        {summary}
        
        Return only valid JSON:
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical assistant that extracts structured clinical and demographic data from consultation notes. Always return valid JSON only. Only extract information explicitly mentioned in the conversation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1500
        )
        
        # Parse the JSON response
        clinical_data = response.choices[0].message.content.strip()
        
        # Remove any markdown formatting if present
        if clinical_data.startswith("```json"):
            clinical_data = clinical_data[7:]
        if clinical_data.endswith("```"):
            clinical_data = clinical_data[:-3]
        
        import json
        return json.loads(clinical_data)
        
    except Exception as e:
        logger.error(f"Failed to parse clinical data: {str(e)}")
        return {
            "chief_complaint": None,
            "history_present_illness": None,
            "past_medical_history": None,
            "medications": None,
            "allergies": None,
            "diagnosis": None,
            "plan": None,
            # Demographic fields
            "age": None,
            "gender": None,
            "occupation": None,
            "education": None,
            "marital_status": None,
            "children_count": None,
            "smoking": None,
            "country_of_birth": None,
            "city_of_birth": None,
            "address": None,
            "emergency_contact": None,
            "insurance": None
        }

async def extract_comprehensive_clinical_data(transcript: str, summary: str) -> dict:
    """Extract comprehensive clinical data including symptoms, biomarkers, response, risk factors."""
    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        
        prompt = f"""
        Extract comprehensive oncology clinical data from this consultation transcript and summary.
        
        Return a JSON object with these sections:
        
        SYMPTOM ASSESSMENT:
        - pain_scale: 0-10 numeric scale if mentioned
        - fatigue_level: "none", "mild", "moderate", "severe"
        - appetite_change: describe percentage or qualitative change
        - weight_change_lbs: numeric pounds gained/lost (negative for loss)
        - weight_change_timeframe: "2 weeks", "3 months", etc.
        - karnofsky_score: 0-100 if mentioned
        - nccn_distress_score: 0-10 if distress mentioned
        - activities_daily_living: "independent", "assisted", "dependent"
        
        BIOMARKER RESULTS:
        - egfr_status: mutation status if mentioned
        - alk_status: ALK rearrangement status
        - pdl1_expression: percentage if mentioned
        - msi_status: "stable", "instable", "high", "low"
        - tumor_mutational_burden: "high", "low", "intermediate"
        - germline_testing_recommended: true/false
        
        TREATMENT RESPONSE (if applicable):
        - response_type: "complete", "partial", "stable", "progression"
        - response_criteria: "RECIST", "WHO", etc.
        - adverse_events: [{"event": "", "grade": 1-5, "attribution": "related/unrelated"}]
        - dose_modifications: true/false
        
        RISK ASSESSMENT:
        - smoking_status: "never", "former", "current"
        - pack_years: calculated value if smoking history given
        - quit_date: date if former smoker
        - asbestos_exposure: true/false
        - family_cancer_history: [{"relation": "", "cancer_type": "", "age_at_diagnosis": ""}]
        
        PSYCHOSOCIAL:
        - depression_screening_result: if mental health mentioned
        - primary_caregiver: "spouse", "child", "friend", "none"
        - transportation_barriers: true/false
        - financial_distress: true/false
        - prognosis_discussed: true/false
        
        CLINICAL TRIALS:
        - trial_name: if mentioned
        - eligibility_assessed: true/false
        - tumor_board_date: date if mentioned
        - second_opinion_requested: true/false
        
        Use null for fields not mentioned. Only extract information explicitly stated.
        
        Transcript: {transcript}
        Summary: {summary}
        
        Return only valid JSON:
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a medical AI that extracts structured oncology data. Always return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        clinical_text = response.choices[0].message.content.strip()
        
        # Clean and parse JSON
        if clinical_text.startswith("```json"):
            clinical_text = clinical_text[7:]
        if clinical_text.endswith("```"):
            clinical_text = clinical_text[:-3]
        
        import json
        return json.loads(clinical_text)
        
    except Exception as e:
        logger.error(f"Failed to extract comprehensive clinical data: {str(e)}")
        return {
            "symptom_assessment": {},
            "biomarker_results": {},
            "treatment_response": {},
            "risk_assessment": {},
            "psychosocial": {},
            "clinical_trials": {},
            "extraction_error": str(e)
        }

# NOTE: File storage functionality removed per user request
# System now works with transcripts and AI processing only

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Clinic Assistant API"}

@app.get("/patients/search")
async def search_patients(
    first_name: str = Query(None, description="Patient first name"),
    last_name: str = Query(None, description="Patient last name"),
    phone: str = Query(None, description="Phone number")
) -> List[Patient]:
    """Search for patients by name and phone number."""
    try:
        logger.info(f"Searching for patient: first_name={first_name}, last_name={last_name}, phone={phone}")
        
        query = supabase.table("patients").select("*")
        
        if first_name:
            query = query.ilike("first_name", f"%{first_name.strip()}%")
        if last_name:
            query = query.ilike("last_name", f"%{last_name.strip()}%")
        if phone:
            # Search in both phone_1 and phone fields
            query = query.or_(f"phone_1.ilike.%{phone.strip()}%,phone.ilike.%{phone.strip()}%")
        
        response = query.execute()
        
        logger.info(f"Search results: {len(response.data)} patients found")
        return response.data
        
    except Exception as e:
        logger.error(f"Failed to search patients: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to search patients: {str(e)}"
        )

@app.post("/patients", response_model=Patient)
async def create_patient(patient_data: PatientCreate) -> Patient:
    """Create a new patient record."""
    try:
        logger.info(f"Creating new patient: {patient_data.first_name} {patient_data.last_name}")
        
        # Check if patient already exists
        existing = supabase.table("patients").select("*").eq("first_name", patient_data.first_name.strip()).eq("last_name", patient_data.last_name.strip()).eq("date_of_birth", patient_data.date_of_birth.strip()).execute()
        
        if existing.data:
            logger.info("Patient already exists, returning existing record")
            return existing.data[0]
        
        # Create new patient
        patient_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        patient_record = {
            "id": patient_id,
            "first_name": patient_data.first_name.strip(),
            "last_name": patient_data.last_name.strip(),
            "date_of_birth": patient_data.date_of_birth.strip(),
            "phone_1": patient_data.phone_1.strip(),
            "created_at": current_time.isoformat()
        }
        
        # Add optional fields if provided
        if patient_data.father_name:
            patient_record["father_name"] = patient_data.father_name.strip()
        if patient_data.mother_name:
            patient_record["mother_name"] = patient_data.mother_name.strip()
        if patient_data.gender:
            patient_record["gender"] = patient_data.gender
        if patient_data.marital_status:
            patient_record["marital_status"] = patient_data.marital_status
        if patient_data.children_count is not None:
            patient_record["children_count"] = patient_data.children_count
        if patient_data.phone_2:
            patient_record["phone_2"] = patient_data.phone_2.strip()
        if patient_data.email:
            patient_record["email"] = patient_data.email.strip()
        if patient_data.address:
            patient_record["address"] = patient_data.address.strip()
        if patient_data.occupation:
            patient_record["occupation"] = patient_data.occupation.strip()
        if patient_data.education:
            patient_record["education"] = patient_data.education.strip()
        if patient_data.smoking is not None:
            patient_record["smoking"] = patient_data.smoking
        if patient_data.country_of_birth:
            patient_record["country_of_birth"] = patient_data.country_of_birth.strip()
        if patient_data.city_of_birth:
            patient_record["city_of_birth"] = patient_data.city_of_birth.strip()
        if patient_data.file_reference:
            patient_record["file_reference"] = patient_data.file_reference.strip()
        if patient_data.case_number:
            patient_record["case_number"] = patient_data.case_number.strip()
        if patient_data.referring_physician_name:
            patient_record["referring_physician_name"] = patient_data.referring_physician_name.strip()
        if patient_data.referring_physician_phone_1:
            patient_record["referring_physician_phone_1"] = patient_data.referring_physician_phone_1.strip()
        if patient_data.referring_physician_email:
            patient_record["referring_physician_email"] = patient_data.referring_physician_email.strip()
        if patient_data.third_party_payer:
            patient_record["third_party_payer"] = patient_data.third_party_payer.strip()
        if patient_data.medical_ref_number:
            patient_record["medical_ref_number"] = patient_data.medical_ref_number.strip()
        if patient_data.clinical_notes:
            patient_record["clinical_notes"] = patient_data.clinical_notes.strip()
        
        response = supabase.table("patients").insert(patient_record).execute()
        logger.info(f"Created patient with ID: {patient_id}")
        
        return response.data[0]
        
    except Exception as e:
        logger.error(f"Failed to create patient: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create patient: {str(e)}"
        )

@app.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...), 
    patient_id: Optional[str] = Form(None)
):
    """
    Process different file types: audio files (transcribe with Whisper), 
    text files (use content directly), PDFs (extract text), etc.
    Store ONLY transcript/content in database linked to patient.
    NEVER store audio files to save storage space.
    """
    try:
        logger.info(f"Received file upload: {file.filename}, content_type: {file.content_type}, patient_id: {patient_id}")
        
        # Generate unique filename for identification (not for storage)
        file_extension = Path(file.filename or "upload").suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Read file content
        file_content = await file.read()
        logger.info(f"File size: {len(file_content)} bytes")
        
        # Generate IDs for database
        recording_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        # Process file based on type
        transcript = ""
        
        if file.content_type and file.content_type.startswith('audio/'):
            # Audio file - transcribe with Whisper and DO NOT store the audio file
            logger.info("Processing audio file with Whisper transcription")
            transcript = await process_audio_file(file_content, unique_filename, file.content_type)
            logger.info(f"Audio transcription completed: {len(transcript)} characters")
            
        elif file.content_type and file.content_type.startswith('text/'):
            # Text file - use content directly
            logger.info("Processing text file")
            transcript = file_content.decode('utf-8')
            
        elif file.content_type == 'application/pdf':
            # PDF file - extract text (placeholder for now)
            logger.info("Processing PDF file")
            transcript = await process_pdf_file(file_content, unique_filename)
            
        else:
            # Try to decode as text for other file types
            try:
                transcript = file_content.decode('utf-8')
                logger.info("Successfully decoded file as text")
            except UnicodeDecodeError:
                logger.warning(f"Unsupported file type: {file.content_type}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type: {file.content_type}"
                )
        
        # NOTE: We explicitly DO NOT store the audio file anywhere
        # Only the transcript is stored in the database
        
        # Generate AI summary after transcription
        logger.info("Generating AI consultation summary...")
        summary = await generate_consultation_summary(transcript)
        
        # Parse clinical and demographic data from summary
        clinical_data = await parse_clinical_data_from_summary(summary)
        
        # NOTE: File storage disabled by user request - only storing transcript and metadata
        public_url = None
        
        # Create recording record with required fields
        recording_record = {
            "id": recording_id,
            "filename": unique_filename,
            "transcript": transcript,
            "summary": summary,
            "patient_id": patient_id,
            "created_at": current_time.isoformat()
        }
        
        recording_response = supabase.table("recordings").insert(recording_record).execute()
        
        if not recording_response.data:
            logger.error("Database insert failed: No data returned")
            raise HTTPException(status_code=500, detail="Failed to save recording record")
        
        # Update patient record with extracted clinical and demographic data
        if patient_id:  # If linked to a patient, update their record
            patient_update = {}
            
            # Add clinical data to patient record (only basic fields)
            if clinical_data.get('diagnosis'):
                patient_update["diagnosis"] = clinical_data.get('diagnosis')
            if clinical_data.get('allergies'):
                patient_update["allergies"] = clinical_data.get('allergies')
            if clinical_data.get('medications'):
                patient_update["medications"] = clinical_data.get('medications')
            
            # Get current patient data to check what's missing
            current_patient = supabase.table("patients").select("*").eq("id", patient_id).execute()
            
            if current_patient.data:
                patient_data = current_patient.data[0]
                
                # Add demographic data only if not already present in patient record
                if not patient_data.get('occupation') and clinical_data.get('occupation'):
                    patient_update["occupation"] = clinical_data.get('occupation')
                
                if not patient_data.get('education') and clinical_data.get('education'):
                    patient_update["education"] = clinical_data.get('education')
                
                if not patient_data.get('marital_status') and clinical_data.get('marital_status'):
                    patient_update["marital_status"] = clinical_data.get('marital_status')
                
                if not patient_data.get('children_count') and clinical_data.get('children_count'):
                    if isinstance(clinical_data.get('children_count'), (int, float)):
                        patient_update["children_count"] = int(clinical_data.get('children_count'))
                
                if patient_data.get('smoking') is None and clinical_data.get('smoking') is not None:
                    patient_update["smoking"] = clinical_data.get('smoking')
                
                if not patient_data.get('country_of_birth') and clinical_data.get('country_of_birth'):
                    patient_update["country_of_birth"] = clinical_data.get('country_of_birth')
                
                if not patient_data.get('city_of_birth') and clinical_data.get('city_of_birth'):
                    patient_update["city_of_birth"] = clinical_data.get('city_of_birth')
                
                # Enhance address if current one is empty or very basic
                if clinical_data.get('address') and (
                    not patient_data.get('address') or 
                    len(patient_data.get('address', '')) < 20
                ):
                    patient_update["address"] = clinical_data.get('address')
            
            # Apply updates if any
            if patient_update:
                update_response = supabase.table("patients").update(patient_update).eq("id", patient_id).execute()
                logger.info(f"Enhanced patient record with extracted data: {list(patient_update.keys())}")
        
        return UploadResponse(
            id=recording_id,
            filename=file.filename,
            transcript=transcript,
            summary=summary,
            patient_id=patient_id,
            created_at=current_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload_audio: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/patients")
async def get_patients():
    """Get all patients from the database."""
    try:
        response = supabase.table("patients").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch patients: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch patients: {str(e)}"
        )

@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    """Get a specific patient by ID."""
    try:
        response = supabase.table("patients").select("*").eq("id", patient_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch patient: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch patient: {str(e)}"
        )

@app.get("/patients/{patient_id}/recordings")
async def get_patient_recordings(patient_id: str):
    """Get all recordings for a specific patient."""
    try:
        response = supabase.table("recordings").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch patient recordings: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch patient recordings: {str(e)}"
        )

@app.get("/recordings")
async def get_recordings():
    """Get all recordings from the database."""
    try:
        response = supabase.table("recordings").select("*").order("created_at", desc=True).execute()
        return {"recordings": response.data}
    except Exception as e:
        logger.error(f"Failed to fetch recordings: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch recordings: {str(e)}"
        )

@app.get("/recordings/{recording_id}")
async def get_recording(recording_id: str):
    """Get a specific recording by ID with patient information."""
    try:
        # First get the recording
        recording_response = supabase.table("recordings").select("*").eq("id", recording_id).execute()
        if not recording_response.data:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        recording = recording_response.data[0]
        
        # Get patient information if patient_id exists
        if recording.get("patient_id"):
            patient_response = supabase.table("patients").select("*").eq("id", recording["patient_id"]).execute()
            if patient_response.data:
                recording["patients"] = patient_response.data[0]
        
        return recording
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch recording: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch recording: {str(e)}"
        )

@app.post("/recordings/{recording_id}/regenerate-summary")
async def regenerate_summary(recording_id: str):
    """Regenerate AI summary for an existing recording."""
    try:
        # First get the recording
        recording_response = supabase.table("recordings").select("*").eq("id", recording_id).execute()
        if not recording_response.data:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        recording = recording_response.data[0]
        transcript = recording.get("transcript", "")
        
        if not transcript:
            raise HTTPException(status_code=400, detail="No transcript available for summary generation")
        
        # Generate new summary
        logger.info(f"Regenerating summary for recording: {recording_id}")
        summary = await generate_consultation_summary(transcript)
        
        # Update the recording with new summary
        update_response = supabase.table("recordings").update({
            "summary": summary
        }).eq("id", recording_id).execute()
        
        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update recording with new summary")
        
        logger.info(f"Successfully regenerated summary for recording: {recording_id}")
        
        return {
            "id": recording_id,
            "summary": summary,
            "message": "Summary regenerated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to regenerate summary: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to regenerate summary: {str(e)}"
        )

@app.put("/patients/{patient_id}", response_model=Patient)
async def update_patient(patient_id: str, patient_data: PatientCreate) -> Patient:
    """Update an existing patient record."""
    try:
        logger.info(f"Updating patient: {patient_id}")
        
        # Check if patient exists
        existing = supabase.table("patients").select("*").eq("id", patient_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Update patient data
        updated_data = {
            "first_name": patient_data.first_name.strip(),
            "last_name": patient_data.last_name.strip(),
            "date_of_birth": patient_data.date_of_birth.strip(),
            "phone_1": patient_data.phone_1.strip()
        }
        
        # Add optional fields if provided
        if patient_data.father_name:
            updated_data["father_name"] = patient_data.father_name.strip()
        if patient_data.mother_name:
            updated_data["mother_name"] = patient_data.mother_name.strip()
        if patient_data.gender:
            updated_data["gender"] = patient_data.gender
        if patient_data.marital_status:
            updated_data["marital_status"] = patient_data.marital_status
        if patient_data.children_count is not None:
            updated_data["children_count"] = patient_data.children_count
        if patient_data.phone_2:
            updated_data["phone_2"] = patient_data.phone_2.strip()
        if patient_data.email:
            updated_data["email"] = patient_data.email.strip()
        if patient_data.address:
            updated_data["address"] = patient_data.address.strip()
        if patient_data.occupation:
            updated_data["occupation"] = patient_data.occupation.strip()
        if patient_data.education:
            updated_data["education"] = patient_data.education.strip()
        if patient_data.smoking is not None:
            updated_data["smoking"] = patient_data.smoking
        if patient_data.country_of_birth:
            updated_data["country_of_birth"] = patient_data.country_of_birth.strip()
        if patient_data.city_of_birth:
            updated_data["city_of_birth"] = patient_data.city_of_birth.strip()
        if patient_data.file_reference:
            updated_data["file_reference"] = patient_data.file_reference.strip()
        if patient_data.case_number:
            updated_data["case_number"] = patient_data.case_number.strip()
        if patient_data.referring_physician_name:
            updated_data["referring_physician_name"] = patient_data.referring_physician_name.strip()
        if patient_data.referring_physician_phone_1:
            updated_data["referring_physician_phone_1"] = patient_data.referring_physician_phone_1.strip()
        if patient_data.referring_physician_email:
            updated_data["referring_physician_email"] = patient_data.referring_physician_email.strip()
        if patient_data.third_party_payer:
            updated_data["third_party_payer"] = patient_data.third_party_payer.strip()
        if patient_data.medical_ref_number:
            updated_data["medical_ref_number"] = patient_data.medical_ref_number.strip()
        
        response = supabase.table("patients").update(updated_data).eq("id", patient_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Patient not found")
            
        logger.info(f"Updated patient: {patient_id}")
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update patient: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to update patient: {str(e)}"
        )

@app.patch("/patients/{patient_id}")
async def update_patient_field(patient_id: str, field_data: dict):
    """Update specific fields for a patient"""
    try:
        # Validate that we have field data
        if not field_data:
            raise HTTPException(status_code=400, detail="No field data provided")
        
        # Build the update object for Supabase
        update_data = {}
        
        # Validate field names to prevent unauthorized updates
        allowed_fields = {
            'first_name', 'last_name', 'father_name', 'mother_name', 'gender', 
            'date_of_birth', 'marital_status', 'children_count', 'phone_1', 'phone_2',
            'email', 'address', 'occupation', 'education', 'smoking', 'country_of_birth',
            'city_of_birth', 'file_reference', 'case_number', 'referring_physician_name',
            'referring_physician_phone_1', 'referring_physician_email', 'third_party_payer',
            'medical_ref_number', 'phone', 'clinical_notes'
        }
        
        for field, value in field_data.items():
            if field not in allowed_fields:
                raise HTTPException(status_code=400, detail=f"Field '{field}' is not allowed to be updated")
            
            # Handle special conversions
            if field == 'children_count' and value:
                try:
                    update_data[field] = int(value)
                except ValueError:
                    raise HTTPException(status_code=400, detail="children_count must be a number")
            elif field == 'smoking' and isinstance(value, str):
                # Convert string to boolean for smoking field
                update_data[field] = value.lower() in ['true', 'smoker', 'yes']
            else:
                update_data[field] = value
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        # Check if patient exists first
        existing = supabase.table("patients").select("id").eq("id", patient_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Update the patient
        response = supabase.table("patients").update(update_data).eq("id", patient_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        logger.info(f"Updated patient {patient_id} fields: {list(update_data.keys())}")
        
        return {
            "message": "Patient updated successfully",
            "patient": response.data[0],
            "updated_fields": list(update_data.keys())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating patient: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# New comprehensive patient data endpoints

@app.get("/patients/{patient_id}/histories")
async def get_patient_histories(patient_id: str):
    """Get all patient histories for a specific patient."""
    try:
        response = supabase.table("patient_histories").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch patient histories: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch patient histories: {str(e)}"
        )

@app.get("/patients/{patient_id}/previous-chemotherapy")
async def get_patient_previous_chemotherapy(patient_id: str):
    """Get all previous chemotherapy treatments for a specific patient."""
    try:
        response = supabase.table("patient_previous_chemotherapy").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch previous chemotherapy: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch previous chemotherapy: {str(e)}"
        )

@app.get("/patients/{patient_id}/previous-radiotherapy")
async def get_patient_previous_radiotherapy(patient_id: str):
    """Get all previous radiotherapy treatments for a specific patient."""
    try:
        response = supabase.table("patient_previous_radiotherapy").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch previous radiotherapy: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch previous radiotherapy: {str(e)}"
        )

@app.get("/patients/{patient_id}/previous-surgeries")
async def get_patient_previous_surgeries(patient_id: str):
    """Get all previous surgeries for a specific patient."""
    try:
        response = supabase.table("patient_previous_surgeries").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch previous surgeries: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch previous surgeries: {str(e)}"
        )

@app.get("/patients/{patient_id}/previous-other-treatments")
async def get_patient_previous_other_treatments(patient_id: str):
    """Get all previous other treatments for a specific patient."""
    try:
        response = supabase.table("patient_previous_other_treatments").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch previous other treatments: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch previous other treatments: {str(e)}"
        )

@app.get("/patients/{patient_id}/concomitant-medications")
async def get_patient_concomitant_medications(patient_id: str):
    """Get all concomitant medications for a specific patient."""
    try:
        response = supabase.table("patient_concomitant_medications").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch concomitant medications: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch concomitant medications: {str(e)}"
        )

@app.get("/patients/{patient_id}/baselines")
async def get_patient_baselines(patient_id: str):
    """Get all baselines for a specific patient."""
    try:
        response = supabase.table("patient_baselines").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch patient baselines: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch patient baselines: {str(e)}"
        )

@app.get("/baselines/{baseline_id}")
async def get_baseline(baseline_id: str):
    """Get a specific baseline by ID."""
    try:
        response = supabase.table("patient_baselines").select("*").eq("id", baseline_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Baseline not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch baseline: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch baseline: {str(e)}"
        )

@app.get("/baselines/{baseline_id}/tumors")
async def get_baseline_tumors(baseline_id: str):
    """Get all tumors for a specific baseline."""
    try:
        response = supabase.table("baseline_tumors").select("*").eq("baseline_id", baseline_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch baseline tumors: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch baseline tumors: {str(e)}"
        )

@app.post("/baselines/{baseline_id}/tumors")
async def create_baseline_tumor(baseline_id: str, tumor_data: dict):
    """Create a new tumor for a specific baseline."""
    try:
        # Verify baseline exists
        baseline_response = supabase.table("patient_baselines").select("id").eq("id", baseline_id).execute()
        if not baseline_response.data:
            raise HTTPException(status_code=404, detail="Baseline not found")
        
        # Add baseline_id to tumor data
        tumor_data["baseline_id"] = baseline_id
        
        response = supabase.table("baseline_tumors").insert(tumor_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create tumor")
        
        logger.info(f"Created tumor for baseline {baseline_id}")
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create baseline tumor: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create baseline tumor: {str(e)}"
        )

@app.patch("/tumors/{tumor_id}")
async def update_baseline_tumor(tumor_id: str, field_data: dict):
    """Update a specific tumor field."""
    try:
        field = field_data.get("field")
        value = field_data.get("value")
        
        if field is None:
            raise HTTPException(status_code=400, detail="Field name is required")
        
        # Handle different field types
        update_data = {}
        if field == "all":
            # Update all fields from value dict
            update_data = value
        else:
            # Update single field
            if field in ["size", "tnm_t", "tnm_n", "tnm_m"]:
                update_data[field] = value
            elif field in ["site", "description", "histology", "grade", "stage", "notes"]:
                update_data[field] = value
            else:
                update_data[field] = value
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        # Check if tumor exists first
        existing = supabase.table("baseline_tumors").select("id").eq("id", tumor_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Tumor not found")
        
        # Update the tumor
        response = supabase.table("baseline_tumors").update(update_data).eq("id", tumor_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Tumor not found")
        
        logger.info(f"Updated tumor {tumor_id} fields: {list(update_data.keys())}")
        
        return {
            "message": "Tumor updated successfully",
            "tumor": response.data[0],
            "updated_fields": list(update_data.keys())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tumor: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/tumors/{tumor_id}")
async def delete_baseline_tumor(tumor_id: str):
    """Delete a specific tumor."""
    try:
        # Check if tumor exists first
        existing = supabase.table("baseline_tumors").select("id").eq("id", tumor_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Tumor not found")
        
        # Delete the tumor
        response = supabase.table("baseline_tumors").delete().eq("id", tumor_id).execute()
        
        logger.info(f"Deleted tumor {tumor_id}")
        
        return {"message": "Tumor deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting tumor: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/patients/{patient_id}/complete")
async def get_patient_complete_data(patient_id: str):
    """Get complete patient data including all related records."""
    try:
        # Get patient data
        patient_response = supabase.table("patients").select("*").eq("id", patient_id).execute()
        if not patient_response.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient = patient_response.data[0]
        
        # Get all related data
        histories = supabase.table("patient_histories").select("*").eq("patient_id", patient_id).execute()
        chemotherapy = supabase.table("patient_previous_chemotherapy").select("*").eq("patient_id", patient_id).execute()
        radiotherapy = supabase.table("patient_previous_radiotherapy").select("*").eq("patient_id", patient_id).execute()
        surgeries = supabase.table("patient_previous_surgeries").select("*").eq("patient_id", patient_id).execute()
        other_treatments = supabase.table("patient_previous_other_treatments").select("*").eq("patient_id", patient_id).execute()
        medications = supabase.table("patient_concomitant_medications").select("*").eq("patient_id", patient_id).execute()
        baselines = supabase.table("patient_baselines").select("*").eq("patient_id", patient_id).execute()
        recordings = supabase.table("recordings").select("*").eq("patient_id", patient_id).execute()
        
        return {
            "patient": patient,
            "histories": histories.data,
            "chemotherapy": chemotherapy.data,
            "radiotherapy": radiotherapy.data,
            "surgeries": surgeries.data,
            "other_treatments": other_treatments.data,
            "medications": medications.data,
            "baselines": baselines.data,
            "recordings": recordings.data
        }
    except Exception as e:
        logger.error(f"Error getting complete patient data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get complete patient data")

# CRUD endpoints for patient histories
@app.post("/patients/{patient_id}/histories")
async def create_patient_history(patient_id: str, history_data: dict):
    """Create a new patient history record."""
    try:
        # Add patient_id to the data
        history_data["patient_id"] = patient_id
        
        response = supabase.table("patient_histories").insert(history_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create history record")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating patient history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create history record")

@app.patch("/histories/{history_id}")
async def update_patient_history(history_id: str, history_data: dict):
    """Update a patient history record."""
    try:
        response = supabase.table("patient_histories").update(history_data).eq("id", history_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="History record not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating patient history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update history record")

@app.delete("/histories/{history_id}")
async def delete_patient_history(history_id: str):
    """Delete a patient history record."""
    try:
        response = supabase.table("patient_histories").delete().eq("id", history_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="History record not found")
        
        return {"message": "History record deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting patient history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete history record")

# CRUD endpoints for patient previous chemotherapy
@app.post("/patients/{patient_id}/previous-chemotherapy")
async def create_patient_chemotherapy(patient_id: str, chemo_data: dict):
    """Create a new patient chemotherapy record."""
    try:
        chemo_data["patient_id"] = patient_id
        
        response = supabase.table("patient_previous_chemotherapy").insert(chemo_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create chemotherapy record")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating patient chemotherapy: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create chemotherapy record")

@app.patch("/chemotherapy/{chemo_id}")
async def update_patient_chemotherapy(chemo_id: str, chemo_data: dict):
    """Update a patient chemotherapy record."""
    try:
        response = supabase.table("patient_previous_chemotherapy").update(chemo_data).eq("id", chemo_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Chemotherapy record not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating patient chemotherapy: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update chemotherapy record")

@app.delete("/chemotherapy/{chemo_id}")
async def delete_patient_chemotherapy(chemo_id: str):
    """Delete a patient chemotherapy record."""
    try:
        response = supabase.table("patient_previous_chemotherapy").delete().eq("id", chemo_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Chemotherapy record not found")
        
        return {"message": "Chemotherapy record deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting patient chemotherapy: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete chemotherapy record")

# CRUD endpoints for patient previous radiotherapy
@app.post("/patients/{patient_id}/previous-radiotherapy")
async def create_patient_radiotherapy(patient_id: str, radio_data: dict):
    """Create a new patient radiotherapy record."""
    try:
        radio_data["patient_id"] = patient_id
        
        response = supabase.table("patient_previous_radiotherapy").insert(radio_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create radiotherapy record")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating patient radiotherapy: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create radiotherapy record")

@app.patch("/radiotherapy/{radio_id}")
async def update_patient_radiotherapy(radio_id: str, radio_data: dict):
    """Update a patient radiotherapy record."""
    try:
        response = supabase.table("patient_previous_radiotherapy").update(radio_data).eq("id", radio_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Radiotherapy record not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating patient radiotherapy: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update radiotherapy record")

@app.delete("/radiotherapy/{radio_id}")
async def delete_patient_radiotherapy(radio_id: str):
    """Delete a patient radiotherapy record."""
    try:
        response = supabase.table("patient_previous_radiotherapy").delete().eq("id", radio_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Radiotherapy record not found")
        
        return {"message": "Radiotherapy record deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting patient radiotherapy: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete radiotherapy record")

# CRUD endpoints for patient previous surgeries
@app.post("/patients/{patient_id}/previous-surgeries")
async def create_patient_surgery(patient_id: str, surgery_data: dict):
    """Create a new patient surgery record."""
    try:
        surgery_data["patient_id"] = patient_id
        
        response = supabase.table("patient_previous_surgeries").insert(surgery_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create surgery record")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating patient surgery: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create surgery record")

@app.patch("/surgeries/{surgery_id}")
async def update_patient_surgery(surgery_id: str, surgery_data: dict):
    """Update a patient surgery record."""
    try:
        response = supabase.table("patient_previous_surgeries").update(surgery_data).eq("id", surgery_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Surgery record not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating patient surgery: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update surgery record")

@app.delete("/surgeries/{surgery_id}")
async def delete_patient_surgery(surgery_id: str):
    """Delete a patient surgery record."""
    try:
        response = supabase.table("patient_previous_surgeries").delete().eq("id", surgery_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Surgery record not found")
        
        return {"message": "Surgery record deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting patient surgery: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete surgery record")

# CRUD endpoints for patient previous other treatments
@app.post("/patients/{patient_id}/previous-other-treatments")
async def create_patient_other_treatment(patient_id: str, treatment_data: dict):
    """Create a new patient other treatment record."""
    try:
        treatment_data["patient_id"] = patient_id
        
        response = supabase.table("patient_previous_other_treatments").insert(treatment_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create other treatment record")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating patient other treatment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create other treatment record")

@app.patch("/other-treatments/{treatment_id}")
async def update_patient_other_treatment(treatment_id: str, treatment_data: dict):
    """Update a patient other treatment record."""
    try:
        response = supabase.table("patient_previous_other_treatments").update(treatment_data).eq("id", treatment_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Other treatment record not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating patient other treatment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update other treatment record")

@app.delete("/other-treatments/{treatment_id}")
async def delete_patient_other_treatment(treatment_id: str):
    """Delete a patient other treatment record."""
    try:
        response = supabase.table("patient_previous_other_treatments").delete().eq("id", treatment_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Other treatment record not found")
        
        return {"message": "Other treatment record deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting patient other treatment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete other treatment record")

# CRUD endpoints for patient concomitant medications
@app.post("/patients/{patient_id}/concomitant-medications")
async def create_patient_medication(patient_id: str, medication_data: dict):
    """Create a new patient medication record."""
    try:
        medication_data["patient_id"] = patient_id
        
        response = supabase.table("patient_concomitant_medications").insert(medication_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create medication record")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating patient medication: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create medication record")

@app.patch("/medications/{medication_id}")
async def update_patient_medication(medication_id: str, medication_data: dict):
    """Update a patient medication record."""
    try:
        response = supabase.table("patient_concomitant_medications").update(medication_data).eq("id", medication_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Medication record not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating patient medication: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update medication record")

@app.delete("/medications/{medication_id}")
async def delete_patient_medication(medication_id: str):
    """Delete a patient medication record."""
    try:
        response = supabase.table("patient_concomitant_medications").delete().eq("id", medication_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Medication record not found")
        
        return {"message": "Medication record deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting patient medication: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete medication record")

# CRUD endpoints for patient baselines
@app.post("/patients/{patient_id}/baselines")
async def create_patient_baseline(patient_id: str, baseline_data: dict):
    """Create a new patient baseline record."""
    try:
        baseline_data["patient_id"] = patient_id
        
        response = supabase.table("patient_baselines").insert(baseline_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create baseline record")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating patient baseline: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create baseline record")

@app.patch("/baselines/{baseline_id}")
async def update_patient_baseline(baseline_id: str, baseline_data: dict):
    """Update a patient baseline record."""
    try:
        response = supabase.table("patient_baselines").update(baseline_data).eq("id", baseline_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Baseline record not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating patient baseline: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update baseline record")

@app.delete("/baselines/{baseline_id}")
async def delete_patient_baseline(baseline_id: str):
    """Delete a patient baseline record."""
    try:
        response = supabase.table("patient_baselines").delete().eq("id", baseline_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Baseline record not found")
        
        return {"message": "Baseline record deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting patient baseline: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete baseline record")

@app.post("/consultation/new_patient", response_model=UploadResponse)
async def create_new_patient_consultation(
    file: UploadFile = File(...)
):
    """Create a new patient and process their first consultation recording using AI demographic extraction."""
    try:
        logger.info("Creating new patient consultation with AI demographic extraction")
        
        # Process the audio file (similar to existing upload endpoint)
        file_content = await file.read()
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Process file based on type
        transcript = ""
        if file.content_type and (file.content_type.startswith('audio/') or file.content_type.startswith('video/')):
            transcript = await process_audio_file(file_content, unique_filename, file.content_type)
        elif file.content_type == 'text/plain' or file_extension.lower() == '.txt':
            transcript = file_content.decode('utf-8')
        elif file.content_type == 'application/pdf' or file_extension.lower() == '.pdf':
            transcript = await process_pdf_file(file_content, unique_filename)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
        
        # Extract patient demographics from transcript
        demographics = await extract_patient_demographics_from_transcript(transcript)
        
        # Generate summary
        summary = await generate_consultation_summary(transcript)
        
        # Parse clinical data from summary
        clinical_data = await parse_clinical_data_from_summary(summary)
        
        # Create patient with extracted demographics
        patient_id = None
        extraction_metadata = demographics.get('extraction_metadata', {})
        
        # Check if we have minimum required information to create a patient
        if demographics.get('first_name') and demographics.get('last_name'):
            # Check if patient already exists
            existing = supabase.table("patients").select("*").eq(
                "first_name", demographics['first_name'].strip()
            ).eq(
                "last_name", demographics['last_name'].strip()
            ).execute()
            
            if existing.data and demographics.get('phone_1'):
                # Also check phone if available
                existing_with_phone = [p for p in existing.data if p.get('phone_1') == demographics['phone_1'].strip()]
                if existing_with_phone:
                    logger.info("Patient already exists, using existing record")
                    patient_id = existing_with_phone[0]['id']
                    extraction_metadata['patient_status'] = 'existing'
                else:
                    existing = None
            
            if not existing or not existing.data:
                # Create new patient with extracted demographics
                patient_id = str(uuid.uuid4())
                current_time = datetime.utcnow()
                
                patient_record = {
                    "id": patient_id,
                    "created_at": current_time.isoformat()
                }
                
                # Add extracted demographic fields
                if demographics.get('first_name'):
                    patient_record["first_name"] = demographics['first_name'].strip()
                if demographics.get('last_name'):
                    patient_record["last_name"] = demographics['last_name'].strip()
                if demographics.get('father_name'):
                    patient_record["father_name"] = demographics['father_name'].strip()
                if demographics.get('mother_name'):
                    patient_record["mother_name"] = demographics['mother_name'].strip()
                if demographics.get('date_of_birth'):
                    patient_record["date_of_birth"] = demographics['date_of_birth']
                elif demographics.get('age'):
                    # Calculate approximate date of birth from age
                    current_year = datetime.utcnow().year
                    birth_year = current_year - int(demographics['age'])
                    patient_record["date_of_birth"] = f"{birth_year}-01-01"
                
                if demographics.get('gender'):
                    patient_record["gender"] = demographics['gender']
                if demographics.get('phone_1'):
                    patient_record["phone_1"] = demographics['phone_1'].strip()
                if demographics.get('phone_2'):
                    patient_record["phone_2"] = demographics['phone_2'].strip()
                if demographics.get('email'):
                    patient_record["email"] = demographics['email'].strip()
                if demographics.get('address'):
                    patient_record["address"] = demographics['address'].strip()
                if demographics.get('occupation'):
                    patient_record["occupation"] = demographics['occupation'].strip()
                if demographics.get('education'):
                    patient_record["education"] = demographics['education'].strip()
                if demographics.get('marital_status'):
                    patient_record["marital_status"] = demographics['marital_status']
                
                # Add all extracted fields to patient record
                if demographics.get('children_count'):
                    patient_record["children_count"] = int(demographics['children_count'])
                if demographics.get('education'):
                    patient_record["education"] = demographics['education'].strip()
                if demographics.get('file_reference'):
                    patient_record["file_reference"] = demographics['file_reference'].strip()
                if demographics.get('case_number'):
                    patient_record["case_number"] = demographics['case_number'].strip()
                if demographics.get('referring_physician_name'):
                    patient_record["referring_physician_name"] = demographics['referring_physician_name'].strip()
                if demographics.get('referring_physician_phone_1'):
                    patient_record["referring_physician_phone_1"] = demographics['referring_physician_phone_1'].strip()
                if demographics.get('referring_physician_email'):
                    patient_record["referring_physician_email"] = demographics['referring_physician_email'].strip()
                if demographics.get('third_party_payer'):
                    patient_record["third_party_payer"] = demographics['third_party_payer'].strip()
                if demographics.get('medical_ref_number'):
                    patient_record["medical_ref_number"] = demographics['medical_ref_number'].strip()
                
                response = supabase.table("patients").insert(patient_record).execute()
                logger.info(f"Created new patient with ID: {patient_id}")
                extraction_metadata['patient_status'] = 'created'
                
        else:
            # Create a placeholder patient if minimum info not available
            logger.warning("Insufficient demographic information extracted, creating placeholder patient")
            patient_id = str(uuid.uuid4())
            current_time = datetime.utcnow()
            
            patient_record = {
                "id": patient_id,
                "first_name": "Unknown",
                "last_name": "Patient",
                "date_of_birth": "1900-01-01",
                "phone_1": "000-000-0000",
                "created_at": current_time.isoformat()
            }
            
            response = supabase.table("patients").insert(patient_record).execute()
            logger.info(f"Created placeholder patient with ID: {patient_id}")
            extraction_metadata['patient_status'] = 'placeholder'
            extraction_metadata['note'] = 'Insufficient demographic information extracted'
        
        # NOTE: File storage disabled by user request - only storing transcript and metadata
        public_url = None
        
        # Create recording record with required fields
        recording_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        recording_record = {
            "id": recording_id,
            "filename": unique_filename,
            "transcript": transcript,
            "summary": summary,
            "patient_id": patient_id,
            "created_at": current_time.isoformat()
        }
        
        recording_response = supabase.table("recordings").insert(recording_record).execute()
        
        if not recording_response.data:
            logger.error("Database insert failed: No data returned")
            raise HTTPException(status_code=500, detail="Failed to save recording record")
        
        # Update patient record with additional clinical data if available
        if patient_id and clinical_data:
            patient_update = {}
            
            # Add clinical data to patient record (only basic fields)
            if clinical_data.get('diagnosis'):
                patient_update["diagnosis"] = clinical_data.get('diagnosis')
            if clinical_data.get('allergies'):
                patient_update["allergies"] = clinical_data.get('allergies')
            if clinical_data.get('medications'):
                patient_update["medications"] = clinical_data.get('medications')
            
            # Apply updates if any
            if patient_update:
                update_response = supabase.table("patients").update(patient_update).eq("id", patient_id).execute()
                logger.info(f"Enhanced patient record with clinical data: {list(patient_update.keys())}")
        
        logger.info(f"Successfully created consultation for patient ID: {patient_id}")
        
        return UploadResponse(
            id=recording_id,
            filename=file.filename,
            transcript=transcript,
            summary=summary,
            patient_id=patient_id,
            created_at=current_time,
            extraction_metadata=extraction_metadata
        )
        
    except Exception as e:
        logger.error(f"Failed to create patient consultation: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create patient consultation: {str(e)}"
        )

# ===============================
# COMPREHENSIVE CLINICAL DATA ENDPOINTS
# ===============================

# Symptom Assessments
@app.get("/patients/{patient_id}/symptom-assessments")
async def get_patient_symptom_assessments(patient_id: str):
    """Get all symptom assessments for a patient."""
    try:
        response = supabase.table("patient_symptom_assessments").select("*").eq("patient_id", patient_id).order("assessment_date", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to get symptom assessments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients/{patient_id}/symptom-assessments")
async def create_symptom_assessment(patient_id: str, assessment_data: dict):
    """Create a new symptom assessment."""
    try:
        assessment_data["patient_id"] = patient_id
        response = supabase.table("patient_symptom_assessments").insert(assessment_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create symptom assessment")
        logger.info(f"Created symptom assessment for patient {patient_id}")
        return response.data[0]
    except Exception as e:
        logger.error(f"Failed to create symptom assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Biomarker Results
@app.get("/patients/{patient_id}/biomarkers")
async def get_patient_biomarkers(patient_id: str):
    """Get all biomarker results for a patient."""
    try:
        response = supabase.table("patient_biomarkers").select("*").eq("patient_id", patient_id).order("test_date", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to get biomarkers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients/{patient_id}/biomarkers")
async def create_biomarker(patient_id: str, biomarker_data: dict):
    """Create a new biomarker result."""
    try:
        biomarker_data["patient_id"] = patient_id
        response = supabase.table("patient_biomarkers").insert(biomarker_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create biomarker result")
        logger.info(f"Created biomarker result for patient {patient_id}")
        return response.data[0]
    except Exception as e:
        logger.error(f"Failed to create biomarker: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Treatment Response & Toxicity
@app.get("/patients/{patient_id}/treatment-responses")
async def get_patient_treatment_responses(patient_id: str):
    """Get all treatment responses for a patient."""
    try:
        response = supabase.table("patient_treatment_responses").select("*").eq("patient_id", patient_id).order("assessment_date", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to get treatment responses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients/{patient_id}/treatment-responses")
async def create_treatment_response(patient_id: str, response_data: dict):
    """Create a new treatment response assessment."""
    try:
        response_data["patient_id"] = patient_id
        response = supabase.table("patient_treatment_responses").insert(response_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create treatment response")
        logger.info(f"Created treatment response for patient {patient_id}")
        return response.data[0]
    except Exception as e:
        logger.error(f"Failed to create treatment response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Risk Assessments
@app.get("/patients/{patient_id}/risk-assessments")
async def get_patient_risk_assessments(patient_id: str):
    """Get all risk assessments for a patient."""
    try:
        response = supabase.table("patient_risk_assessments").select("*").eq("patient_id", patient_id).order("assessment_date", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to get risk assessments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients/{patient_id}/risk-assessments")
async def create_risk_assessment(patient_id: str, risk_data: dict):
    """Create a new risk assessment."""
    try:
        risk_data["patient_id"] = patient_id
        response = supabase.table("patient_risk_assessments").insert(risk_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create risk assessment")
        logger.info(f"Created risk assessment for patient {patient_id}")
        return response.data[0]
    except Exception as e:
        logger.error(f"Failed to create risk assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Psychosocial Assessments
@app.get("/patients/{patient_id}/psychosocial-assessments")
async def get_patient_psychosocial_assessments(patient_id: str):
    """Get all psychosocial assessments for a patient."""
    try:
        response = supabase.table("patient_psychosocial_assessments").select("*").eq("patient_id", patient_id).order("assessment_date", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to get psychosocial assessments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients/{patient_id}/psychosocial-assessments")
async def create_psychosocial_assessment(patient_id: str, psychosocial_data: dict):
    """Create a new psychosocial assessment."""
    try:
        psychosocial_data["patient_id"] = patient_id
        response = supabase.table("patient_psychosocial_assessments").insert(psychosocial_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create psychosocial assessment")
        logger.info(f"Created psychosocial assessment for patient {patient_id}")
        return response.data[0]
    except Exception as e:
        logger.error(f"Failed to create psychosocial assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Clinical Trials
@app.get("/patients/{patient_id}/clinical-trials")
async def get_patient_clinical_trials(patient_id: str):
    """Get all clinical trial information for a patient."""
    try:
        response = supabase.table("patient_clinical_trials").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to get clinical trials: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients/{patient_id}/clinical-trials")
async def create_clinical_trial(patient_id: str, trial_data: dict):
    """Create a new clinical trial record."""
    try:
        trial_data["patient_id"] = patient_id
        response = supabase.table("patient_clinical_trials").insert(trial_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create clinical trial record")
        logger.info(f"Created clinical trial record for patient {patient_id}")
        return response.data[0]
    except Exception as e:
        logger.error(f"Failed to create clinical trial: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced consultation processing with comprehensive data extraction
@app.post("/consultation/comprehensive", response_model=UploadResponse)
async def create_comprehensive_consultation(
    file: UploadFile = File(...),
    patient_id: str = Form(...)
):
    """Process consultation with comprehensive clinical data extraction."""
    try:
        logger.info("Creating comprehensive consultation with advanced extraction")
        
        # Process the file (audio/text/pdf)
        file_content = await file.read()
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Process based on file type
        transcript = ""
        if file.content_type and (file.content_type.startswith('audio/') or file.content_type.startswith('video/')):
            transcript = await process_audio_file(file_content, unique_filename, file.content_type)
        elif file.content_type == 'text/plain' or file_extension.lower() == '.txt':
            transcript = file_content.decode('utf-8')
        elif file.content_type == 'application/pdf' or file_extension.lower() == '.pdf':
            transcript = await process_pdf_file(file_content, unique_filename)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
        
        # Generate summary
        summary = await generate_consultation_summary(transcript)
        
        # Extract basic clinical data
        basic_clinical_data = await parse_clinical_data_from_summary(summary)
        
        # Extract comprehensive clinical data
        comprehensive_data = await extract_comprehensive_clinical_data(transcript, summary)
        
        # Create recording record
        recording_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        recording_record = {
            "id": recording_id,
            "filename": unique_filename,
            "transcript": transcript,
            "summary": summary,
            "patient_id": patient_id,
            "created_at": current_time.isoformat()
        }
        
        recording_response = supabase.table("recordings").insert(recording_record).execute()
        
        if not recording_response.data:
            raise HTTPException(status_code=500, detail="Failed to save recording record")
        
        # Store comprehensive clinical data in respective tables
        stored_data = {}
        
        # Store symptom assessment if data exists
        if comprehensive_data.get("symptom_assessment") and any(comprehensive_data["symptom_assessment"].values()):
            symptom_data = comprehensive_data["symptom_assessment"].copy()
            symptom_data.update({
                "patient_id": patient_id,
                "assessment_date": current_time.date().isoformat()
            })
            try:
                symptom_response = supabase.table("patient_symptom_assessments").insert(symptom_data).execute()
                stored_data["symptom_assessment"] = symptom_response.data[0] if symptom_response.data else None
            except Exception as e:
                logger.warning(f"Failed to store symptom assessment: {str(e)}")
        
        # Store biomarker results if data exists
        if comprehensive_data.get("biomarker_results") and any(comprehensive_data["biomarker_results"].values()):
            biomarker_data = comprehensive_data["biomarker_results"].copy()
            biomarker_data.update({
                "patient_id": patient_id,
                "test_date": current_time.date().isoformat()
            })
            try:
                biomarker_response = supabase.table("patient_biomarkers").insert(biomarker_data).execute()
                stored_data["biomarker_results"] = biomarker_response.data[0] if biomarker_response.data else None
            except Exception as e:
                logger.warning(f"Failed to store biomarker results: {str(e)}")
        
        # Store risk assessment if data exists
        if comprehensive_data.get("risk_assessment") and any(comprehensive_data["risk_assessment"].values()):
            risk_data = comprehensive_data["risk_assessment"].copy()
            risk_data.update({
                "patient_id": patient_id,
                "assessment_date": current_time.date().isoformat()
            })
            try:
                risk_response = supabase.table("patient_risk_assessments").insert(risk_data).execute()
                stored_data["risk_assessment"] = risk_response.data[0] if risk_response.data else None
            except Exception as e:
                logger.warning(f"Failed to store risk assessment: {str(e)}")
        
        logger.info(f"Comprehensive consultation created with extracted data: {list(stored_data.keys())}")
        
        return UploadResponse(
            id=recording_id,
            filename=file.filename,
            transcript=transcript,
            summary=summary,
            patient_id=patient_id,
            created_at=current_time,
            extraction_metadata={
                "basic_clinical": basic_clinical_data,
                "comprehensive_clinical": comprehensive_data,
                "stored_tables": list(stored_data.keys())
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create comprehensive consultation: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create comprehensive consultation: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)