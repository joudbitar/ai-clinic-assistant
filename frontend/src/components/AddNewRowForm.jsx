import { useState, useEffect } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { EditableTableRow } from './EditableField'
import { CancerStageBadge, PackYearsBadge, SmokingRiskBadge } from '@/components/ClinicalBadge'
import { calculatePackYears } from '@/config/fieldConfigs'

export function AddNewRowForm({ 
  fields, 
  onCreate, 
  onCancel,
  className = '',
  title = 'Add New'
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExpand = () => {
    setIsExpanded(true)
    setFormData({})
    setError('')
  }

  const handleCancel = () => {
    setIsExpanded(false)
    setFormData({})
    setError('')
    onCancel?.()
  }

  const validateRequiredFields = () => {
    const visibleFields = getVisibleFields()
    const missingFields = []
    
    visibleFields.forEach(field => {
      if (field.required && !formData[field.key]?.toString().trim()) {
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
      await onCreate(formData)
      setIsExpanded(false)
      setFormData({})
    } catch (err) {
      setError(err.message || 'Failed to add')
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing in any field
    if (error) {
      setError('')
    }
  }

  // Auto-calculate pack years when packs_per_day or years_smoked change
  useEffect(() => {
    if (formData.packs_per_day && formData.years_smoked) {
      const calculatedPackYears = calculatePackYears(formData.packs_per_day, formData.years_smoked)
      setFormData(prev => ({ ...prev, pack_years: calculatedPackYears }))
    }
  }, [formData.packs_per_day, formData.years_smoked])

  // Filter fields based on history type
  const getVisibleFields = () => {
    return fields.filter(field => {
      // Show all fields without showForType
      if (!field.showForType) return true
      
      // Show smoking fields only when history_type is smoking
      if (field.showForType === 'smoking') {
        return formData.history_type === 'smoking'
      }
      
      return true
    })
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleExpand}
        className={cn("text-muted-foreground hover:text-foreground", className)}
      >
        <Plus className="h-4 w-4 mr-2" />
        {title}
      </Button>
    )
  }

  const visibleFields = getVisibleFields()

  return (
    <div className={cn("space-y-4 p-4 border rounded-lg bg-muted/50", className)}>
      <h4 className="font-medium text-sm">{title}</h4>
      
      <div className="grid gap-4 md:grid-cols-2">
        {visibleFields.map((field) => {
          const isFieldRequired = field.required
          const isFieldEmpty = !formData[field.key]?.toString().trim()
          const hasError = isFieldRequired && isFieldEmpty && error
          
          return (
            <div key={field.key} className="space-y-2">
              <label className={cn(
                "text-sm font-medium",
                hasError ? "text-destructive" : "text-muted-foreground"
              )}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <Select
                  value={formData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  disabled={isLoading}
                  className={cn(hasError && "border-destructive focus:border-destructive")}
                >
                  <option value="">Select...</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={cn(
                    "min-h-[80px] px-3 py-2 rounded-md border border-input bg-background resize-none text-sm w-full",
                    hasError && "border-destructive focus:border-destructive"
                  )}
                  disabled={isLoading}
                />
              ) : (
                <Input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                  readOnly={field.readonly}
                  step={field.step}
                  min={field.min}
                  className={cn(hasError && "border-destructive focus:border-destructive")}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Smoking Risk Preview */}
      {formData.history_type === 'smoking' && formData.packs_per_day && formData.years_smoked && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">Smoking Risk Preview:</p>
          <div className="flex gap-2">
            <SmokingRiskBadge 
              packsPerDay={formData.packs_per_day}
              yearsSmoked={formData.years_smoked}
              packYears={formData.pack_years}
              size="sm"
            />
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
        >
          <Check className="h-4 w-4 mr-2" />
          Add
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Enhanced table component with inline editing
export function EditableTable({ 
  data, 
  fields, 
  onUpdate, 
  onDelete,
  onCreate,
  title,
  emptyMessage = 'No data available',
  className = ''
}) {
  const [editingId, setEditingId] = useState(null)

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

  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      
      {/* Add new row form */}
      {onCreate && (
        <AddNewRowForm
          fields={fields}
          onCreate={onCreate}
          title={`Add ${title || 'Item'}`}
        />
      )}
      
      {/* Data display */}
      {data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              {editingId === item.id ? (
                <EditableTableRow
                  data={item}
                  fields={fields}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  isEditing={true}
                />
              ) : (
                <div className="space-y-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {field.label}
                          </p>
                          <p className="text-sm">
                            {field.formatDisplay 
                              ? field.formatDisplay(item[field.key]) 
                              : item[field.key] || 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Clinical badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* Cancer staging badge for tumor data */}
                    {item.tnm_t && item.tnm_n && item.tnm_m && (
                      <CancerStageBadge 
                        tnm_t={item.tnm_t} 
                        tnm_n={item.tnm_n} 
                        tnm_m={item.tnm_m} 
                      />
                    )}
                    
                    {/* Pack-years badge for smoking history */}
                    {item.history_type === 'smoking' && item.description && (
                      <PackYearsBadge description={item.description} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item.id)}
                    >
                      Edit
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

 