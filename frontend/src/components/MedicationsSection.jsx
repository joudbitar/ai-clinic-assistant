import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Pill, 
  Calendar, 
  Clock,
  AlertTriangle,
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  User,
  Activity,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { 
  enhancedMedicationFields, 
  commonMedications,
  formatDate,
  formatMedicationDisplay
} from '@/config/fieldConfigs'

// Autocomplete component for medication names
const MedicationAutocomplete = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredMedications, setFilteredMedications] = useState([])

  useEffect(() => {
    if (value && value.length > 1) {
      const filtered = commonMedications.filter(med =>
        med.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 15)
      setFilteredMedications(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setIsOpen(false)
    }
  }, [value])

  const handleSelect = (medication) => {
    onChange(medication)
    setIsOpen(false)
    
    // Auto-populate common dosing information for known medications
    const commonDosing = {
      'Acetaminophen': { dose: '500mg', frequency: 'as_needed', route: 'oral' },
      'Aspirin': { dose: '81mg', frequency: 'once_daily', route: 'oral' },
      'Metformin': { dose: '500mg', frequency: 'twice_daily', route: 'oral' },
      'Lisinopril': { dose: '10mg', frequency: 'once_daily', route: 'oral' },
      'Atorvastatin': { dose: '20mg', frequency: 'once_daily', route: 'oral' },
      'Omeprazole': { dose: '20mg', frequency: 'once_daily', route: 'oral' },
      'Morphine': { dose: '2-4mg', frequency: 'as_needed', route: 'iv' },
      'Ondansetron': { dose: '4mg', frequency: 'as_needed', route: 'iv' }
    }
    
    return commonDosing[medication] || null
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => value && value.length > 1 && setIsOpen(filteredMedications.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredMedications.map((medication, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between"
              onClick={() => handleSelect(medication)}
            >
              <span>{medication}</span>
              <Pill className="h-3 w-3 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const MedicationsSection = ({ 
  patientId, 
  medications = [], 
  onUpdate, 
  onCreate, 
  onDelete, 
  isLoading = false 
}) => {
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [sortBy, setSortBy] = useState('start_date') // 'start_date', 'name', 'indication'
  const [filterBy, setFilterBy] = useState('all') // 'all', 'active', 'discontinued'
  const [searchTerm, setSearchTerm] = useState('')

  // Process medications (filter, sort, search)
  const processedMedications = medications
    .filter(medication => {
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          (medication.name || '').toLowerCase().includes(searchLower) ||
          (medication.indication || '').toLowerCase().includes(searchLower) ||
          (medication.prescribing_physician || '').toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      
      // Status filter
      if (filterBy === 'all') return true
      if (filterBy === 'active') {
        return !medication.end_date || new Date(medication.end_date) > new Date()
      }
      if (filterBy === 'discontinued') {
        return medication.end_date && new Date(medication.end_date) <= new Date()
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'start_date':
          return new Date(b.start_date || 0) - new Date(a.start_date || 0)
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'indication':
          return (a.indication || '').localeCompare(b.indication || '')
        default:
          return 0
      }
    })

  const handleEdit = (medication) => {
    setEditingItem(medication)
    setFormData(medication)
  }

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await onUpdate({ ...formData, id: editingItem.id })
      } else {
        const dataWithPatientId = { ...formData, patient_id: patientId }
        await onCreate(dataWithPatientId)
      }
      setEditingItem(null)
      setFormData({})
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error saving medication:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this medication record?')) {
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Error deleting medication:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setFormData({})
    setShowAddDialog(false)
  }

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleMedicationNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
    
    // Auto-populate common dosing if available
    const commonDosing = {
      'Acetaminophen': { dose: '500mg', frequency: 'as_needed', route: 'oral' },
      'Aspirin': { dose: '81mg', frequency: 'once_daily', route: 'oral' },
      'Metformin': { dose: '500mg', frequency: 'twice_daily', route: 'oral' },
      'Lisinopril': { dose: '10mg', frequency: 'once_daily', route: 'oral' },
      'Atorvastatin': { dose: '20mg', frequency: 'once_daily', route: 'oral' },
      'Omeprazole': { dose: '20mg', frequency: 'once_daily', route: 'oral' },
      'Morphine': { dose: '2-4mg', frequency: 'as_needed', route: 'iv' },
      'Ondansetron': { dose: '4mg', frequency: 'as_needed', route: 'iv' }
    }
    
    if (commonDosing[value] && !formData.dose && !formData.frequency && !formData.route) {
      setFormData(prev => ({ ...prev, ...commonDosing[value] }))
    }
  }

  const renderFormField = (field, value, onChange) => {
    const commonProps = {
      value: value || '',
      onChange,
      className: "w-full"
    }

    switch (field.type) {
      case 'select':
        return (
          <select 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case 'textarea':
        return (
          <Textarea 
            {...commonProps}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        )
      case 'date':
        return (
          <Input 
            {...commonProps}
            onChange={(e) => onChange(e.target.value)}
            type="date"
          />
        )
      default:
        if (field.key === 'name') {
          return (
            <MedicationAutocomplete
              value={value}
              onChange={handleMedicationNameChange}
              placeholder={field.placeholder}
            />
          )
        }
        return (
          <Input 
            {...commonProps}
            onChange={(e) => onChange(e.target.value)}
            type="text"
            placeholder={field.placeholder}
          />
        )
    }
  }

  const renderEditForm = (title) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enhancedMedicationFields.map(field => (
          <div key={field.key} className={field.key === 'indication' || field.key === 'notes' ? 'md:col-span-2' : ''}>
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderFormField(field, formData[field.key], (value) => handleFieldChange(field.key, value))}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} size="sm">
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button onClick={handleCancel} variant="outline" size="sm">
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  )

  const getMedicationStatus = (medication) => {
    if (!medication.start_date) return { status: 'unknown', icon: Clock, color: 'text-gray-400' }
    
    const now = new Date()
    const startDate = new Date(medication.start_date)
    const endDate = medication.end_date ? new Date(medication.end_date) : null

    if (endDate && endDate <= now) {
      return { status: 'discontinued', icon: XCircle, color: 'text-red-500' }
    }
    if (startDate <= now) {
      return { status: 'active', icon: CheckCircle, color: 'text-green-500' }
    }
    return { status: 'future', icon: Clock, color: 'text-blue-500' }
  }

  const getStatusBadge = (medication) => {
    const { status } = getMedicationStatus(medication)
    const variants = {
      active: 'bg-green-100 text-green-800',
      discontinued: 'bg-red-100 text-red-800',
      future: 'bg-blue-100 text-blue-800',
      unknown: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Check for potential interactions (simplified)
  const checkInteractions = (medications) => {
    const interactions = []
    
    // Common interaction pairs (simplified for demo)
    const interactionPairs = [
      ['Warfarin', 'Aspirin'],
      ['ACE Inhibitor', 'Potassium'],
      ['Metformin', 'Iodinated Contrast'],
      ['Digoxin', 'Amiodarone']
    ]

    medications.forEach((med1, i) => {
      medications.slice(i + 1).forEach(med2 => {
        interactionPairs.forEach(pair => {
          if ((med1.name?.includes(pair[0]) && med2.name?.includes(pair[1])) ||
              (med1.name?.includes(pair[1]) && med2.name?.includes(pair[0]))) {
            interactions.push({
              med1: med1.name,
              med2: med2.name,
              type: 'potential',
              description: `Potential interaction between ${pair[0]} and ${pair[1]}`
            })
          }
        })
      })
    })

    return interactions
  }

  // Medication Card Component
  const MedicationCard = ({ medication }) => {
    const { status, icon: StatusIcon, color } = getMedicationStatus(medication)
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-500" />
                {medication.name || 'Unknown Medication'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(medication)}
                {medication.dose && (
                  <Badge variant="outline">
                    {medication.dose}
                  </Badge>
                )}
                {medication.frequency && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {medication.frequency.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setViewingItem(medication)}>
                <Eye className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleEdit(medication)}>
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(medication.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {medication.indication && (
              <div className="flex items-start gap-2 text-sm">
                <Activity className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-600">Indication:</span>
                  <p className="text-gray-800">{medication.indication}</p>
                </div>
              </div>
            )}

            {medication.prescribing_physician && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Prescribed by:</span>
                <span className="font-medium">{medication.prescribing_physician}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {medication.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Started: {formatDate(medication.start_date)}
                </span>
              )}
              {medication.end_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Ended: {formatDate(medication.end_date)}
                </span>
              )}
              {medication.route && (
                <span>Route: {medication.route.toUpperCase()}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Medication Detail Modal
  const MedicationDetailModal = ({ medication, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-500" />
            Medication Details: {medication?.name}
          </DialogTitle>
        </DialogHeader>
        
        {medication && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Medication Name</Label>
                <p className="text-sm mt-1">{medication.name || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(medication)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Dose</Label>
                <p className="text-sm mt-1">{medication.dose || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Frequency</Label>
                <p className="text-sm mt-1">{medication.frequency ? medication.frequency.replace(/_/g, ' ') : 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Route</Label>
                <p className="text-sm mt-1">{medication.route ? medication.route.toUpperCase() : 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Prescribing Physician</Label>
                <p className="text-sm mt-1">{medication.prescribing_physician || 'Not specified'}</p>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <p className="text-sm mt-1">{medication.start_date ? formatDate(medication.start_date) : 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <p className="text-sm mt-1">{medication.end_date ? formatDate(medication.end_date) : 'Ongoing'}</p>
              </div>
            </div>

            {/* Detailed Info */}
            {medication.indication && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Indication</Label>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{medication.indication}</p>
              </div>
            )}

            {medication.notes && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Notes</Label>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{medication.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  const activeMedications = medications.filter(med => {
    const { status } = getMedicationStatus(med)
    return status === 'active'
  })

  const interactions = checkInteractions(activeMedications)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Medications ({medications.length})
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                </DialogHeader>
                {renderEditForm('New Medication Record')}
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and filters */}
          {medications.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Sort by:</Label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="start_date">Start Date</option>
                    <option value="name">Name</option>
                    <option value="indication">Indication</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Filter:</Label>
                  <select 
                    value={filterBy} 
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Medications</option>
                    <option value="active">Active</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Interaction Warnings */}
      {interactions.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Potential Drug Interactions Detected:</p>
              {interactions.map((interaction, index) => (
                <p key={index} className="text-sm">
                  • {interaction.description}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      {editingItem && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            {renderEditForm('Edit Medication Record')}
          </CardContent>
        </Card>
      )}

      {/* Medication List */}
      {processedMedications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processedMedications.map(medication => (
            <MedicationCard key={medication.id} medication={medication} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Medications</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterBy !== 'all' 
                ? "No medications match the current filters." 
                : "No medications have been recorded for this patient yet."}
            </p>
            {(!searchTerm && filterBy === 'all') && (
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Medication
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Medication Detail Modal */}
      <MedicationDetailModal
        medication={viewingItem}
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
      />
    </div>
  )
}

export default MedicationsSection 