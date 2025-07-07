import React, { useState, useMemo } from 'react'
import { 
  Plus, 
  Shield, 
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  Calendar,
  Search,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Stethoscope
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { 
  enhancedOtherTreatmentFields,
  formatDate
} from '@/config/fieldConfigs'

const OtherTreatmentsSection = ({ 
  patientId, 
  otherTreatments = [], 
  onUpdate, 
  onCreate, 
  onDelete, 
  isLoading = false 
}) => {
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('start_date')
  const [filterBy, setFilterBy] = useState('all')

  // Process and filter other treatments data
  const processedOtherTreatments = useMemo(() => {
    let filtered = otherTreatments.filter(treatment => {
      const matchesSearch = !searchTerm || 
        treatment.treatment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.indication?.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesFilter = true
      if (filterBy === 'recent') {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        matchesFilter = treatment.start_date && new Date(treatment.start_date) >= threeMonthsAgo
      } else if (filterBy === 'completed') {
        matchesFilter = treatment.end_date && new Date(treatment.end_date) <= new Date()
      }
      
      return matchesSearch && matchesFilter
    })

    // Sort the results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'treatment_type':
          return (a.treatment_type || '').localeCompare(b.treatment_type || '')
        case 'indication':
          return (a.indication || '').localeCompare(b.indication || '')
        case 'start_date':
        default:
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0)
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0)
          return dateB - dateA
      }
    })

    return filtered
  }, [otherTreatments, searchTerm, sortBy, filterBy])

  const handleEdit = (treatment) => {
    setEditingItem(treatment)
    setFormData(treatment)
  }

  const handleSave = async () => {
    try {
      if (editingItem && editingItem.id) {
        await onUpdate({ ...formData, id: editingItem.id })
      } else {
        const dataWithPatientId = { ...formData, patient_id: patientId }
        await onCreate(dataWithPatientId)
      }
      setEditingItem(null)
      setFormData({})
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error saving other treatment:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this treatment record?')) {
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Error deleting other treatment:', error)
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
      case 'number':
        return (
          <Input 
            {...commonProps}
            onChange={(e) => onChange(e.target.value)}
            type="number"
            min={field.min}
            step={field.step}
            placeholder={field.placeholder}
          />
        )
      default:
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
        {enhancedOtherTreatmentFields.map(field => (
          <div key={field.key} className={field.key === 'description' || field.key === 'side_effects' || field.key === 'notes' ? 'md:col-span-2' : ''}>
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

  const getResponseBadge = (response) => {
    if (!response) return null
    const lower = response.toLowerCase()
    let variant = 'bg-gray-100 text-gray-800'
    if (lower.includes('complete')) variant = 'bg-green-100 text-green-800'
    else if (lower.includes('partial')) variant = 'bg-blue-100 text-blue-800'
    else if (lower.includes('stable')) variant = 'bg-yellow-100 text-yellow-800'
    else if (lower.includes('progressive')) variant = 'bg-red-100 text-red-800'
    
    return (
      <Badge className={variant}>
        {response}
      </Badge>
    )
  }

  const getTreatmentIcon = (treatmentType) => {
    if (!treatmentType) return <Shield className="h-5 w-5 text-purple-500" />
    const lower = treatmentType.toLowerCase()
    if (lower.includes('immuno')) return <Shield className="h-5 w-5 text-blue-500" />
    if (lower.includes('target')) return <Activity className="h-5 w-5 text-green-500" />
    if (lower.includes('hormone')) return <Stethoscope className="h-5 w-5 text-pink-500" />
    return <Shield className="h-5 w-5 text-purple-500" />
  }

  // Other Treatment Card Component
  const OtherTreatmentCard = ({ treatment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getTreatmentIcon(treatment.treatment_type)}
              {treatment.treatment_type || 'Unknown Treatment'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getResponseBadge(treatment.response)}
              {treatment.start_date && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(treatment.start_date)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setViewingItem(treatment)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(treatment)}>
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(treatment.id)} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {treatment.description && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="text-gray-800">{treatment.description}</p>
              </div>
            </div>
          )}
          
          {treatment.indication && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-600">Indication:</span>
                <p className="text-gray-800">{treatment.indication}</p>
              </div>
            </div>
          )}

          {treatment.side_effects && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                <span className="font-medium">Side Effects:</span> {treatment.side_effects}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )

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
              <Shield className="h-5 w-5 text-purple-500" />
              Other Treatments History ({otherTreatments.length})
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Other Treatment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Other Treatment</DialogTitle>
                </DialogHeader>
                {renderEditForm('New Other Treatment Record')}
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and sorting */}
          {otherTreatments.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Input
                  placeholder="Search treatments..."
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
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="start_date">Start Date</option>
                    <option value="treatment_type">Treatment Type</option>
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
                    <option value="all">All Treatments</option>
                    <option value="recent">Recent (3 months)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Edit Form */}
      {editingItem && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            {renderEditForm('Edit Other Treatment Record')}
          </CardContent>
        </Card>
      )}

      {/* Other Treatments List */}
      {processedOtherTreatments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processedOtherTreatments.map(treatment => (
            <OtherTreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Other Treatments History</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterBy !== 'all' 
                ? "No other treatments match the current filters." 
                : "No other treatments have been recorded for this patient yet."}
            </p>
            {(!searchTerm && filterBy === 'all') && (
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Other Treatment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default OtherTreatmentsSection 