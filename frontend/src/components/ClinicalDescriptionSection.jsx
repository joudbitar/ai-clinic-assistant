import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  FileText, 
  Calendar, 
  AlertTriangle,
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  Filter,
  Tag,
  Clock,
  User,
  Heart,
  Shield,
  Users,
  Briefcase,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { 
  clinicalDescriptionFields,
  formatDate
} from '@/config/fieldConfigs'

const ClinicalDescriptionSection = ({ 
  patientId, 
  histories = {}, 
  onUpdate, 
  onCreate, 
  onDelete, 
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState('all')
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at') // 'created_at', 'onset_date', 'type'

  // Organize histories by type
  const medicalHistory = histories.medical || []
  const allergyHistory = histories.allergy || []
  const socialHistory = histories.social || []
  const otherHistory = histories.other || []

  // All histories combined
  const allHistories = [...medicalHistory, ...allergyHistory, ...socialHistory, ...otherHistory]

  // Filter and sort histories
  const getFilteredHistories = (type = 'all') => {
    let filtered = []
    
    switch (type) {
      case 'medical':
        filtered = medicalHistory
        break
      case 'allergy':
        filtered = allergyHistory
        break
      case 'social':
        filtered = socialHistory
        break
      case 'other':
        filtered = otherHistory
        break
      default:
        filtered = allHistories
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        (item.description || '').toLowerCase().includes(searchLower) ||
        (item.history_type || '').toLowerCase().includes(searchLower) ||
        (item.notes || '').toLowerCase().includes(searchLower)
      )
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'onset_date':
          return new Date(b.onset_date || 0) - new Date(a.onset_date || 0)
        case 'type':
          return (a.history_type || '').localeCompare(b.history_type || '')
        case 'created_at':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      }
    })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
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
      console.error('Error saving clinical description:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this clinical note?')) {
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Error deleting clinical description:', error)
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
            rows={5}
            className="min-h-[120px]"
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
        {clinicalDescriptionFields.map(field => (
          <div key={field.key} className={field.key === 'description' || field.key === 'notes' ? 'md:col-span-2' : ''}>
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'medical':
        return Heart
      case 'allergy':
        return AlertTriangle
      case 'social':
        return Users
      case 'occupational':
        return Briefcase
      default:
        return FileText
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'medical':
        return 'text-red-500'
      case 'allergy':
        return 'text-orange-500'
      case 'social':
        return 'text-blue-500'
      case 'occupational':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const getTypeBadge = (type) => {
    const variants = {
      medical: 'bg-red-100 text-red-800',
      allergy: 'bg-orange-100 text-orange-800',
      social: 'bg-blue-100 text-blue-800',
      occupational: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={variants[type] || variants.other}>
        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Other'}
      </Badge>
    )
  }

  const getSeverityBadge = (severity) => {
    if (!severity) return null
    const variants = {
      mild: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      severe: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={variants[severity]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    const variants = {
      active: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800',
      controlled: 'bg-blue-100 text-blue-800',
      unknown: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Clinical Note Card Component
  const ClinicalNoteCard = ({ item }) => {
    const TypeIcon = getTypeIcon(item.history_type)
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <TypeIcon className={cn("h-5 w-5", getTypeColor(item.history_type))} />
                {item.history_type ? item.history_type.charAt(0).toUpperCase() + item.history_type.slice(1) : 'Clinical Note'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getTypeBadge(item.history_type)}
                {getSeverityBadge(item.severity)}
                {getStatusBadge(item.current_status)}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setViewingItem(item)}>
                <Eye className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-800 leading-relaxed">
                {item.description ? 
                  (item.description.length > 200 ? 
                    `${item.description.substring(0, 200)}...` : 
                    item.description
                  ) : 
                  'No description provided'
                }
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {item.onset_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Onset: {formatDate(item.onset_date)}
                </span>
              )}
              {item.created_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recorded: {formatDate(item.created_at)}
                </span>
              )}
            </div>

            {item.notes && (
              <div className="text-xs bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">Notes:</span>
                <p className="text-gray-600 mt-1">
                  {item.notes.length > 100 ? `${item.notes.substring(0, 100)}...` : item.notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Clinical Note Detail Modal
  const ClinicalNoteDetailModal = ({ item, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Clinical Note Details
          </DialogTitle>
        </DialogHeader>
        
        {item && (
          <div className="space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Type</Label>
                <div className="mt-1">
                  {getTypeBadge(item.history_type)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="mt-1 flex gap-2">
                  {getSeverityBadge(item.severity)}
                  {getStatusBadge(item.current_status)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Onset Date</Label>
                <p className="text-sm mt-1">{item.onset_date ? formatDate(item.onset_date) : 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Recorded</Label>
                <p className="text-sm mt-1">{item.created_at ? formatDate(item.created_at) : 'Not specified'}</p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <div className="mt-1 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.description || 'No description provided'}</p>
              </div>
            </div>

            {/* Notes */}
            {item.notes && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
                <div className="mt-1 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.notes}</p>
                </div>
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
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              <FileText className="h-5 w-5 text-blue-500" />
              Clinical Notes ({allHistories.length})
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Clinical Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Clinical Note</DialogTitle>
                </DialogHeader>
                {renderEditForm('New Clinical Note')}
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and filters */}
          {allHistories.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Input
                  placeholder="Search clinical notes..."
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
                    <option value="created_at">Date Added</option>
                    <option value="onset_date">Onset Date</option>
                    <option value="type">Type</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Edit Form */}
      {editingItem && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            {renderEditForm('Edit Clinical Note')}
          </CardContent>
        </Card>
      )}

      {/* Tabs for different types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All ({allHistories.length})
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-2">
            <Heart className="h-4 w-4" />
            Medical ({medicalHistory.length})
          </TabsTrigger>
          <TabsTrigger value="allergy" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Allergies ({allergyHistory.length})
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Users className="h-4 w-4" />
            Social ({socialHistory.length})
          </TabsTrigger>
          <TabsTrigger value="other" className="gap-2">
            <Tag className="h-4 w-4" />
            Other ({otherHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        {['all', 'medical', 'allergy', 'social', 'other'].map(tabType => (
          <TabsContent key={tabType} value={tabType} className="mt-6">
            {(() => {
              const filteredHistories = getFilteredHistories(tabType)
              
              if (filteredHistories.length > 0) {
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredHistories.map(item => (
                      <ClinicalNoteCard key={item.id} item={item} />
                    ))}
                  </div>
                )
              } else {
                return (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {tabType === 'all' ? 'Clinical Notes' : `${tabType.charAt(0).toUpperCase() + tabType.slice(1)} History`}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm 
                          ? "No clinical notes match the current search." 
                          : `No ${tabType === 'all' ? 'clinical notes' : tabType} records have been added yet.`}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add {tabType === 'all' ? 'Clinical Note' : `${tabType.charAt(0).toUpperCase() + tabType.slice(1)} History`}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              }
            })()}
          </TabsContent>
        ))}
      </Tabs>

      {/* Clinical Note Detail Modal */}
      <ClinicalNoteDetailModal
        item={viewingItem}
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
      />
    </div>
  )
}

export default ClinicalDescriptionSection 