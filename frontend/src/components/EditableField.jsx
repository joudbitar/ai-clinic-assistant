import { useState, useEffect, useRef } from 'react'
import { Check, X, Edit3 } from 'lucide-react'
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
  placeholder = 'Enter value...', 
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
  showBMI = false // Show BMI calculation for weight/height
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

  const startEditing = () => {
    setIsEditing(true)
    setError('')
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditValue('')
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
    } catch (error) {
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

  // Cancel on blur instead of saving
  const handleBlur = () => {
    cancelEditing()
  }

  const getDisplayValue = () => {
    if (formatDisplay && value) {
      return formatDisplay(value)
    }
    return value || 'N/A'
  }

  const renderInput = () => {
    const baseProps = {
      ref: inputRef,
      value: editValue,
      onChange: (e) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      placeholder,
      className: cn('h-8', className),
      disabled: updatePatientMutation.isPending
    }

    switch (type) {
      case 'select':
        return (
          <Select {...baseProps} className={cn('h-8', className)}>
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )
      case 'date':
        return <Input {...baseProps} type="date" />
      case 'email':
        return <Input {...baseProps} type="email" />
      case 'tel':
        return <Input {...baseProps} type="tel" />
      case 'number':
        return <Input {...baseProps} type="number" />
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            className={cn('min-h-[80px] px-3 py-2 rounded-md bg-background resize-none text-sm focus:outline-none', className)}
            rows={3}
          />
        )
      default:
        return <Input {...baseProps} />
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {renderInput()}
          <Button
            size="sm"
            onClick={saveValue}
            disabled={updatePatientMutation.isPending}
            className="h-8 w-8 p-0 shrink-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelEditing}
            disabled={updatePatientMutation.isPending}
            className="h-8 w-8 p-0 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {/* Show BMI preview when editing weight/height */}
        {showBMI && relatedData && editValue && (
          <div className="mt-2">
            {(field === 'weight' && relatedData.height) && (
              <BMIBadge weight={parseFloat(editValue)} height={relatedData.height} className="ml-0" />
            )}
            {(field === 'height' && relatedData.weight) && (
              <BMIBadge weight={relatedData.weight} height={parseFloat(editValue)} className="ml-0" />
            )}
          </div>
        )}
      </div>
    )
  }

  const displayValue = getDisplayValue()
  const isEmpty = !value || value === 'N/A'

  return (
    <div>
      <div
        onClick={startEditing}
        className={cn(
          'group relative cursor-pointer rounded-md px-3 py-2 -mx-3 -my-2',
          'hover:bg-muted/30',
          'transition-colors duration-200',
          displayClassName
        )}
        title="Click to edit"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {badge ? (
            <Badge 
              variant={isEmpty ? "outline" : "secondary"} 
              className="capitalize font-normal"
            >
              {displayValue}
            </Badge>
          ) : (
            <span className={cn(
              'font-medium',
              isEmpty && 'text-muted-foreground italic'
            )}>
              {displayValue}
            </span>
          )}
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        </div>
      </div>
      
      {/* Show BMI calculation for weight/height fields */}
      {showBMI && relatedData && value && (
        <div className="mt-1 ml-0">
          {(field === 'weight' && relatedData.height) && (
            <BMIBadge weight={parseFloat(value)} height={relatedData.height} />
          )}
          {(field === 'height' && relatedData.weight) && (
            <BMIBadge weight={relatedData.weight} height={parseFloat(value)} />
          )}
        </div>
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