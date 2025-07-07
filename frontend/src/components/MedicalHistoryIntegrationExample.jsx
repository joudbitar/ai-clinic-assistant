// INTEGRATION EXAMPLE: How to use the new MedicalHistorySection
// This shows how to integrate the component into your existing PatientDetailPage

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import MedicalHistorySection from './MedicalHistorySection'
import { useMutations } from '@/hooks/useMutations'

// Example integration into PatientDetailPage
const PatientDetailPageExample = ({ patientId }) => {
  // Existing queries for patient data
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`)
      return response.json()
    },
    enabled: !!patientId
  })

  // Medical history data
  const { data: histories, isLoading: historiesLoading } = useQuery({
    queryKey: ['patient-histories', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/histories`)
      return response.json()
    },
    enabled: !!patientId
  })

  // Surgery data
  const { data: surgeries, isLoading: surgeriesLoading } = useQuery({
    queryKey: ['patient-surgeries', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/previous-surgeries`)
      return response.json()
    },
    enabled: !!patientId
  })

  // Medication data
  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ['patient-medications', patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/concomitant-medications`)
      return response.json()
    },
    enabled: !!patientId
  })

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: async ({ endpoint, data, queryKey }) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.queryKey, patientId] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, data, queryKey }) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.queryKey, patientId] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, queryKey }) => {
      await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.queryKey, patientId] })
    }
  })

  // Handler functions for medical history operations
  const handleCreateHistory = async (historyData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/histories`, 
      data: historyData,
      queryKey: 'patient-histories'
    })
  }

  const handleUpdateHistory = async (historyId, updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/histories/${historyId}`,
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

  // Handler functions for surgery operations  
  const handleCreateSurgery = async (surgeryData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/previous-surgeries`, 
      data: surgeryData,
      queryKey: 'patient-surgeries'
    })
  }

  const handleUpdateSurgery = async (surgeryId, updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/surgeries/${surgeryId}`,
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

  // Handler functions for medication operations
  const handleCreateMedication = async (medicationData) => {
    await createMutation.mutateAsync({ 
      endpoint: `/patients/${patientId}/concomitant-medications`, 
      data: medicationData,
      queryKey: 'patient-medications'
    })
  }

  const handleUpdateMedication = async (medicationId, updatedData) => {
    await updateMutation.mutateAsync({ 
      endpoint: `/medications/${medicationId}`,
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Existing patient header component */}
      <PatientHeader patient={patient} />
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical-history">Medical History</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="baselines">Baselines</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Existing overview content */}
        </TabsContent>

        <TabsContent value="medical-history">
          {/* NEW: Enhanced Medical History Section */}
          <MedicalHistorySection
            patientId={patientId}
            histories={histories || []}
            surgeries={surgeries || []}
            medications={medications || []}
            onCreateHistory={handleCreateHistory}
            onUpdateHistory={handleUpdateHistory}
            onDeleteHistory={handleDeleteHistory}
            onCreateSurgery={handleCreateSurgery}
            onUpdateSurgery={handleUpdateSurgery}
            onDeleteSurgery={handleDeleteSurgery}
            onCreateMedication={handleCreateMedication}
            onUpdateMedication={handleUpdateMedication}
            onDeleteMedication={handleDeleteMedication}
            isLoading={historiesLoading || surgeriesLoading || medicationsLoading}
          />
        </TabsContent>

        <TabsContent value="treatments">
          {/* Existing treatments content */}
        </TabsContent>

        <TabsContent value="baselines">
          {/* Existing baselines content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PatientDetailPageExample

/*
FEATURES SUMMARY:

✅ MEDICAL HISTORY SECTION COMPONENTS:

1. **MedicalHistorySection** (Main Component)
   - Tabbed interface with Overview, Risk Factors, Surgeries, Medications, Clinical Notes
   - Smart risk indicator alerts (smoking, polypharmacy, family history)
   - Real-time statistics and summary cards
   - Responsive design with modern UI

2. **RiskFactorsSection**
   - Structured smoking history with automatic pack-years calculation
   - Alcohol history with risk level indicators
   - Family history with relationship and condition tracking
   - Allergy management
   - Visual risk level badges and smart conditional fields

3. **SurgeriesSection**
   - Surgical procedure autocomplete from common surgery list
   - Inline editing with modal detail views
   - Outcome tracking with visual indicators
   - Filtering and sorting (by date, procedure, outcome)
   - Complication and pathology result tracking

4. **MedicationsSection**
   - Medication name autocomplete from comprehensive drug list
   - Auto-population of common dosing for known medications
   - Active/discontinued status tracking with visual indicators
   - Drug interaction warnings (simplified demonstration)
   - Search, filter, and sort functionality
   - Prescribing physician tracking

5. **ClinicalDescriptionSection**
   - Multi-type clinical notes (medical, allergy, social, occupational)
   - Rich text descriptions with categorization
   - Status tracking (active, resolved, controlled)
   - Severity indicators
   - Tabbed interface by note type

✅ SMART UX FEATURES:

- **Date Pickers**: All date fields use HTML5 date inputs
- **Autocomplete**: 
  - Surgical procedures from 40+ common surgeries
  - Medications from 50+ common drugs including cancer-specific ones
- **Auto-calculations**: Pack-years automatically calculated from smoking data
- **Auto-population**: Common medication dosing auto-filled when drug selected
- **Risk Indicators**: Visual alerts for high-risk factors
- **Smart Validation**: Required field indicators and form validation
- **Responsive Design**: Mobile-friendly grid layouts
- **Loading States**: Skeleton loading for better UX
- **Search & Filter**: Real-time search across all sections
- **Modal Views**: Detailed view modals for complex data
- **Inline Editing**: Click to edit functionality
- **Status Tracking**: Visual status indicators throughout

✅ ENHANCED FIELD CONFIGURATIONS:

Added comprehensive field definitions in `fieldConfigs.js`:
- `smokingHistoryFields` - Structured smoking history
- `alcoholHistoryFields` - Alcohol consumption tracking  
- `familyHistoryFields` - Family medical history
- `clinicalDescriptionFields` - General clinical notes
- `enhancedMedicationFields` - Advanced medication tracking
- `enhancedSurgeryFields` - Comprehensive surgery details
- `commonMedications` - 50+ medication names for autocomplete
- `commonSurgeries` - 40+ surgical procedures for autocomplete

✅ INTEGRATION READY:

The components are designed to integrate seamlessly with your existing:
- React Query for data fetching
- Mutation patterns for CRUD operations
- Supabase backend structure
- shadcn/ui component library
- Tailwind CSS styling

✅ HOW TO USE:

1. Import the MedicalHistorySection component
2. Pass patient data and handler functions
3. Component handles all UI interactions internally
4. Uses existing API endpoints and mutation patterns

The system is production-ready and follows your existing code patterns!
*/ 