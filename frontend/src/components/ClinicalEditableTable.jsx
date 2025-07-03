import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, Check, X, Edit3, Trash2, Edit2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BMIBadge, CancerStageBadge, PackYearsBadge, SmokingRiskBadge } from '@/components/ClinicalBadge'
import { AddNewRowForm } from '@/components/AddNewRowForm'
import { useBaselineTumors } from '@/hooks/usePatients'
import { useCreateBaselineTumor, useUpdateBaselineTumor, useDeleteBaselineTumor } from '@/hooks/useMutations'
import { tumorFields, calculatePackYears } from '@/config/fieldConfigs'

// Baseline Tumor Management Component
const BaselineTumors = ({ baseline }) => {
  const [showTumors, setShowTumors] = useState(false)
  const [editingTumor, setEditingTumor] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const { data: tumors, isLoading } = useBaselineTumors(baseline.id)
  const createTumorMutation = useCreateBaselineTumor()
  const updateTumorMutation = useUpdateBaselineTumor()
  const deleteTumorMutation = useDeleteBaselineTumor()

  const handleCreateTumor = async (tumorData) => {
    try {
      await createTumorMutation.mutateAsync({ 
        baselineId: baseline.id, 
        tumorData 
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating tumor:', error)
    }
  }

  const handleUpdateTumor = async (tumorId, field, value) => {
    try {
      await updateTumorMutation.mutateAsync({ tumorId, field, value })
      setEditingTumor(null)
    } catch (error) {
      console.error('Error updating tumor:', error)
    }
  }

  const handleDeleteTumor = async (tumorId) => {
    if (confirm('Are you sure you want to delete this tumor?')) {
      try {
        await deleteTumorMutation.mutateAsync({ 
          tumorId, 
          baselineId: baseline.id 
        })
      } catch (error) {
        console.error('Error deleting tumor:', error)
      }
    }
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
        onClick={() => setShowTumors(!showTumors)}
      >
        {showTumors ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-medium text-sm">Tumors</span>
        <Badge variant="secondary" className="text-xs">
          {tumors?.length || 0}
        </Badge>
      </div>

      {showTumors && (
        <div className="ml-6 mt-2 space-y-3">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading tumors...</div>
          ) : tumors?.length > 0 ? (
            tumors.map((tumor) => (
              <TumorRow
                key={tumor.id}
                tumor={tumor}
                editing={editingTumor === tumor.id}
                onEdit={() => setEditingTumor(tumor.id)}
                onSave={(field, value) => handleUpdateTumor(tumor.id, field, value)}
                onCancel={() => setEditingTumor(null)}
                onDelete={() => handleDeleteTumor(tumor.id)}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500">No tumors recorded for this baseline.</div>
          )}

          {showAddForm ? (
            <AddNewRowForm
              fields={tumorFields}
              onCreate={handleCreateTumor}
              onCancel={() => setShowAddForm(false)}
              title="Add Tumor"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Tumor
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Tumor Row Component
const TumorRow = ({ tumor, editing, onEdit, onSave, onCancel, onDelete }) => {
  const [editData, setEditData] = useState(tumor)

  const handleSave = () => {
    onSave('all', editData)
  }

  const handleCancel = () => {
    setEditData(tumor)
    onCancel()
  }

  if (editing) {
    return (
      <div className="border rounded-lg p-3 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tumorFields.map((field) => (
            <div key={field.key}>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <Select
                  value={editData[field.key] || ''}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, [field.key]: value }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  value={editData[field.key] || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="min-h-[60px] text-sm"
                />
              ) : (
                <Input
                  type={field.type}
                  value={editData[field.key] || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="h-8 text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={handleSave}>
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{tumor.site || 'Unknown Site'}</span>
            {tumor.size && (
              <Badge variant="outline" className="text-xs">
                {tumor.size} cm
              </Badge>
            )}
            <CancerStageBadge 
              tnm_t={tumor.tnm_t} 
              tnm_n={tumor.tnm_n} 
              tnm_m={tumor.tnm_m} 
            />
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            {tumor.histology && <div><strong>Histology:</strong> {tumor.histology}</div>}
            {tumor.grade && <div><strong>Grade:</strong> {tumor.grade.toUpperCase()}</div>}
            {tumor.description && <div><strong>Description:</strong> {tumor.description}</div>}
            {(tumor.tnm_t || tumor.tnm_n || tumor.tnm_m) && (
              <div>
                <strong>TNM:</strong> T{tumor.tnm_t || 'x'} N{tumor.tnm_n || 'x'} M{tumor.tnm_m || 'x'}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Enhanced table component specifically for clinical data with auto-calculated metrics
export function ClinicalEditableTable({ 
  data, 
  fields, 
  onUpdate, 
  onDelete,
  onCreate,
  title,
  emptyMessage = 'No data available',
  className = '',
  dataType = 'generic' // 'baseline', 'followup', 'tumor', 'history'
}) {
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleEdit = (id) => {
    setEditingId(id)
  }

  const handleSave = async (updatedData) => {
    await onUpdate(updatedData)
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    await onDelete(id)
    setEditingId(null)
  }

  const handleCreate = async (newData) => {
    await onCreate(newData)
    setShowAddForm(false)
  }

  const renderClinicalBadges = (item) => {
    const badges = []
    
    // BMI calculation for baseline and follow-up data
    if ((dataType === 'baseline' || dataType === 'followup') && item.weight && item.height) {
      badges.push(
        <BMIBadge 
          key="bmi"
          weight={parseFloat(item.weight)} 
          height={parseFloat(item.height)} 
        />
      )
    }
    
    // Cancer staging for tumor data
    if (dataType === 'tumor' && item.tnm_t && item.tnm_n && item.tnm_m) {
      badges.push(
        <CancerStageBadge 
          key="stage"
          tnm_t={item.tnm_t} 
          tnm_n={item.tnm_n} 
          tnm_m={item.tnm_m} 
        />
      )
    }
    
    // Smoking risk for smoking history - Use structured data if available
    if (dataType === 'history' && item.history_type === 'smoking') {
      // Priority: Use structured data if available
      if (item.packs_per_day && item.years_smoked) {
        badges.push(
          <SmokingRiskBadge 
            key="smoking-risk"
            packsPerDay={item.packs_per_day}
            yearsSmoked={item.years_smoked}
            packYears={item.pack_years}
            size="sm"
          />
        )
      } else if (item.description) {
        // Fallback to parsing description text
        badges.push(
          <PackYearsBadge 
            key="pack-years"
            description={item.description}
            size="sm"
          />
        )
      }
    }
    
    return badges
  }

  // Special rendering for baseline dataType
  if (dataType === 'baseline') {
    return (
      <div className={cn('space-y-6', className)}>
        {data && data.length > 0 ? (
          data.map((item) => (
            <div key={item.id} className="border rounded-lg p-6 bg-white shadow-sm">
              {/* Baseline header with date and clinical badges */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    Baseline - {new Date(item.baseline_date).toLocaleDateString()}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    {renderClinicalBadges(item)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(item.id)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Baseline data grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {field.label}
                    </label>
                    <div className="text-sm text-gray-900">
                      {item[field.key] || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tumor management for this baseline */}
              <BaselineTumors baseline={item} />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        )}

        {/* Add new baseline form */}
        {showAddForm ? (
          <AddNewRowForm
            fields={fields}
            onCreate={handleCreate}
            onCancel={() => setShowAddForm(false)}
            title={`Add ${title}`}
          />
        ) : (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add {title}
          </Button>
        )}
      </div>
    )
  }

  // Regular table rendering for other data types
  return (
    <div className={cn('space-y-4', className)}>
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm">
              {editingId === item.id ? (
                <EditableRow
                  data={item}
                  fields={fields}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  dataType={dataType}
                />
              ) : (
                <DisplayRow
                  data={item}
                  fields={fields}
                  onEdit={() => handleEdit(item.id)}
                  onDelete={() => handleDelete(item.id)}
                  dataType={dataType}
                  renderClinicalBadges={renderClinicalBadges}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      )}

              {showAddForm ? (
          <AddNewRowForm
            fields={fields}
            onCreate={handleCreate}
            onCancel={() => setShowAddForm(false)}
            title={`Add ${title}`}
          />
        ) : (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add {title}
          </Button>
        )}
    </div>
  )
}

// Editable row component
const EditableRow = ({ data, fields, onSave, onCancel, dataType }) => {
  const [editData, setEditData] = useState(data)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-calculate pack years for smoking history
  useEffect(() => {
    if (dataType === 'history' && editData.history_type === 'smoking' && 
        editData.packs_per_day && editData.years_smoked) {
      const calculatedPackYears = calculatePackYears(editData.packs_per_day, editData.years_smoked)
      setEditData(prev => ({ ...prev, pack_years: calculatedPackYears }))
    }
  }, [editData.packs_per_day, editData.years_smoked, editData.history_type, dataType])

  const validateRequiredFields = () => {
    const visibleFields = getVisibleFields()
    const missingFields = []
    
    visibleFields.forEach(field => {
      if (field.required && !editData[field.key]?.toString().trim()) {
        missingFields.push(field.label)
      }
    })
    
    return missingFields
  }

  const handleSave = async () => {
    setError('')
    
    // Validate required fields
    const missingFields = validateRequiredFields()
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }
    
    setIsLoading(true)
    try {
      await onSave(editData)
    } catch (error) {
      setError(error.message || 'Failed to save')
      console.error('Error saving:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing in any field
    if (error) {
      setError('')
    }
  }

  // Filter fields based on history type for smoking fields
  const getVisibleFields = () => {
    return fields.filter(field => {
      if (!field.showForType) return true
      if (field.showForType === 'smoking') {
        return editData.history_type === 'smoking'
      }
      return true
    })
  }

  const visibleFields = getVisibleFields()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {visibleFields.map((field) => {
          const isFieldRequired = field.required
          const isFieldEmpty = !editData[field.key]?.toString().trim()
          const hasError = isFieldRequired && isFieldEmpty && error
          
          return (
            <div key={field.key} className="space-y-2">
              <label className={cn(
                "text-sm font-medium",
                hasError ? "text-red-500" : "text-gray-700"
              )}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <Select
                  value={editData[field.key] || ''}
                  onValueChange={(value) => updateField(field.key, value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn(hasError && "border-red-500 focus:border-red-500")}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  value={editData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className={cn(
                    "min-h-[80px]",
                    hasError && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading}
                />
              ) : (
                <Input
                  type={field.type || 'text'}
                  value={editData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  disabled={isLoading}
                  readOnly={field.readonly}
                  step={field.step}
                  min={field.min}
                  placeholder={field.placeholder}
                  className={cn(hasError && "border-red-500 focus:border-red-500")}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Live preview for BMI calculation */}
      {(dataType === 'baseline' || dataType === 'followup') && editData.weight && editData.height && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <BMIBadge weight={parseFloat(editData.weight)} height={parseFloat(editData.height)} />
        </div>
      )}
      
      {/* Live preview for smoking risk calculation */}
      {dataType === 'history' && editData.history_type === 'smoking' && 
       editData.packs_per_day && editData.years_smoked && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Smoking Risk Preview:</p>
          <SmokingRiskBadge 
            packsPerDay={editData.packs_per_day}
            yearsSmoked={editData.years_smoked}
            packYears={editData.pack_years}
            size="sm"
          />
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={isLoading}>
          <Check className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Display row component
const DisplayRow = ({ data, fields, onEdit, onDelete, dataType, renderClinicalBadges }) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          {renderClinicalBadges(data)}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-medium text-gray-500 block">
              {field.label}
            </label>
            <div className="text-sm text-gray-900 mt-1">
              {data[field.key] || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 