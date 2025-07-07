import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Scissors, 
  Calendar, 
  User, 
  FileText,
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle,
  XCircle
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
import { cn } from '@/lib/utils'
import { 
  enhancedSurgeryFields, 
  commonSurgeries,
  formatDate
} from '@/config/fieldConfigs'

// Autocomplete component for surgical procedures
const AutocompleteInput = ({ value, onChange, placeholder, suggestions = [] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  useEffect(() => {
    if (value && value.length > 1) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10)
      setFilteredSuggestions(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setIsOpen(false)
    }
  }, [value, suggestions])

  const handleSelect = (suggestion) => {
    onChange(suggestion)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => value && value.length > 1 && setIsOpen(filteredSuggestions.length > 0)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const SurgeriesSection = ({ 
  patientId, 
  surgeries = [], 
  onUpdate, 
  onCreate, 
  onDelete, 
  isLoading = false 
}) => {
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [sortBy, setSortBy] = useState('date') // 'date', 'procedure', 'outcome'
  const [filterBy, setFilterBy] = useState('all') // 'all', 'successful', 'complications'

  // Sort and filter surgeries
  const processedSurgeries = surgeries
    .filter(surgery => {
      if (filterBy === 'all') return true
      if (filterBy === 'successful') return surgery.outcome === 'successful'
      if (filterBy === 'complications') return surgery.complications && surgery.complications.trim()
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date || 0) - new Date(a.date || 0)
        case 'procedure':
          return (a.procedure || '').localeCompare(b.procedure || '')
        case 'outcome':
          return (a.outcome || '').localeCompare(b.outcome || '')
        default:
          return 0
      }
    })

  const handleEdit = (surgery) => {
    setEditingItem(surgery)
    setFormData(surgery)
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
      console.error('Error saving surgery:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this surgery record?')) {
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Error deleting surgery:', error)
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
      default:
        if (field.autocomplete) {
          return (
            <AutocompleteInput
              value={value}
              onChange={onChange}
              placeholder={field.placeholder}
              suggestions={field.autocomplete}
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
        {enhancedSurgeryFields.map(field => (
          <div key={field.key} className={field.key === 'complications' || field.key === 'pathology' || field.key === 'notes' ? 'md:col-span-2' : ''}>
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

  const getOutcomeIcon = (outcome) => {
    switch (outcome) {
      case 'successful':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unsuccessful':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'partially_successful':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getOutcomeBadge = (outcome) => {
    const variants = {
      successful: 'bg-green-100 text-green-800',
      unsuccessful: 'bg-red-100 text-red-800',
      partially_successful: 'bg-yellow-100 text-yellow-800',
      ongoing: 'bg-blue-100 text-blue-800'
    }
    return (
      <Badge className={variants[outcome] || 'bg-gray-100 text-gray-800'}>
        {outcome ? outcome.replace(/_/g, ' ') : 'Unknown'}
      </Badge>
    )
  }

  // Surgery Card Component
  const SurgeryCard = ({ surgery }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scissors className="h-5 w-5 text-blue-500" />
              {surgery.procedure || 'Unknown Procedure'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getOutcomeBadge(surgery.outcome)}
              {surgery.date && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(surgery.date)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setViewingItem(surgery)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(surgery)}>
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(surgery.id)} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {surgery.surgeon && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Surgeon:</span>
              <span className="font-medium">{surgery.surgeon}</span>
            </div>
          )}
          
          {surgery.indication && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-600">Indication:</span>
                <p className="text-gray-800">{surgery.indication}</p>
              </div>
            </div>
          )}

          {surgery.complications && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                <span className="font-medium">Complications:</span> {surgery.complications}
              </AlertDescription>
            </Alert>
          )}

          {surgery.pathology && (
            <div className="text-sm bg-gray-50 p-2 rounded">
              <span className="font-medium text-gray-700">Pathology:</span>
              <p className="text-gray-600 mt-1">{surgery.pathology}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Surgery Detail Modal
  const SurgeryDetailModal = ({ surgery, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-500" />
            Surgery Details: {surgery?.procedure}
          </DialogTitle>
        </DialogHeader>
        
        {surgery && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Procedure</Label>
                <p className="text-sm mt-1">{surgery.procedure || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Date</Label>
                <p className="text-sm mt-1">{surgery.date ? formatDate(surgery.date) : 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Surgeon</Label>
                <p className="text-sm mt-1">{surgery.surgeon || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Outcome</Label>
                <div className="mt-1">
                  {getOutcomeBadge(surgery.outcome)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Info */}
            {surgery.indication && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Indication</Label>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{surgery.indication}</p>
              </div>
            )}

            {surgery.complications && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Complications</Label>
                <div className="mt-1">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription>{surgery.complications}</AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {surgery.pathology && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Pathology Results</Label>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{surgery.pathology}</p>
              </div>
            )}

            {surgery.notes && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{surgery.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
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
              <Scissors className="h-5 w-5 text-blue-500" />
              Surgical History ({surgeries.length})
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Surgery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Surgery</DialogTitle>
                </DialogHeader>
                {renderEditForm('New Surgery Record')}
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and sorting */}
          {surgeries.length > 0 && (
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Sort by:</Label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="procedure">Procedure</option>
                  <option value="outcome">Outcome</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Filter:</Label>
                <select 
                  value={filterBy} 
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-36 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Surgeries</option>
                  <option value="successful">Successful</option>
                  <option value="complications">With Complications</option>
                </select>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Edit Form */}
      {editingItem && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            {renderEditForm('Edit Surgery Record')}
          </CardContent>
        </Card>
      )}

      {/* Surgery List */}
      {processedSurgeries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processedSurgeries.map(surgery => (
            <SurgeryCard key={surgery.id} surgery={surgery} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Scissors className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Surgical History</h3>
            <p className="text-gray-500 mb-4">
              {filterBy === 'all' 
                ? "No surgeries have been recorded for this patient yet." 
                : "No surgeries match the current filter."}
            </p>
            {filterBy === 'all' && (
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Surgery
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Surgery Detail Modal */}
      <SurgeryDetailModal
        surgery={viewingItem}
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
      />
    </div>
  )
}

export default SurgeriesSection 