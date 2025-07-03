import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Calendar, Phone, FileText, Clock } from 'lucide-react'
import { useRecording } from '@/hooks/usePatients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function RecordingDetailPage() {
  const { recordingId } = useParams()
  const navigate = useNavigate()
  const { data: recording, isLoading, error } = useRecording(recordingId)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhone = (phone) => {
    if (!phone) return 'N/A'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load recording: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const patient = recording?.patients
  const patientName = patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : ''

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(patient ? `/patients/${patient.id}` : '/patients')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {patient ? `Back to ${patientName}` : 'Back'}
        </Button>
      </div>

      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {isLoading ? <Skeleton className="h-6 w-48" /> : patientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                                 <div>
                   <p className="text-sm text-muted-foreground">Date of Birth</p>
                   <p className="font-medium">{formatDate(patient?.date_of_birth)}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{formatPhone(patient?.phone_1 || patient?.phone)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Consultation Date</p>
                  <p className="font-medium">
                    {isLoading ? <Skeleton className="h-6 w-28" /> : formatDateTime(recording?.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Summary Card */}
      {recording?.summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">AI</span>
                </div>
                <span>Consultation Summary</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900">
                {recording.summary}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Full Consultation Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {recording?.transcript || 'No transcript available.'}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 