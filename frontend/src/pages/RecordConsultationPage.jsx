import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, Mic, Square, Play, Pause, Upload, FileText, 
  User, Clock, CheckCircle, 
  AlertCircle, Loader2, Volume2, VolumeX, UserPlus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePatients } from '@/hooks/usePatients'
import { useToast } from '@/hooks/useToast'
import { AudioRecorder } from '@/components/AudioRecorder'
import { PatientSelector } from '@/components/PatientSelector'
import { UploadStatus } from '@/components/UploadStatus'

export default function RecordConsultationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  
  // Get patient ID from URL params if coming from patient detail page
  const preselectedPatientId = searchParams.get('patientId')
  
  // State management
  const [consultationType, setConsultationType] = useState('existing') // 'new' or 'existing'
  const [activeTab, setActiveTab] = useState('record')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, processing, completed, failed
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcriptionResult, setTranscriptionResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  
  // Form states for different input types
  const [manualTranscript, setManualTranscript] = useState('')
  
  // Refs
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const durationIntervalRef = useRef(null)
  
  // Note: preselectedPatientId is available from URL params but we don't auto-select
  // Users must manually select a patient for clarity and confirmation
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [])
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setErrorMessage('')
  }

  const handleConsultationTypeChange = useCallback((type) => {
    setConsultationType(type)
    setSelectedPatient(null)
    setErrorMessage('')
  }, [])

  const validationCheck = useCallback(() => {
    if (consultationType === 'existing') {
      return selectedPatient ? null : 'Please select a patient before recording'
    } else {
      // For new patients, no validation needed - just record
      return null
    }
  }, [consultationType, selectedPatient])

  const isSubmitDisabled = useMemo(() => {
    if (consultationType === 'existing') {
      return !selectedPatient || !manualTranscript.trim() || uploadStatus === 'uploading'
    } else {
      // For new patients, only need transcript for manual entry
      return !manualTranscript.trim() || uploadStatus === 'uploading'
    }
  }, [consultationType, selectedPatient, manualTranscript, uploadStatus])
  
  const handleFileUpload = async (file, type) => {
    if (consultationType === 'existing' && !selectedPatient) {
      setErrorMessage('Please select a patient before uploading')
      return
    }
    
    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      let endpoint = 'http://localhost:8000/upload'
      
      if (consultationType === 'existing') {
        formData.append('patient_id', selectedPatient.id)
      } else {
        // For new patients, use the new endpoint
        endpoint = 'http://localhost:8000/consultation/new_patient'
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      setTranscriptionResult(result)
      setUploadStatus('completed')
      
      if (consultationType === 'new') {
        toast.success('New patient created and consultation recorded successfully!')
      } else {
        toast.success(`${type} uploaded and processed successfully!`)
      }
      
      // Navigate to the recording detail page
      setTimeout(() => {
        navigate(`/recordings/${result.id}`)
      }, 2000)
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('failed')
      setErrorMessage(error.message)
      toast.error(`Failed to upload ${type}: ${error.message}`)
    }
  }
  
  const handleManualTranscriptSubmit = async () => {
    if (consultationType === 'existing' && !selectedPatient) {
      setErrorMessage('Please select a patient before submitting')
      return
    }
    
    if (!manualTranscript.trim()) {
      setErrorMessage('Please enter meeting notes or transcript')
      return
    }
    
    setUploadStatus('uploading')
    setErrorMessage('')
    
    try {
      // Create a text file from the manual transcript
      const blob = new Blob([manualTranscript], { type: 'text/plain' })
      const file = new File([blob], `manual_transcript_${Date.now()}.txt`, { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', file)
      
      let endpoint = 'http://localhost:8000/upload'
      
      if (consultationType === 'existing') {
        formData.append('patient_id', selectedPatient.id)
      } else {
        // For new patients, use the new endpoint
        endpoint = 'http://localhost:8000/consultation/new_patient'
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      setTranscriptionResult(result)
      setUploadStatus('completed')
      
      if (consultationType === 'new') {
        toast.success('New patient created and meeting notes submitted successfully!')
      } else {
        toast.success('Meeting notes submitted successfully!')
      }
      
      // Navigate to the recording detail page
      setTimeout(() => {
        navigate(`/recordings/${result.id}`)
      }, 2000)
      
    } catch (error) {
      console.error('Submit error:', error)
      setUploadStatus('failed')
      setErrorMessage(error.message)
      toast.error(`Failed to submit meeting notes: ${error.message}`)
    }
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <Mic className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Record Consultation</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Capture and transcribe patient consultations using audio recording or manual meeting notes entry
        </p>
      </div>

      {/* Consultation Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Consultation Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={consultationType === 'existing' ? 'default' : 'outline'}
              onClick={() => handleConsultationTypeChange('existing')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Existing Patient
            </Button>
            <Button
              variant={consultationType === 'new' ? 'default' : 'outline'}
              onClick={() => handleConsultationTypeChange('new')}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              New Patient
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Patient Selection/Creation */}
      {consultationType === 'existing' ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PatientSelector 
              selectedPatient={selectedPatient}
              onPatientSelect={handlePatientSelect}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              New Patient - AI Inference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">✨ Intelligent Patient Information Extraction</h4>
              <p className="text-sm text-blue-700 mb-2">
                Our AI will automatically extract patient information from your consultation recording or transcript. 
                No manual form filling required!
              </p>
              <p className="text-sm text-blue-600">
                Just record your consultation or enter meeting notes, and we'll identify:
              </p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Patient name and demographics</li>
                <li>• Contact information</li>
                <li>• Medical history and symptoms</li>
                <li>• Diagnosis and treatment plans</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manual-transcript">Meeting Notes/Transcript</Label>
              <Textarea
                id="manual-transcript"
                placeholder="Enter meeting notes, consultation transcript, or patient discussion details..."
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                rows={10}
                disabled={uploadStatus === 'uploading'}
              />
              <p className="text-sm text-muted-foreground">
                {manualTranscript.length} characters
              </p>
            </div>
            
            <Button 
              onClick={handleManualTranscriptSubmit}
              disabled={isSubmitDisabled}
              className="w-full"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing & Creating Patient...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create New Patient & Record Consultation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Error Display */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Record Audio
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {consultationType === 'existing' ? 'Meeting Notes/Transcript' : 'Manual Entry (Alternative)'}
          </TabsTrigger>
        </TabsList>
        
        {/* Audio Recording Tab */}
        <TabsContent value="record">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audio Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioRecorder
                selectedPatient={selectedPatient}
                consultationType={consultationType}
                onValidationCheck={validationCheck}
                onUploadComplete={(result) => {
                  setTranscriptionResult(result)
                  setUploadStatus('completed')
                  const message = consultationType === 'new' 
                    ? 'New patient created and recording uploaded successfully!'
                    : 'Recording uploaded and transcribed successfully!'
                  toast.success(message)
                  setTimeout(() => {
                    navigate(`/recordings/${result.id}`)
                  }, 2000)
                }}
                onUploadProgress={(progress) => setUploadProgress(progress)}
                onUploadStatusChange={(status) => setUploadStatus(status)}
                onError={(error) => {
                  setErrorMessage(error)
                  setUploadStatus('failed')
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Meeting Notes/Transcript Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Meeting Notes/Transcript
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-transcript">Meeting Notes/Transcript</Label>
                <Textarea
                  id="manual-transcript"
                  placeholder="Enter meeting notes, consultation transcript, or patient discussion details..."
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  rows={10}
                  disabled={uploadStatus === 'uploading'}
                />
                <p className="text-sm text-muted-foreground">
                  {manualTranscript.length} characters
                </p>
              </div>
              
              <Button 
                onClick={handleManualTranscriptSubmit}
                disabled={isSubmitDisabled}
                className="w-full"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Meeting Notes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Upload Status */}
      {uploadStatus !== 'idle' && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <UploadStatus 
              status={uploadStatus}
              progress={uploadProgress}
              result={transcriptionResult}
              error={errorMessage}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
} 