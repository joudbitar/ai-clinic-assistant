import { useState, useEffect, useRef, useMemo } from 'react'
import { 
  Mic, Square, Play, Pause, Volume2, VolumeX, 
  Loader2, CheckCircle, AlertCircle, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AudioRecorder({ 
  selectedPatient, 
  consultationType,
  newPatientData,
  onValidationCheck,
  onUploadComplete, 
  onUploadProgress, 
  onUploadStatusChange,
  onError 
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  
  // Refs
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const durationIntervalRef = useRef(null)
  const audioElementRef = useRef(null)
  
  // Configuration
  const CHUNK_DURATION = 30000 // 30 seconds in milliseconds
  const MAX_RECORDING_TIME = 3600 // 1 hour in seconds

  // Memoize validation result to prevent infinite re-renders
  const validationError = useMemo(() => {
    return onValidationCheck ? onValidationCheck() : null
  }, [onValidationCheck])

  const isRecordingDisabled = useMemo(() => {
    return validationError !== null || isUploading
  }, [validationError, isUploading])
  
  useEffect(() => {
    // Request microphone permission on mount
    requestMicrophonePermission()
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [])
  
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      setHasPermission(true)
      setPermissionError('')
      // Stop the stream immediately, we'll get a new one when recording starts
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Microphone permission denied:', error)
      setHasPermission(false)
      setPermissionError('Microphone access is required for recording. Please allow microphone access and refresh the page.')
    }
  }
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  const startRecording = async () => {
    // Use the validation check from parent component
    if (validationError) {
      onError(validationError)
      return
    }
    
    if (!hasPermission) {
      await requestMicrophonePermission()
      if (!hasPermission) return
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      streamRef.current = stream
      audioChunksRef.current = []
      
      // Create MediaRecorder with appropriate options
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      }
      
      // Fallback MIME types for browser compatibility
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4'
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options.mimeType = 'audio/ogg'
        } else {
          delete options.mimeType
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        // Create final blob with all chunks
        const finalBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorderRef.current.mimeType 
        })
        setAudioBlob(finalBlob)
        
        // Create audio URL for playback
        const url = URL.createObjectURL(finalBlob)
        setAudioUrl(url)
        
        // Upload final recording
        uploadFinalRecording(finalBlob)
      }
      
      mediaRecorderRef.current.start(CHUNK_DURATION)
      setIsRecording(true)
      setIsPaused(false)
      setRecordingDuration(0)
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1
          // Auto-stop at max recording time
          if (newDuration >= MAX_RECORDING_TIME) {
            stopRecording()
          }
          return newDuration
        })
      }, 1000)
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      onError('Failed to start recording. Please check your microphone permissions.')
    }
  }
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }
  
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Resume duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= MAX_RECORDING_TIME) {
            stopRecording()
          }
          return newDuration
        })
      }, 1000)
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }
  
  const uploadFinalRecording = async (finalBlob) => {
    setIsUploading(true)
    onUploadStatusChange('uploading')
    
    try {
      const formData = new FormData()
      const filename = `recording_${Date.now()}.webm`
      formData.append('file', finalBlob, filename)
      
      let endpoint = 'http://localhost:8000/upload'
      
      if (consultationType === 'existing') {
        formData.append('patient_id', selectedPatient.id)
      } else {
        // For new patients, use the new endpoint
        endpoint = 'http://localhost:8000/consultation/new_patient'
        formData.append('patient_data', JSON.stringify(newPatientData))
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      setIsUploading(false)
      onUploadStatusChange('completed')
      onUploadComplete(result)
      
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
      onUploadStatusChange('failed')
      onError(error.message)
    }
  }
  
  const playAudio = () => {
    if (audioElementRef.current && audioUrl) {
      audioElementRef.current.play()
      setIsPlaying(true)
    }
  }
  
  const pauseAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    }
  }
  
  const resetRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setRecordingDuration(0)
    setIsPlaying(false)
    setUploadProgress(0)
    audioChunksRef.current = []
  }
  
  if (!hasPermission) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {permissionError}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={requestMicrophonePermission}
            className="ml-2"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-4">
          {!isRecording && !audioBlob && (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={isRecordingDisabled}
              className="h-16 w-16 rounded-full"
            >
              <Mic className="h-8 w-8" />
            </Button>
          )}
          
          {isRecording && (
            <>
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                className="h-16 w-16 rounded-full"
              >
                <Square className="h-8 w-8" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="h-12 w-12 rounded-full"
              >
                {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
              </Button>
            </>
          )}
          
          {audioBlob && !isUploading && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={isPlaying ? pauseAudio : playAudio}
                className="h-12 w-12 rounded-full"
              >
                {isPlaying ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              
              <Button
                size="lg"
                variant="ghost"
                onClick={resetRecording}
                className="h-12 w-12 rounded-full"
              >
                <Square className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        
        {/* Status Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="text-2xl font-mono">
              {formatDuration(recordingDuration)}
            </span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            {isRecording && (
              <Badge variant={isPaused ? "secondary" : "default"}>
                {isPaused ? 'Paused' : 'Recording...'}
              </Badge>
            )}
            
            {isUploading && (
              <Badge variant="outline">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Uploading...
              </Badge>
            )}
            
            {audioBlob && !isUploading && (
              <Badge variant="outline">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready to Upload
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Audio Playback */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      
      {/* Recording Tips */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">Recording Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Minimize background noise</li>
              <li>• Recording will automatically upload and transcribe</li>
              <li>• Maximum recording time: 1 hour</li>
              <li>• You can pause and resume recording</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 