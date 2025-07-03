import { CheckCircle, AlertCircle, Loader2, Clock, Upload, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNavigate } from 'react-router-dom'

export function UploadStatus({ status, progress, result, error }) {
  const navigate = useNavigate()

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'processing':
        return <Clock className="h-5 w-5" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Upload className="h-5 w-5" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading file...'
      case 'processing':
        return 'Processing and transcribing...'
      case 'completed':
        return 'Upload completed successfully!'
      case 'failed':
        return 'Upload failed'
      default:
        return 'Ready to upload'
    }
  }

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'uploading':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
        <Badge variant={getStatusBadgeVariant()}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {status === 'failed' && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {status === 'completed' && result && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Processing Complete</span>
            </div>
            <div className="text-sm text-green-700">
              <p>File: {result.filename}</p>
              <p>Upload ID: {result.id}</p>
              
              {/* AI Summary Preview */}
              {result.summary && (
                <div className="mt-3">
                  <p className="font-medium">AI Summary:</p>
                  <div className="text-xs bg-blue-50 p-2 rounded border mt-1 border-blue-200">
                    <div className="whitespace-pre-wrap text-blue-900">
                      {result.summary.length > 150 
                        ? `${result.summary.substring(0, 150)}...` 
                        : result.summary
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transcript Preview */}
              {result.transcript && (
                <div className="mt-3">
                  <p className="font-medium">Transcript Preview:</p>
                  <p className="text-xs bg-white p-2 rounded border mt-1">
                    {result.transcript.substring(0, 200)}
                    {result.transcript.length > 200 && '...'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate(`/recordings/${result.id}`)}
              className="w-full"
            >
              View Recording Details
            </Button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === 'uploading' && (
        <div className="text-sm text-muted-foreground">
          <p>• Uploading file to server...</p>
          <p>• Please keep this page open</p>
        </div>
      )}

      {status === 'processing' && (
        <div className="text-sm text-muted-foreground">
          <p>• Transcribing audio with AI...</p>
          <p>• Generating consultation summary...</p>
          <p>• This may take a few minutes for longer recordings</p>
        </div>
      )}
    </div>
  )
} 