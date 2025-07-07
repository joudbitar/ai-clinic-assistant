import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Check, X } from 'lucide-react'
import { useCreatePatient } from '@/hooks/useMutations'
import { patientFields, validateRequired, validateEmail, validatePhone } from '@/config/fieldConfigs'
import { useNavigate } from 'react-router-dom'

export function CreatePatientDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const createPatientMutation = useCreatePatient()
  const navigate = useNavigate()

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Required fields validation
    const requiredFields = [
      ...patientFields.demographics.filter(f => f.required),
    ]
    
    requiredFields.forEach(field => {
      const error = validateRequired(formData[field.key])
      if (error) {
        newErrors[field.key] = error
      }
    })

    // Email validation
    if (formData.email) {
      const emailError = validateEmail(formData.email)
      if (emailError) {
        newErrors.email = emailError
      }
    }

    // Phone validation
    if (formData.phone_1) {
      const phoneError = validatePhone(formData.phone_1)
      if (phoneError) {
        newErrors.phone_1 = phoneError
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const patient = await createPatientMutation.mutateAsync(formData)
      setOpen(false)
      setFormData({})
      setErrors({})
      // Navigate to the new patient's detail page
      navigate(`/patients/${patient.id}`)
    } catch (error) {
      console.error('Failed to create patient:', error)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setFormData({})
    setErrors({})
  }

  const renderField = (field) => {
    const value = formData[field.key] || ''
    const error = errors[field.key]

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {field.type === 'select' ? (
          <Select 
            value={value} 
            onChange={(e) => updateField(field.key, e.target.value)}
            disabled={createPatientMutation.isPending}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ) : field.type === 'textarea' ? (
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            disabled={createPatientMutation.isPending}
            className={error ? 'border-destructive' : ''}
          />
        ) : (
          <Input
            id={field.key}
            type={field.type || 'text'}
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            disabled={createPatientMutation.isPending}
            className={error ? 'border-destructive' : ''}
          />
        )}
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Create a new patient record with demographic and contact information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demographics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Demographics</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {patientFields.demographics.map(renderField)}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {patientFields.contact.map(renderField)}
            </div>
          </div>

          {/* Background Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Background Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {patientFields.background.map(renderField)}
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Medical Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {patientFields.medical.map(renderField)}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPatientMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPatientMutation.isPending}
            >
              {createPatientMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Create Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 