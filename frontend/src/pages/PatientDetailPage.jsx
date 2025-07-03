import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, User, Calendar, Phone, FileText, History, 
  Zap, Scissors, Pill, Target, MapPin, Briefcase, Heart, 
  Users, Mail, IdCard, Cake, Globe, Activity, FlaskConical,
  Dna, Scan, ClipboardList, Eye, ShieldAlert, Mic
} from 'lucide-react'
import { 
  usePatient, 
  usePatientHistories,
  usePatientPreviousChemotherapy,
  usePatientPreviousRadiotherapy,
  usePatientPreviousSurgeries,
  usePatientConcomitantMedications,
  usePatientBaselines,
  usePatientFollowups,
  usePatientLabResults,
  usePatientMolecularTests,
  usePatientImagingStudies,
  useAuditLogs,
  usePatientRecordings
} from '@/hooks/usePatients'
import {
  useUpdatePatient,
  useCreatePatientHistory,
  useUpdatePatientHistory,
  useDeletePatientHistory,
  useCreateChemotherapy,
  useUpdateChemotherapy,
  useDeleteChemotherapy,
  useCreateRadiotherapy,
  useUpdateRadiotherapy,
  useDeleteRadiotherapy,
  useCreateSurgery,
  useUpdateSurgery,
  useDeleteSurgery,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
  useCreateBaseline,
  useUpdateBaseline,
  useDeleteBaseline,
  useCreateFollowup,
  useUpdateFollowup,
  useDeleteFollowup,
  useCreateLabResult,
  useUpdateLabResult,
  useDeleteLabResult,
  useCreateMolecularTest,
  useUpdateMolecularTest,
  useDeleteMolecularTest,
  useCreateImagingStudy,
  useUpdateImagingStudy,
  useDeleteImagingStudy
} from '@/hooks/useMutations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EditableField } from '@/components/EditableField'
import { EditableTable } from '@/components/AddNewRowForm'
import { ClinicalEditableTable } from '@/components/ClinicalEditableTable'
import { 
  patientFields, 
  historyFields, 
  chemotherapyFields, 
  radiotherapyFields, 
  surgeryFields, 
  medicationFields,
  baselineFields,
  followupFields,
  labResultFields,
  molecularTestFields,
  imagingStudyFields,
  formatDate,
  formatPhone
} from '@/config/fieldConfigs'

