import { useState, useEffect, useRef } from 'react'
import { Check, X, Edit3, Sparkles, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useUpdatePatient } from '@/hooks/useMutations'
import { useToast } from '@/hooks/useToast.jsx'
import { BMIBadge } from '@/components/ClinicalBadge'

export function EditableField({ 
  value, 
  onSave, 
  type = 'text', 
  placeholder = 'Enter value',
  className = '',
  displayClassName = '',
  options = [], // For select type
  badge = false, // Display as badge
  formatDisplay = null, // Custom display formatter
  validate = null, // Validation function
  icon = null,
  patientId = null, // For automatic mutations
  field = null, // Field name for automatic mutations
  relatedData = null, // For clinical calculations (e.g., BMI)
  showBMI = false, // Show BMI calculation for weight/height
  extractionStatus = null // 'extracted', 'not_extracted', null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)

  const updatePatientMutation = useUpdatePatient()
  const { toast } = useToast()

  useEffect(() => {
    setEditValue(value || '')
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (type === 'text' || type === 'email' || type === 'tel') {
        inputRef.current.select()
      }
    }
  }, [isEditing, type])

  const getExtractionIndicator = () => {
    if (!extractionStatus) return null
    
    if (extractionStatus === 'extracted') {
      return (
        <Badge 
          variant="secondary" 
          className="ml-2 text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          AI Extracted
        </Badge>
      )
    } else if (extractionStatus === 'not_extracted') {
      return (
        <Badge 
          variant="secondary" 
          className="ml-2 text-xs bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Needs Input
        </Badge>
      )
    }
    
    return null
  }

  const startEditing = () => {
    setIsEditing(true)
    setError('')
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditValue(value || '')
    setError('')
  }

  const saveValue = async () => {
    if (validate) {
      const validationError = validate(editValue)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    if (editValue === (value || '')) {
      cancelEditing()
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (patientId && field) {
        await updatePatientMutation.mutateAsync({
          patientId,
          field,
          value: editValue
        })
      }
      
      if (onSave) {
        await onSave(editValue)
      }
      
      setIsEditing(false)
      toast.success(`Updated ${field} successfully`)
    } catch (error) {
      console.error('EditableField save error:', error)
      setError(error.message)
      toast.error(`Failed to save: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveValue()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (isEditing) {
        saveValue()
      }
    }, 150)
  }

  const getDisplayValue = () => {
    if (formatDisplay && value) {
      return formatDisplay(value)
    }
    
    if (type === 'select' && value && options.length > 0) {
      const option = options.find(opt => opt.value === value)
      return option ? option.label : placeholder
    }
    
    return value || placeholder
  }

  const renderInput = () => {
    const baseProps = {
      ref: inputRef,
      value: editValue,
      onChange: (e) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      placeholder,
      className: cn(
        'w-full bg-transparent text-xs',
        'focus:outline-none focus:ring-0',
        type === 'textarea' ? 'resize-none' : 'h-[inherit]',
        className
      ),
      disabled: updatePatientMutation.isPending
    }

    switch (type) {
      case 'select':
        return (
          <Select 
            {...baseProps}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            rows={3}
          />
        )
      default:
        return <Input {...baseProps} type={type} />
    }
  }

  return (
    <div 
      className={cn(
        'group relative min-h-[24px] flex items-center',
        'hover:bg-muted/5 rounded px-2 -mx-2',
        'transition-colors duration-100',
        extractionStatus === 'extracted' && 'bg-green-50/50 border-l-2 border-green-300',
        extractionStatus === 'not_extracted' && 'bg-orange-50/50 border-l-2 border-orange-300',
        displayClassName
      )}
      onClick={startEditing}
    >
      {isEditing ? (
        <div className="flex items-center w-full">
          {renderInput()}
          {getExtractionIndicator()}
        </div>
      ) : (
        <div className="w-full cursor-text">
          {badge ? (
            <div className="flex items-center">
              <Badge variant="outline" className="font-normal text-xs">
                {getDisplayValue()}
              </Badge>
              {getExtractionIndicator()}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-600">
                {icon && <span className="mr-2">{icon}</span>}
                {getDisplayValue()}
              </span>
              {getExtractionIndicator()}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="text-xs text-destructive mt-1">{error}</div>
      )}
    </div>
  )
}

// Enhanced component for table row editing
export function EditableTableRow({ 
  data, 
  fields, 
  onSave, 
  onCancel,
  onDelete,
  isEditing = false,
  className = ''
}) {
  const [editData, setEditData] = useState(data)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setEditData(data)
  }, [data])

  const validateRequiredFields = () => {
    const missingFields = []
    
    fields.forEach(field => {
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
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData(data)
    setError('')
    onCancel()
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsLoading(true)
      try {
        await onDelete(data.id)
      } catch (err) {
        setError(err.message || 'Failed to delete')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing in any field
    if (error) {
      setError('')
    }
  }

  if (isEditing) {
    return (
      <div className={cn("space-y-4 p-4 rounded-lg bg-muted/30", className)}>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => {
            const isFieldRequired = field.required
            const isFieldEmpty = !editData[field.key]?.toString().trim()
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
                    value={editData[field.key] || ''}
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
                    value={editData[field.key] || ''}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={cn(
                      "min-h-[80px] px-3 py-2 rounded-md bg-background resize-none text-sm w-full focus:outline-none",
                      hasError && "border-destructive focus:border-destructive"
                    )}
                    disabled={isLoading}
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    value={editData[field.key] || ''}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={isLoading}
                    className={cn(hasError && "border-destructive focus:border-destructive")}
                  />
                )}
              </div>
            )
          })}
        </div>
        
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
            Save
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
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="ml-auto"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {field.label}
              </p>
              <p className="text-sm">
                {field.formatDisplay 
                  ? field.formatDisplay(data[field.key]) 
                  : data[field.key] || 'N/A'
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook for managing patient updates (keeping backwards compatibility)
export function usePatientUpdate(patientId) {
  const updatePatientMutation = useUpdatePatient()
  
  const updateField = async (field, value) => {
    return updatePatientMutation.mutateAsync({
      patientId,
      field,
      value
    })
  }

  return { updateField, isLoading: updatePatientMutation.isPending }
} 