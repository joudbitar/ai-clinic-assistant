import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/useToast.jsx'
import { EMRPatientHeader } from '@/components/EMRPatientHeader'
import { 
  DemographicsSection, 
  HistorySection, 
  MedicationsSection, 
  BaselinesSection, 
  ConsultationRecordsSection 
} from '@/components/EMRClinicalSections'

export default function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  // API Base URL
  const API_BASE_URL = "http://localhost:8000"

  // Fetch patient data
  const { data: patient, isLoading: patientLoading, error: patientError } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch patient: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })
  
  const { data: histories, isLoading: historiesLoading } = useQuery({
    queryKey: ['patient-histories', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/histories`)
      if (!response.ok) {
        throw new Error(`Failed to fetch histories: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })
  
  const { data: chemotherapy, isLoading: chemoLoading } = useQuery({
    queryKey: ['patient-chemotherapy', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/previous-chemotherapy`)
      if (!response.ok) {
        throw new Error(`Failed to fetch chemotherapy: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })
  
  const { data: radiotherapy, isLoading: radioLoading } = useQuery({
    queryKey: ['patient-radiotherapy', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/previous-radiotherapy`)
      if (!response.ok) {
        throw new Error(`Failed to fetch radiotherapy: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })
  
  const { data: surgeries, isLoading: surgeriesLoading } = useQuery({
    queryKey: ['patient-surgeries', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/previous-surgeries`)
      if (!response.ok) {
        throw new Error(`Failed to fetch surgeries: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })
  
  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ['patient-medications', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/concomitant-medications`)
      if (!response.ok) {
        throw new Error(`Failed to fetch medications: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })
  
  const { data: baselines, isLoading: baselinesLoading } = useQuery({
    queryKey: ['patient-baselines', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/baselines`)
      if (!response.ok) {
        throw new Error(`Failed to fetch baselines: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })
  
  const { data: recordings, isLoading: recordingsLoading } = useQuery({
    queryKey: ['patient-recordings', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/recordings`)
      if (!response.ok) {
        throw new Error(`Failed to fetch recordings: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!patientId
  })

  // Mutations with generic handlers
  const createMutation = useMutation({
    mutationFn: async ({ endpoint, data }) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create item')
      }
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.queryKey, patientId] })
      toast.success('Item created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create item: ' + error.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, data }) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update item')
      }
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.queryKey, patientId] })
      toast.success('Item updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint }) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.queryKey, patientId] })
      toast.success('Item deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + error.message)
    }
  })



  // Handle table operations
  const handleCreateHistory = async (historyData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/histories`, 
      data: historyData,
      queryKey: 'patient-histories'
    })
  }

  const handleUpdateHistory = async (updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/histories/${updatedData.id}`,
      data: updatedData,
      queryKey: 'patient-histories'
    })
  }

  const handleDeleteHistory = async (historyId) => {
    await deleteMutation.mutateAsync({ 
      endpoint: `/histories/${historyId}`,
      queryKey: 'patient-histories'
    })
  }

  const handleCreateChemotherapy = async (chemoData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/previous-chemotherapy`, 
      data: chemoData,
      queryKey: 'patient-chemotherapy'
    })
  }

  const handleUpdateChemotherapy = async (updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/chemotherapy/${updatedData.id}`,
      data: updatedData,
      queryKey: 'patient-chemotherapy'
    })
  }

  const handleDeleteChemotherapy = async (chemoId) => {
    await deleteMutation.mutateAsync({ 
      endpoint: `/chemotherapy/${chemoId}`,
      queryKey: 'patient-chemotherapy'
    })
  }

  const handleCreateRadiotherapy = async (radioData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/previous-radiotherapy`, 
      data: radioData,
      queryKey: 'patient-radiotherapy'
    })
  }

  const handleUpdateRadiotherapy = async (updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/radiotherapy/${updatedData.id}`,
      data: updatedData,
      queryKey: 'patient-radiotherapy'
    })
  }

  const handleDeleteRadiotherapy = async (radioId) => {
    await deleteMutation.mutateAsync({ 
      endpoint: `/radiotherapy/${radioId}`,
      queryKey: 'patient-radiotherapy'
    })
  }

  const handleCreateSurgery = async (surgeryData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/previous-surgeries`, 
      data: surgeryData,
      queryKey: 'patient-surgeries'
    })
  }

  const handleUpdateSurgery = async (updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/surgeries/${updatedData.id}`,
      data: updatedData,
      queryKey: 'patient-surgeries'
    })
  }

  const handleDeleteSurgery = async (surgeryId) => {
    await deleteMutation.mutateAsync({ 
      endpoint: `/surgeries/${surgeryId}`,
      queryKey: 'patient-surgeries'
    })
  }

  const handleCreateMedication = async (medicationData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/concomitant-medications`, 
      data: medicationData,
      queryKey: 'patient-medications'
    })
  }

  const handleUpdateMedication = async (updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/medications/${updatedData.id}`,
      data: updatedData,
      queryKey: 'patient-medications'
    })
  }

  const handleDeleteMedication = async (medicationId) => {
    await deleteMutation.mutateAsync({ 
      endpoint: `/medications/${medicationId}`,
      queryKey: 'patient-medications'
    })
  }

  const handleCreateBaseline = async (baselineData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/baselines`, 
      data: baselineData,
      queryKey: 'patient-baselines'
    })
  }

  const handleUpdateBaseline = async (updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/baselines/${updatedData.id}`,
      data: updatedData,
      queryKey: 'patient-baselines'
    })
  }

  const handleDeleteBaseline = async (baselineId) => {
    await deleteMutation.mutateAsync({ 
      endpoint: `/baselines/${baselineId}`,
      queryKey: 'patient-baselines'
    })
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
    <div className="w-full px-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 py-2 bg-white border-b">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patients')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
          <h1 className="text-xl font-semibold">Patient Details</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/record?patientId=${patientId}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Record Consultation
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </div>

      {/* EMR Patient Header */}
      <div className="px-4 mb-4">
        <EMRPatientHeader 
          patient={patient}
          baselines={baselines}
          histories={histories}
          followups={[]} // Add followups when available
          isLoading={patientLoading}
        />
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs defaultValue="demographics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="demographics" className="text-sm">Demographics</TabsTrigger>
            <TabsTrigger value="history" className="text-sm">History</TabsTrigger>
            <TabsTrigger value="medications" className="text-sm">Medications</TabsTrigger>
            <TabsTrigger value="baselines" className="text-sm">Baselines</TabsTrigger>
            <TabsTrigger value="recordings" className="text-sm">Recordings</TabsTrigger>
          </TabsList>

          {/* Demographics Tab */}
          <TabsContent value="demographics">
            <DemographicsSection
              patient={patient}
              patientId={patientId}
              isLoading={patientLoading}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <HistorySection
              histories={histories}
              chemotherapy={chemotherapy}
              radiotherapy={radiotherapy}
              surgeries={surgeries}
              otherTreatments={[]}
              baselines={baselines}
              followups={[]}
              historyHandlers={{
                onCreate: handleCreateHistory,
                onUpdate: handleUpdateHistory,
                onDelete: handleDeleteHistory
              }}
              treatmentHandlers={{
                onCreateChemotherapy: handleCreateChemotherapy,
                onUpdateChemotherapy: handleUpdateChemotherapy,
                onDeleteChemotherapy: handleDeleteChemotherapy,
                onCreateRadiotherapy: handleCreateRadiotherapy,
                onUpdateRadiotherapy: handleUpdateRadiotherapy,
                onDeleteRadiotherapy: handleDeleteRadiotherapy,
                onCreateSurgery: handleCreateSurgery,
                onUpdateSurgery: handleUpdateSurgery,
                onDeleteSurgery: handleDeleteSurgery
              }}
              isLoading={historiesLoading || chemoLoading || radioLoading || surgeriesLoading}
            />
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <MedicationsSection
              medications={medications}
              medicationHandlers={{
                onCreate: handleCreateMedication,
                onUpdate: handleUpdateMedication,
                onDelete: handleDeleteMedication
              }}
              isLoading={medicationsLoading}
            />
          </TabsContent>

          {/* Baselines Tab */}
          <TabsContent value="baselines">
            <BaselinesSection
              baselines={baselines}
              baselineHandlers={{
                onCreate: handleCreateBaseline,
                onUpdate: handleUpdateBaseline,
                onDelete: handleDeleteBaseline
              }}
              isLoading={baselinesLoading}
            />
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings">
            <ConsultationRecordsSection
              recordings={recordings}
              recordingHandlers={{
                onNavigateToRecord: () => navigate(`/record?patientId=${patientId}`),
                onNavigateToDetail: (recordingId) => navigate(`/recordings/${recordingId}`)
              }}
              isLoading={recordingsLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}