export default function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  
  // Fetch patient data
  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId)
  const { data: histories, isLoading: historiesLoading } = usePatientHistories(patientId)
  const { data: chemotherapy, isLoading: chemoLoading } = usePatientPreviousChemotherapy(patientId)
  const { data: radiotherapy, isLoading: radioLoading } = usePatientPreviousRadiotherapy(patientId)
  const { data: surgeries, isLoading: surgeriesLoading } = usePatientPreviousSurgeries(patientId)
  const { data: medications, isLoading: medicationsLoading } = usePatientConcomitantMedications(patientId)
  const { data: baselines, isLoading: baselinesLoading } = usePatientBaselines(patientId)
  const { data: followups, isLoading: followupsLoading } = usePatientFollowups(patientId)
  const { data: labResults, isLoading: labResultsLoading } = usePatientLabResults(patientId)
  const { data: molecularTests, isLoading: molecularTestsLoading } = usePatientMolecularTests(patientId)
  const { data: imagingStudies, isLoading: imagingStudiesLoading } = usePatientImagingStudies(patientId)
  const { data: auditLogs, isLoading: auditLogsLoading } = useAuditLogs(patientId)
  const { data: recordings, isLoading: recordingsLoading } = usePatientRecordings(patientId)

  // Mutations
  const createHistoryMutation = useCreatePatientHistory()
  const updateHistoryMutation = useUpdatePatientHistory()
  const deleteHistoryMutation = useDeletePatientHistory()
  const createChemoMutation = useCreateChemotherapy()
  const updateChemoMutation = useUpdateChemotherapy()
  const deleteChemoMutation = useDeleteChemotherapy()
  const createRadioMutation = useCreateRadiotherapy()
  const updateRadioMutation = useUpdateRadiotherapy()
  const deleteRadioMutation = useDeleteRadiotherapy()
  const createSurgeryMutation = useCreateSurgery()
  const updateSurgeryMutation = useUpdateSurgery()
  const deleteSurgeryMutation = useDeleteSurgery()
  const createMedicationMutation = useCreateMedication()
  const updateMedicationMutation = useUpdateMedication()
  const deleteMedicationMutation = useDeleteMedication()
  const createBaselineMutation = useCreateBaseline()
  const updateBaselineMutation = useUpdateBaseline()
  const deleteBaselineMutation = useDeleteBaseline()
  const createFollowupMutation = useCreateFollowup()
  const updateFollowupMutation = useUpdateFollowup()
  const deleteFollowupMutation = useDeleteFollowup()
  const createLabResultMutation = useCreateLabResult()
  const updateLabResultMutation = useUpdateLabResult()
  const deleteLabResultMutation = useDeleteLabResult()
  const createMolecularTestMutation = useCreateMolecularTest()
  const updateMolecularTestMutation = useUpdateMolecularTest()
  const deleteMolecularTestMutation = useDeleteMolecularTest()
  const createImagingStudyMutation = useCreateImagingStudy()
  const updateImagingStudyMutation = useUpdateImagingStudy()
  const deleteImagingStudyMutation = useDeleteImagingStudy()

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? null : 'Please enter a valid email address'
  }

  const validatePhone = (phone) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 ? null : 'Please enter a valid phone number'
  }

  const validateRequired = (value) => {
    return value && value.trim() ? null : 'This field is required'
  }

  // Handle table operations
  const handleCreateHistory = async (historyData) => {
    await createHistoryMutation.mutateAsync({ patientId, historyData })
  }

  const handleUpdateHistory = async (updatedData) => {
    await updateHistoryMutation.mutateAsync({ 
      historyId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteHistory = async (historyId) => {
    await deleteHistoryMutation.mutateAsync({ historyId, patientId })
  }

  const handleCreateChemotherapy = async (chemoData) => {
    await createChemoMutation.mutateAsync({ patientId, chemoData })
  }

  const handleUpdateChemotherapy = async (updatedData) => {
    await updateChemoMutation.mutateAsync({ 
      chemoId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteChemotherapy = async (chemoId) => {
    await deleteChemoMutation.mutateAsync({ chemoId, patientId })
  }

  const handleCreateRadiotherapy = async (radioData) => {
    await createRadioMutation.mutateAsync({ patientId, radioData })
  }

  const handleUpdateRadiotherapy = async (updatedData) => {
    await updateRadioMutation.mutateAsync({ 
      radioId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteRadiotherapy = async (radioId) => {
    await deleteRadioMutation.mutateAsync({ radioId, patientId })
  }

  const handleCreateSurgery = async (surgeryData) => {
    await createSurgeryMutation.mutateAsync({ patientId, surgeryData })
  }

  const handleUpdateSurgery = async (updatedData) => {
    await updateSurgeryMutation.mutateAsync({ 
      surgeryId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteSurgery = async (surgeryId) => {
    await deleteSurgeryMutation.mutateAsync({ surgeryId, patientId })
  }

  const handleCreateMedication = async (medicationData) => {
    await createMedicationMutation.mutateAsync({ patientId, medicationData })
  }

  const handleUpdateMedication = async (updatedData) => {
    await updateMedicationMutation.mutateAsync({ 
      medicationId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteMedication = async (medicationId) => {
    await deleteMedicationMutation.mutateAsync({ medicationId, patientId })
  }

  const handleCreateBaseline = async (baselineData) => {
    await createBaselineMutation.mutateAsync({ patientId, baselineData })
  }

  const handleUpdateBaseline = async (updatedData) => {
    await updateBaselineMutation.mutateAsync({ 
      baselineId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteBaseline = async (baselineId) => {
    await deleteBaselineMutation.mutateAsync({ baselineId, patientId })
  }

  const handleCreateFollowup = async (followupData) => {
    await createFollowupMutation.mutateAsync({ patientId, followupData })
  }

  const handleUpdateFollowup = async (updatedData) => {
    await updateFollowupMutation.mutateAsync({ 
      followupId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteFollowup = async (followupId) => {
    await deleteFollowupMutation.mutateAsync({ followupId, patientId })
  }

  const handleCreateLabResult = async (labData) => {
    await createLabResultMutation.mutateAsync({ patientId, labData })
  }

  const handleUpdateLabResult = async (updatedData) => {
    await updateLabResultMutation.mutateAsync({ 
      labId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteLabResult = async (labId) => {
    await deleteLabResultMutation.mutateAsync({ labId, patientId })
  }

  const handleCreateMolecularTest = async (testData) => {
    await createMolecularTestMutation.mutateAsync({ patientId, testData })
  }

  const handleUpdateMolecularTest = async (updatedData) => {
    await updateMolecularTestMutation.mutateAsync({ 
      testId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteMolecularTest = async (testId) => {
    await deleteMolecularTestMutation.mutateAsync({ testId, patientId })
  }

  const handleCreateImagingStudy = async (imagingData) => {
    await createImagingStudyMutation.mutateAsync({ patientId, imagingData })
  }

  const handleUpdateImagingStudy = async (updatedData) => {
    await updateImagingStudyMutation.mutateAsync({ 
      imagingId: updatedData.id, 
      field: 'all', 
      value: updatedData 
    })
  }

  const handleDeleteImagingStudy = async (imagingId) => {
    await deleteImagingStudyMutation.mutateAsync({ imagingId, patientId })
  }

  if (patientError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load patient data: {patientError.message}
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
          onClick={() => navigate('/patients')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {patientLoading ? <Skeleton className="h-9 w-48" /> : 
                `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() || 'N/A'
              }
            </h1>
            <p className="text-muted-foreground mt-1">
              {patientLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                `Age ${calculateAge(patient?.date_of_birth)} • Patient since ${formatDate(patient?.created_at)}`
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to={`/record?patientId=${patientId}`}>
              <Button variant="default" size="sm">
                <Mic className="h-4 w-4 mr-2" />
                Record Consultation
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Audit Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Audit Log</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {auditLogsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log, index) => (
                      <div key={log.id || index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No audit logs available</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <div className="text-sm text-muted-foreground">
              Click any field to edit
            </div>
          </div>
        </div>
      </div>

      {/* Patient Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patientLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{formatDate(patient?.date_of_birth)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{formatPhone(patient?.phone_1 || patient?.phone)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium text-xs">{patient?.id}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="demographics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="baselines">Baselines</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="tests">Tests & Imaging</TabsTrigger>
          <TabsTrigger value="recordings">Records</TabsTrigger>
        </TabsList>

        {/* Demographics Tab */}
        <TabsContent value="demographics">
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientLoading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {patientFields.demographics.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
                          <EditableField
                            value={patient?.[field.key]}
                            patientId={patientId}
                            field={field.key}
                            type={field.type}
                            options={field.options}
                            badge={field.type === 'select'}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            validate={field.required ? validateRequired : null}
                            formatDisplay={field.key === 'date_of_birth' ? formatDate : null}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientLoading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {patientFields.contact.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
                          <EditableField
                            value={patient?.[field.key]}
                            patientId={patientId}
                            field={field.key}
                            type={field.type}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            validate={field.type === 'email' ? validateEmail : field.type === 'tel' ? validatePhone : null}
                            formatDisplay={field.type === 'tel' ? formatPhone : null}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Background Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Background Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientLoading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {patientFields.background.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
                          <EditableField
                            value={patient?.[field.key]}
                            patientId={patientId}
                            field={field.key}
                            type={field.type}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientLoading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {patientFields.medical.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
                          <EditableField
                            value={patient?.[field.key]}
                            patientId={patientId}
                            field={field.key}
                            type={field.type}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            validate={field.type === 'tel' ? validatePhone : null}
                            formatDisplay={field.type === 'tel' ? formatPhone : null}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Patient History & Risk Factors
                {histories?.length > 0 && (
                  <Badge variant="secondary">{histories.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historiesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <ClinicalEditableTable
                  data={histories}
                  fields={historyFields}
                  onUpdate={handleUpdateHistory}
                  onDelete={handleDeleteHistory}
                  onCreate={handleCreateHistory}
                  title="History"
                  emptyMessage="No patient history recorded yet."
                  dataType="history"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments">
          <div className="space-y-6">
            {/* Previous Chemotherapy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Previous Chemotherapy
                  <Badge variant="secondary">{chemotherapy?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chemoLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <EditableTable
                    data={chemotherapy}
                    fields={chemotherapyFields}
                    onUpdate={handleUpdateChemotherapy}
                    onDelete={handleDeleteChemotherapy}
                    onCreate={handleCreateChemotherapy}
                    title="Chemotherapy"
                    emptyMessage="No previous chemotherapy recorded."
                  />
                )}
              </CardContent>
            </Card>

            {/* Previous Radiotherapy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Previous Radiotherapy
                  <Badge variant="secondary">{radiotherapy?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {radioLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <EditableTable
                    data={radiotherapy}
                    fields={radiotherapyFields}
                    onUpdate={handleUpdateRadiotherapy}
                    onDelete={handleDeleteRadiotherapy}
                    onCreate={handleCreateRadiotherapy}
                    title="Radiotherapy"
                    emptyMessage="No previous radiotherapy recorded."
                  />
                )}
              </CardContent>
            </Card>

            {/* Previous Surgeries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Previous Surgeries
                  <Badge variant="secondary">{surgeries?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {surgeriesLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <EditableTable
                    data={surgeries}
                    fields={surgeryFields}
                    onUpdate={handleUpdateSurgery}
                    onDelete={handleDeleteSurgery}
                    onCreate={handleCreateSurgery}
                    title="Surgery"
                    emptyMessage="No previous surgeries recorded."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Concomitant Medications
                <Badge variant="secondary">{medications?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <EditableTable
                  data={medications}
                  fields={medicationFields}
                  onUpdate={handleUpdateMedication}
                  onDelete={handleDeleteMedication}
                  onCreate={handleCreateMedication}
                  title="Medication"
                  emptyMessage="No concomitant medications recorded."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Baselines Tab */}
        <TabsContent value="baselines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Patient Baselines
                <Badge variant="secondary">{baselines?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {baselinesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <ClinicalEditableTable
                  data={baselines}
                  fields={baselineFields}
                  onUpdate={handleUpdateBaseline}
                  onDelete={handleDeleteBaseline}
                  onCreate={handleCreateBaseline}
                  title="Baseline"
                  emptyMessage="No baselines recorded."
                  dataType="baseline"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="followups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Follow-up Visits
                <Badge variant="secondary">{followups?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followupsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <ClinicalEditableTable
                  data={followups}
                  fields={followupFields}
                  onUpdate={handleUpdateFollowup}
                  onDelete={handleDeleteFollowup}
                  onCreate={handleCreateFollowup}
                  title="Follow-up"
                  emptyMessage="No follow-up visits recorded."
                  dataType="followup"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests & Imaging Tab */}
        <TabsContent value="tests">
          <div className="space-y-6">
            {/* Lab Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Laboratory Results
                  <Badge variant="secondary">{labResults?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {labResultsLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <EditableTable
                    data={labResults}
                    fields={labResultFields}
                    onUpdate={handleUpdateLabResult}
                    onDelete={handleDeleteLabResult}
                    onCreate={handleCreateLabResult}
                    title="Lab Result"
                    emptyMessage="No lab results recorded."
                  />
                )}
              </CardContent>
            </Card>

            {/* Molecular Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="h-5 w-5" />
                  Molecular Tests
                  <Badge variant="secondary">{molecularTests?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {molecularTestsLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <EditableTable
                    data={molecularTests}
                    fields={molecularTestFields}
                    onUpdate={handleUpdateMolecularTest}
                    onDelete={handleDeleteMolecularTest}
                    onCreate={handleCreateMolecularTest}
                    title="Molecular Test"
                    emptyMessage="No molecular tests recorded."
                  />
                )}
              </CardContent>
            </Card>

            {/* Imaging Studies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Imaging Studies
                  <Badge variant="secondary">{imagingStudies?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagingStudiesLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <EditableTable
                    data={imagingStudies}
                    fields={imagingStudyFields}
                    onUpdate={handleUpdateImagingStudy}
                    onDelete={handleDeleteImagingStudy}
                    onCreate={handleCreateImagingStudy}
                    title="Imaging Study"
                    emptyMessage="No imaging studies recorded."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recordings Tab */}
        <TabsContent value="recordings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audio Recordings & Transcripts
                <Badge variant="secondary">{recordings?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recordingsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : recordings && recordings.length > 0 ? (
                <div className="space-y-4">
                  {recordings.map((recording) => (
                    <div key={recording.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{recording.filename || 'Audio Recording'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(recording.created_at)}
                          </span>
                          <Link
                            to={`/recordings/${recording.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                      
                      {/* AI Summary Section */}
                      {recording.summary && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              AI Summary
                            </Badge>
                          </div>
                          <div className="text-sm text-blue-900 whitespace-pre-wrap">
                            {recording.summary}
                          </div>
                        </div>
                      )}
                      
                      {/* Transcript Section */}
                      {recording.transcript && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600 font-medium">Full Transcript</span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {recording.transcript.length > 200 
                              ? `${recording.transcript.substring(0, 200)}...` 
                              : recording.transcript
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mic className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
                  <p className="text-gray-500 mb-4">
                    Audio recordings and their transcripts will appear here.
                  </p>
                  <Link
                    to={`/record?patientId=${patientId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Mic className="h-4 w-4" />
                    Record Consultation
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 