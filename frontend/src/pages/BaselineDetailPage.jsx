import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Target, Eye, FileText, Calendar, User } from 'lucide-react'
import { useBaseline, useBaselineTumors, usePatient } from '@/hooks/usePatients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CancerStageBadge } from '@/components/ClinicalBadge'

export default function BaselineDetailPage() {
  const { baselineId } = useParams()
  const navigate = useNavigate()
  
  const { data: baseline, isLoading: baselineLoading, error: baselineError } = useBaseline(baselineId)
  const { data: tumors, isLoading: tumorsLoading, error: tumorsError } = useBaselineTumors(baselineId)
  const { data: patient, isLoading: patientLoading } = usePatient(baseline?.patient_id)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (baselineError || tumorsError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load baseline data: {(baselineError || tumorsError)?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="h-8 w-8" />
              {baselineLoading ? (
                <Skeleton className="h-9 w-48" />
              ) : (
                `Baseline - ${formatDate(baseline?.created_at)}`
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {patientLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : patient ? (
                <>
                  Patient: {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'N/A'} • 
                  <Link 
                    to={`/patients/${patient.id}`}
                    className="text-primary hover:underline ml-1"
                  >
                    View Patient Profile
                  </Link>
                </>
              ) : (
                'Loading patient information...'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Baseline Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Baseline Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {baselineLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          ) : baseline ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Baseline Date</p>
                <p className="font-medium">{formatDate(baseline.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Baseline ID</p>
                <p className="font-medium text-xs">{baseline.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Associated Tumors</p>
                <p className="font-medium">{tumors?.length || 0} tumor(s)</p>
              </div>
              
              {/* Dynamic baseline fields */}
              {Object.entries(baseline).map(([key, value]) => {
                if (key === 'id' || key === 'patient_id' || key === 'created_at' || !value) return null
                return (
                  <div key={key}>
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="font-medium">{value}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No baseline information available</p>
          )}
        </CardContent>
      </Card>

      {/* Tumors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tumors
            <Badge variant="secondary">{tumors?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tumorsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(6)].map((_, j) => (
                        <div key={j}>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tumors && tumors.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tumor Info</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Pathology</TableHead>
                      <TableHead>Clinical Notes</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tumors.map((tumor, index) => (
                      <TableRow key={tumor.id || index}>
                        <TableCell className="font-medium">
                          <div className="space-y-2">
                            <div>
                              Tumor {index + 1}
                              {tumor.tumor_type && (
                                <div className="text-sm text-muted-foreground">
                                  Type: {tumor.tumor_type}
                                </div>
                              )}
                            </div>
                            {/* Cancer staging badge */}
                            {tumor.tnm_t && tumor.tnm_n && tumor.tnm_m && (
                              <CancerStageBadge 
                                tnm_t={tumor.tnm_t} 
                                tnm_n={tumor.tnm_n} 
                                tnm_m={tumor.tnm_m} 
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tumor.location || tumor.anatomical_site || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {tumor.size || tumor.dimensions || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {tumor.histology && (
                              <div className="text-sm">
                                <span className="font-medium">Histology:</span> {tumor.histology}
                              </div>
                            )}
                            {tumor.grade && (
                              <div className="text-sm">
                                <span className="font-medium">Grade:</span> {tumor.grade}
                              </div>
                            )}
                            {tumor.stage && (
                              <div className="text-sm">
                                <span className="font-medium">Stage:</span> {tumor.stage}
                              </div>
                            )}
                            {/* TNM Classification */}
                            {(tumor.tnm_t || tumor.tnm_n || tumor.tnm_m) && (
                              <div className="text-sm">
                                <span className="font-medium">TNM:</span> 
                                {tumor.tnm_t && ` T${tumor.tnm_t}`}
                                {tumor.tnm_n && ` N${tumor.tnm_n}`}
                                {tumor.tnm_m && ` M${tumor.tnm_m}`}
                              </div>
                            )}
                            {!tumor.histology && !tumor.grade && !tumor.stage && !tumor.tnm_t && !tumor.tnm_n && !tumor.tnm_m && 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tumor.clinical_notes || tumor.notes || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {formatDate(tumor.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {tumors.map((tumor, index) => (
                  <Card key={tumor.id || index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                        <span>Tumor {index + 1}</span>
                        {tumor.tumor_type && (
                          <Badge variant="outline">
                            {tumor.tumor_type}
                          </Badge>
                        )}
                        {/* Cancer staging badge for mobile */}
                        {tumor.tnm_t && tumor.tnm_n && tumor.tnm_m && (
                          <CancerStageBadge 
                            tnm_t={tumor.tnm_t} 
                            tnm_n={tumor.tnm_n} 
                            tnm_m={tumor.tnm_m} 
                          />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Dynamic tumor fields */}
                        {Object.entries(tumor).map(([key, value]) => {
                          if (key === 'id' || key === 'baseline_id' || key === 'created_at' || !value) return null
                          return (
                            <div key={key} className="flex justify-between">
                              <span className="text-sm font-medium capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-sm text-right">{value}</span>
                            </div>
                          )
                        })}
                        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                          <span>Recorded:</span>
                          <span>{formatDate(tumor.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tumors found</h3>
              <p className="text-gray-500">
                This baseline doesn't have any tumor records yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 