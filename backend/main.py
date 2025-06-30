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

# Response models
class Patient(BaseModel):
    id: str
    name: str
    date_of_birth: str
    phone: str
    created_at: Optional[datetime] = None

class PatientCreate(BaseModel):
    name: str
    date_of_birth: str
    phone: str

class UploadResponse(BaseModel):
    id: str
    filename: str
    transcript: Optional[str] = None
    patient_id: Optional[str] = None
    created_at: datetime

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Clinic Assistant API"}

@app.get("/patients/search")
async def search_patients(
    name: str = Query(..., description="Patient name"),
    date_of_birth: str = Query(..., description="Date of birth (YYYY-MM-DD)"),
    phone: str = Query(..., description="Phone number")
) -> List[Patient]:
    """Search for patients by name, date of birth, and phone number."""
    try:
        logger.info(f"Searching for patient: name={name}, dob={date_of_birth}, phone={phone}")
        
        response = supabase.table("patients").select("*").eq("name", name.strip()).eq("date_of_birth", date_of_birth.strip()).eq("phone", phone.strip()).execute()
        
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
        logger.info(f"Creating new patient: {patient_data.name}")
        
        # Check if patient already exists
        existing = supabase.table("patients").select("*").eq("name", patient_data.name.strip()).eq("date_of_birth", patient_data.date_of_birth.strip()).eq("phone", patient_data.phone.strip()).execute()
        
        if existing.data:
            logger.info("Patient already exists, returning existing record")
            return existing.data[0]
        
        # Create new patient
        patient_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        patient_record = {
            "id": patient_id,
            "name": patient_data.name.strip(),
            "date_of_birth": patient_data.date_of_birth.strip(),
            "phone": patient_data.phone.strip(),
            "created_at": current_time.isoformat()
        }
        
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
async def upload_audio(
    file: UploadFile = File(...), 
    patient_id: Optional[str] = Form(None)
):
    """
    Process audio file temporarily, transcribe using OpenAI Whisper, 
    and store only the transcript in database linked to patient.
    Audio files are not permanently stored to save costs and storage.
    """
    try:
        logger.info(f"Received file upload: {file.filename}, content_type: {file.content_type}, patient_id: {patient_id}")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            logger.warning(f"Invalid file type: {file.content_type}")
            raise HTTPException(
                status_code=400, 
                detail="Only audio files are allowed"
            )
        
        # Generate unique filename for identification
        file_extension = Path(file.filename or "recording.m4a").suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Read file content
        file_content = await file.read()
        logger.info(f"File size: {len(file_content)} bytes")
        
        # Generate IDs for database
        recording_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        # Transcribe audio using OpenAI Whisper with segmentation for long files
        transcript = ""
        try:
            logger.info("Starting transcription with OpenAI Whisper...")
            
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
            
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            # Don't fail the entire request if transcription fails
            transcript = f"Transcription failed: {str(e)}"
        
        # Insert record into database with transcript
        try:
            logger.info("Inserting record into database with transcript...")
            recording_data = {
                "id": recording_id,
                "filename": unique_filename,
                "transcript": transcript,
                "created_at": current_time.isoformat()
            }
            
            # Add patient_id if provided
            if patient_id:
                recording_data["patient_id"] = patient_id
                logger.info(f"Linking recording to patient: {patient_id}")
            
            db_response = supabase.table("recordings").insert(recording_data).execute()
            logger.info(f"Database insert response: {db_response}")
        except Exception as e:
            logger.error(f"Database insert failed: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to insert database record: {str(e)}"
            )
        
        logger.info(f"Transcription process completed successfully for {unique_filename}")
        
        return UploadResponse(
            id=recording_id,
            filename=unique_filename,
            transcript=transcript,
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
    """Get a specific recording by ID."""
    try:
        response = supabase.table("recordings").select("*").eq("id", recording_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Recording not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch recording: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch recording: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)