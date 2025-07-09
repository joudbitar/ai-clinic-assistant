import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, Mic, Square, Play, Pause, Upload, FileText, 
  User, Clock, CheckCircle, 
  AlertCircle, Loader2, Volume2, VolumeX
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePatient } from '@/hooks/usePatients'
import { useToast } from '@/hooks/useToast'
import { AudioRecorder } from '@/components/AudioRecorder'
import { UploadStatus } from '@/components/UploadStatus'

export default function PatientRecordingPage() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const { toast } = useToast()
  
  // Fetch patient data
  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId)
  
  // State management
  const [activeTab, setActiveTab] = useState('record')
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

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    
    // Check if this is placeholder data (birth year 1900 or name contains "New Patient")
    const birth = new Date(dateOfBirth)
    if (birth.getFullYear() <= 1900) return 'Pending'
    
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const isPlaceholderPatient = (patient) => {
    return patient?.first_name === 'New Patient' || 
           new Date(patient?.date_of_birth).getFullYear() <= 1900
  }

  const isSubmitDisabled = useMemo(() => {
    return !manualTranscript.trim() || uploadStatus === 'uploading'
  }, [manualTranscript, uploadStatus])
  
  const handleFileUpload = async (file, type) => {
    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      let endpoint = 'http://localhost:8000/upload'
      
      if (isPlaceholderPatient(patient)) {
        // For new patients, use the new endpoint
        endpoint = 'http://localhost:8000/consultation/new_patient'
      } else {
        // For existing patients, add patient_id
        formData.append('patient_id', patientId)
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
      
      if (isPlaceholderPatient(patient)) {
        toast.success(`New patient created and ${type} processed successfully!`)
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
      
      if (isPlaceholderPatient(patient)) {
        // For new patients, use the new endpoint
        endpoint = 'http://localhost:8000/consultation/new_patient'
      } else {
        // For existing patients, add patient_id
        formData.append('patient_id', patientId)
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
      
      if (isPlaceholderPatient(patient)) {
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

  if (patientError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load patient information. {patientError.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading patient information...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Record Consultation</h1>
              <p className="text-muted-foreground">Record a new consultation for this patient</p>
            </div>
          </div>
        </div>

        {/* Patient Information Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
                     <CardContent>
            {isPlaceholderPatient(patient) ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-blue-600">New Patient</p>
                <p className="text-sm text-muted-foreground">
                  Patient information will be extracted from the consultation recording
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-lg font-semibold">
                    {patient?.first_name} {patient?.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                  <p className="text-lg">
                    {calculateAge(patient?.date_of_birth)} {calculateAge(patient?.date_of_birth) !== 'Pending' && calculateAge(patient?.date_of_birth) !== 'N/A' ? 'years old' : ''}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                  <p className="text-lg">
                    {patient?.date_of_birth && new Date(patient.date_of_birth).getFullYear() > 1900 
                      ? new Date(patient.date_of_birth).toLocaleDateString() 
                      : 'Pending'
                    }
                  </p>
                </div>
                {patient?.cancer_type && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cancer Type</Label>
                    <p className="text-lg">{patient.cancer_type}</p>
                  </div>
                )}
                {patient?.clinical_status && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant="outline">{patient.clinical_status}</Badge>
                  </div>
                )}
                {patient?.phone_1 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-lg">{patient.phone_1}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="record" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Audio Recording</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>File Upload</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
          </TabsList>

          {/* Audio Recording Tab */}
          <TabsContent value="record" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audio Recording</CardTitle>
              </CardHeader>
                             <CardContent>
                <AudioRecorder 
                  selectedPatient={patient}
                  consultationType={isPlaceholderPatient(patient) ? "new" : "existing"}
                  onValidationCheck={() => null} // No validation needed since patient is already selected
                  onUploadComplete={(result) => {
                    setTranscriptionResult(result)
                    setUploadStatus('completed')
                    if (isPlaceholderPatient(patient)) {
                      toast.success('New patient consultation recorded successfully!')
                    } else {
                      toast.success('Audio recording uploaded and processed successfully!')
                    }
                    setTimeout(() => {
                      navigate(`/recordings/${result.id}`)
                    }, 2000)
                  }}
                  onUploadProgress={setUploadProgress}
                  onUploadStatusChange={setUploadStatus}
                  onError={(errorMsg) => {
                    setErrorMessage(errorMsg)
                    setUploadStatus('failed')
                    toast.error(`Recording failed: ${errorMsg}`)
                  }}
                />
               </CardContent>
            </Card>
          </TabsContent>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Audio or Video File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg">Drag and drop your file here</p>
                    <p className="text-sm text-muted-foreground">
                      Supports audio files (MP3, WAV, M4A) and video files (MP4, MOV)
                    </p>
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const fileType = file.type.startsWith('audio/') ? 'audio file' : 'video file'
                          handleFileUpload(file, fileType)
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <div>
                      <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Browse Files
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Transcript Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-transcript">Meeting Notes or Transcript</Label>
                  <Textarea
                    id="manual-transcript"
                    placeholder="Enter your consultation notes or transcript here..."
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    className="min-h-[200px]"
                  />
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
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Notes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Status */}
        {uploadStatus !== 'idle' && (
          <UploadStatus 
            status={uploadStatus}
            progress={uploadProgress}
            result={transcriptionResult}
            errorMessage={errorMessage}
          />
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
} 