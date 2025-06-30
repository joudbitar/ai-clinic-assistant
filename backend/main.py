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
    url: str
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
    Upload audio file, save to Supabase Storage, insert record to database,
    link to patient, and transcribe using OpenAI Whisper.
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
        
        # Generate unique filename
        file_extension = Path(file.filename or "recording.m4a").suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Read file content
        file_content = await file.read()
        logger.info(f"File size: {len(file_content)} bytes")
        
        # Upload to Supabase Storage
        try:
            logger.info("Uploading to Supabase Storage...")
            storage_response = supabase.storage.from_("audio-files").upload(
                unique_filename, 
                file_content,
                file_options={"content-type": file.content_type}
            )
            logger.info(f"Upload response: {storage_response}")
        except Exception as e:
            logger.error(f"Supabase Storage upload failed: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to upload to storage: {str(e)}"
            )
        
        # Get public URL
        try:
            public_url_response = supabase.storage.from_("audio-files").get_public_url(unique_filename)
            public_url = public_url_response
            logger.info(f"Public URL: {public_url}")
        except Exception as e:
            logger.error(f"Failed to get public URL: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to get public URL: {str(e)}"
            )
        
        # Insert record into database
        recording_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        try:
            logger.info("Inserting record into database...")
            recording_data = {
                "id": recording_id,
                "filename": unique_filename,
                "url": public_url,
                "transcript": "",  # Initially empty
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
            # Try to clean up uploaded file
            try:
                supabase.storage.from_("audio-files").remove([unique_filename])
            except:
                pass
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to insert database record: {str(e)}"
            )
        
        # Transcribe audio using OpenAI Whisper
        transcript = ""
        try:
            logger.info("Starting transcription with OpenAI Whisper...")
            
            # Create a temporary file for OpenAI API
            temp_file_path = f"/tmp/{unique_filename}"
            with open(temp_file_path, "wb") as temp_file:
                temp_file.write(file_content)
            
            # Transcribe with OpenAI Whisper
            with open(temp_file_path, "rb") as audio_file:
                transcription_response = openai.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
                transcript = transcription_response.strip()
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            logger.info(f"Transcription completed: {transcript[:100]}...")
            
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            # Don't fail the entire request if transcription fails
            transcript = f"Transcription failed: {str(e)}"
        
        # Update database record with transcript
        try:
            logger.info("Updating database with transcript...")
            update_response = supabase.table("recordings").update({
                "transcript": transcript
            }).eq("id", recording_id).execute()
            logger.info(f"Database update response: {update_response}")
        except Exception as e:
            logger.error(f"Failed to update transcript: {str(e)}")
            # Don't fail the request if transcript update fails
        
        logger.info(f"Upload process completed successfully for {unique_filename}")
        
        return UploadResponse(
            id=recording_id,
            filename=unique_filename,
            url=public_url,
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