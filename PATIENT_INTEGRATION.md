# Patient Integration with Audio Recordings

## 🏥 **Overview**

The AI Clinic Assistant now includes comprehensive patient management functionality that links each audio recording to a specific patient record. This enables better organization and tracking of medical consultations.

## ✅ **Features Implemented**

### 📱 **Mobile App (React Native)**

- **Patient Information Form**: Modal form to capture patient details before recording
- **Patient Search & Creation**: Automatically finds existing patients or creates new ones
- **Current Patient Display**: Shows selected patient information in the UI
- **Patient Association**: Links each recording to the selected patient
- **Patient Information in Recordings List**: Shows patient name alongside recording details

### ☁️ **Backend (FastAPI)**

- **Patient Search Endpoint**: `/patients/search` - Find patients by name, DOB, and phone
- **Patient Creation Endpoint**: `/patients` - Create new patient records
- **Enhanced Upload Endpoint**: `/upload` now accepts `patient_id` parameter
- **Patient-Recording Linkage**: Foreign key relationship in recordings table

## 🔄 **Workflow**

### **Recording with Patient Information**

1. **Doctor taps record button** → Patient form appears (if no patient selected)
2. **Patient information entered** → Name, date of birth, phone number
3. **System searches for existing patient** → Based on exact match of all three fields
4. **Patient found OR created** → Uses existing ID or creates new patient record
5. **Recording starts** → Audio recording begins with patient context
6. **Recording completes** → Automatically uploads with patient_id included
7. **Database linkage** → Recording saved with patient foreign key reference

### **Patient Form Fields**

```typescript
interface Patient {
  id: string;
  name: string;
  date_of_birth: string; // Format: YYYY-MM-DD
  phone: string;
}
```

## 🏗️ **Database Schema**

### **Patients Table**

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Updated Recordings Table**

```sql
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    transcript TEXT DEFAULT '',
    patient_id UUID REFERENCES patients(id), -- Foreign key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🌐 **API Endpoints**

### **GET `/patients/search`**

Search for existing patients by exact match.

**Query Parameters:**

- `name`: Patient full name
- `date_of_birth`: Date in YYYY-MM-DD format
- `phone`: Phone number

**Response:** Array of matching patients

```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "date_of_birth": "1990-01-15",
    "phone": "+1234567890",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### **POST `/patients`**

Create a new patient record.

**Request Body:**

```json
{
  "name": "John Doe",
  "date_of_birth": "1990-01-15",
  "phone": "+1234567890"
}
```

**Response:** Created patient object

### **POST `/upload` (Enhanced)**

Upload audio with optional patient linkage.

**Form Data:**

- `file`: Audio file (multipart/form-data)
- `patient_id`: Optional UUID of the patient (form field)

**Response:**

```json
{
  "id": "recording_uuid",
  "filename": "unique_filename.m4a",
  "url": "public_supabase_url",
  "transcript": "transcribed_text",
  "patient_id": "patient_uuid",
  "created_at": "timestamp"
}
```

## 📱 **Mobile App UI Changes**

### **Patient Form Modal**

- **Clean, modal interface** for patient data entry
- **Required field validation** for all three fields
- **Loading states** during patient search/creation
- **Error handling** with user-friendly messages

### **Current Patient Display**

- **Patient information card** shows current selection
- **Change patient button** to switch patients
- **Patient name in recordings list** for easy identification

### **Enhanced Recording Flow**

```
Tap Record → Patient Form → Patient Selected → Start Recording
                ↓
         Auto-search existing → Found: Use existing
                ↓              ↓
         Not found → Create new patient
```

## 🔐 **Data Privacy & Security**

### **Patient Matching Logic**

- **Exact match required** on all three fields (name, DOB, phone)
- **Case-sensitive matching** for accuracy
- **Trimmed whitespace** to handle input variations

### **Error Handling**

- **Network failures**: Graceful degradation with retry options
- **Database errors**: Comprehensive logging for debugging
- **Invalid inputs**: Client-side validation with helpful messages

## 🚀 **Usage Instructions**

### **For Doctors**

1. **First time with patient**: Tap record → Fill patient form → Start recording
2. **Returning patient**: Patient already selected → Tap record → Recording starts immediately
3. **Different patient**: Tap "Change" button → New patient form → Update selection
4. **Review recordings**: Patient names shown in recordings list for easy identification

### **For Development**

1. **Database setup**: Ensure both `patients` and `recordings` tables exist
2. **Foreign key constraint**: `recordings.patient_id` references `patients.id`
3. **Backend restart**: Required after environment variable changes
4. **Testing**: Use patient form with valid data format (YYYY-MM-DD for dates)

## 🔧 **Technical Implementation Details**

### **Patient Lookup Flow**

```typescript
// 1. Search for existing patient
const existingPatients = await axios.get("/patients/search", {
  params: { name, date_of_birth, phone },
});

// 2. Use existing or create new
if (existingPatients.length > 0) {
  return existingPatients[0]; // Use existing
} else {
  return await axios.post("/patients", { name, date_of_birth, phone }); // Create new
}
```

### **Upload with Patient ID**

```typescript
const formData = new FormData();
formData.append("file", audioFile);
if (patientId) {
  formData.append("patient_id", patientId); // Include patient reference
}
```

## 📊 **Benefits**

- **Organized patient records**: Each recording linked to specific patient
- **Better consultation tracking**: Historical audio records per patient
- **Reduced data entry**: Automatic patient recognition for returning patients
- **Enhanced medical documentation**: Patient context preserved with recordings
- **Streamlined workflow**: One-time patient setup per consultation session

## 🛠️ **Future Enhancements**

- **Patient search by partial match**: More flexible patient lookup
- **Patient edit functionality**: Update patient information
- **Consultation sessions**: Group multiple recordings per visit
- **Patient medical history**: Integration with existing medical records
- **Voice biometrics**: Automatic patient identification by voice

---

_Patient integration complete - Ready for medical consultation workflows with full patient context!_ 🏥
