import React, { useState, useEffect } from 'react'
import { 
  User, Heart, Activity, Pill, Zap, Scissors, Target, 
  FlaskConical, Dna, Scan, History, Calendar, Phone, 
  Mail, MapPin, Briefcase, Globe, FileText, Eye, Edit, X, Plus, Trash2, Save, AlertTriangle, TrendingUp, Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { EditableField } from '@/components/EditableField'
import { ClinicalEditableTable } from '@/components/ClinicalEditableTable'
import { BMIBadge, CancerStageBadge, SmokingRiskBadge } from '@/components/ClinicalBadge'
import { 
  chemotherapyFields, 
  radiotherapyFields, 
  surgeryFields, 
  medicationFields,
  baselineFields,
  formatDate,
  formatPhone
} from '@/config/fieldConfigs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import sections
import RiskFactorsSection from './RiskFactorsSection'
import SurgeriesSection from './SurgeriesSection'
import MedicationsSection from './MedicationsSection'
import ChemotherapySection from './ChemotherapySection'
import RadiotherapySection from './RadiotherapySection'
import OtherTreatmentsSection from './OtherTreatmentsSection'

// Demographics Section
export function DemographicsSection({ patient, patientId }) {
  const validateEmail = (email) => {
    if (!email) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? null : 'Please enter a valid email address'
  }

  const validatePhone = (phone) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 ? null : 'Please enter a valid phone number'
  }

  const validateRequired = (value) => {
    return value && value.trim() ? null : 'This field is required'
  }

  const demographicsData = [
    { label: 'First Name', value: patient?.first_name, field: 'first_name', icon: User, required: true },
    { label: 'Last Name', value: patient?.last_name, field: 'last_name', icon: User, required: true },
    { label: 'Father Name', value: patient?.father_name, field: 'father_name', icon: User },
    { label: 'Mother Name', value: patient?.mother_name, field: 'mother_name', icon: User },
    { label: 'Gender', value: patient?.gender, field: 'gender', icon: User, type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]},
    { label: 'Date of Birth', value: patient?.date_of_birth, field: 'date_of_birth', icon: Calendar, type: 'date', formatDisplay: formatDate },
    { label: 'Marital Status', value: patient?.marital_status, field: 'marital_status', icon: Heart, type: 'select', options: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' },
      { value: 'divorced', label: 'Divorced' },
      { value: 'widowed', label: 'Widowed' }
    ]},
    { label: 'Children', value: patient?.children_count, field: 'children_count', icon: User, type: 'number' }
  ]

  const contactData = [
    { label: 'Primary Phone', value: patient?.phone_1, field: 'phone_1', icon: Phone, type: 'tel', formatDisplay: formatPhone },
    { label: 'Secondary Phone', value: patient?.phone_2, field: 'phone_2', icon: Phone, type: 'tel', formatDisplay: formatPhone },
    { label: 'Email', value: patient?.email, field: 'email', icon: Mail, type: 'email' },
    { label: 'Address', value: patient?.address, field: 'address', icon: MapPin, type: 'textarea' }
  ]

  const backgroundData = [
    { label: 'Country of Birth', value: patient?.country_of_birth, field: 'country_of_birth', icon: Globe },
    { label: 'City of Birth', value: patient?.city_of_birth, field: 'city_of_birth', icon: Globe },
    { label: 'Occupation', value: patient?.occupation, field: 'occupation', icon: Briefcase },
    { label: 'Education', value: patient?.education, field: 'education', icon: Briefcase },
    { label: 'File Reference', value: patient?.file_reference, field: 'file_reference', icon: FileText },
    { label: 'Case Number', value: patient?.case_number, field: 'case_number', icon: FileText }
  ]

  const medicalData = [
    { label: 'Referring Physician', value: patient?.referring_physician_name, field: 'referring_physician_name', icon: User },
    { label: 'Physician Phone', value: patient?.referring_physician_phone_1, field: 'referring_physician_phone_1', icon: Phone, type: 'tel', formatDisplay: formatPhone },
    { label: 'Physician Email', value: patient?.referring_physician_email, field: 'referring_physician_email', icon: Mail, type: 'email' },
    { label: 'Third Party Payer', value: patient?.third_party_payer, field: 'third_party_payer', icon: FileText },
    { label: 'Medical Ref Number', value: patient?.medical_ref_number, field: 'medical_ref_number', icon: FileText }
  ]

  const DataGrid = ({ data, title, icon: Icon, columns = 2 }) => (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <item.icon className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 mb-1">{item.label}</div>
                <div className="text-sm">
                  <EditableField
                    value={item.value}
                    patientId={patientId}
                    field={item.field}
                    type={item.type || 'text'}
                    options={item.options}
                    placeholder={`Enter ${item.label.toLowerCase()}`}
                    validate={item.required ? validateRequired : item.type === 'email' ? validateEmail : item.type === 'tel' ? validatePhone : null}
                    formatDisplay={item.formatDisplay}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <DataGrid data={demographicsData} title="Personal Information" icon={User} />
      <DataGrid data={contactData} title="Contact Information" icon={Phone} />
      <DataGrid data={backgroundData} title="Background" icon={Globe} />
      <DataGrid data={medicalData} title="Medical References" icon={Heart} />
    </div>
  )
}

// Medical History Section
export function MedicalHistorySection({ histories, historyHandlers, isLoading }) {
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    history_type: '',
    description: '',
    onset_date: '',
    severity: '',
    notes: '',
    is_smoker: false,
    pack_years: '',
    is_drinker: false,
    drinking_severity: ''
  })

  const getHistoryBadge = (historyType) => {
    const colors = {
      family: 'bg-blue-100 text-blue-800',
      medical: 'bg-red-100 text-red-800',
      allergy: 'bg-yellow-100 text-yellow-800',
      social: 'bg-green-100 text-green-800',
      smoking: 'bg-orange-100 text-orange-800',
      alcohol: 'bg-purple-100 text-purple-800',
      narcotics: 'bg-rose-100 text-rose-800'
    }
    return colors[historyType] || 'bg-gray-100 text-gray-800'
  }

  const getHistoryIcon = (historyType) => {
    const icons = {
      family: User,
      medical: Heart,
      allergy: Activity,
      social: User,
      smoking: Activity,
      alcohol: Activity,
      narcotics: Activity
    }
    return icons[historyType] || FileText
  }

  const handleEdit = (history) => {
    setEditingId(history.id)
    setFormData({
      history_type: history.history_type || '',
      description: history.description || '',
      onset_date: history.onset_date || '',
      severity: history.severity || '',
      notes: history.notes || '',
      is_smoker: history.is_smoker || false,
      pack_years: history.pack_years || '',
      is_drinker: history.is_drinker || false,
      drinking_severity: history.drinking_severity || ''
    })
    setIsAdding(false)
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      history_type: '',
      description: '',
      onset_date: '',
      severity: '',
      notes: '',
      is_smoker: false,
      pack_years: '',
      is_drinker: false,
      drinking_severity: ''
    })
  }

  const handleSave = async () => {
    try {
      if (!formData.history_type || !formData.description) {
        console.error('Required fields missing')
        return
      }

      const dataToSave = {
        ...formData,
        patient_id: patientId
      }

      if (isAdding) {
        await historyHandlers.onCreate(dataToSave)
      } else {
        await historyHandlers.onUpdate({ ...dataToSave, id: editingId })
      }
      handleCancel()
    } catch (error) {
      console.error('Error saving history:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({
      history_type: '',
      description: '',
      onset_date: '',
      severity: '',
      notes: '',
      is_smoker: false,
      pack_years: '',
      is_drinker: false,
      drinking_severity: ''
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medical history record?')) {
      try {
        await historyHandlers.onDelete(id)
      } catch (error) {
        console.error('Error deleting history:', error)
      }
    }
  }

  const SubstanceHistoryFields = ({ type, formData, handleFieldChange }) => {
    const alcoholTypes = [
      { value: 'beer', label: 'Beer' },
      { value: 'wine', label: 'Wine' },
      { value: 'spirits', label: 'Spirits' },
      { value: 'mixed', label: 'Mixed' }
    ]

    const frequencyOptions = [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'occasionally', label: 'Occasionally' }
    ]

    switch (type) {
      case 'smoking':
        return (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Packs Per Day *
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.packs_per_day}
                onChange={(e) => handleFieldChange('packs_per_day', e.target.value)}
                className="w-full"
                placeholder="e.g. 1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Years Smoked *
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.years_smoked}
                onChange={(e) => handleFieldChange('years_smoked', e.target.value)}
                className="w-full"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Pack Years (calculated)
              </Label>
              <Input
                type="text"
                value={formData.pack_years}
                readOnly
                className="w-full bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Quit Date
              </Label>
              <Input
                type="date"
                value={formData.quit_date}
                onChange={(e) => handleFieldChange('quit_date', e.target.value)}
                className="w-full"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </>
        )
      case 'alcohol':
        return (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Drinks Per Week *
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.drinks_per_week}
                onChange={(e) => handleFieldChange('drinks_per_week', e.target.value)}
                className="w-full"
                placeholder="e.g. 14"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Type of Alcohol *
              </Label>
              <Select
                value={formData.alcohol_type}
                onChange={(e) => handleFieldChange('alcohol_type', e.target.value)}
                className="w-full"
              >
                <option value="">Select type...</option>
                {alcoholTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Years of Use
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.alcohol_years}
                onChange={(e) => handleFieldChange('alcohol_years', e.target.value)}
                className="w-full"
                placeholder="e.g. 5"
              />
            </div>
          </>
        )
      case 'narcotics':
        return (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Substance Type *
              </Label>
              <Input
                type="text"
                value={formData.substance_type}
                onChange={(e) => handleFieldChange('substance_type', e.target.value)}
                className="w-full"
                placeholder="e.g. Cannabis"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </Label>
              <Select
                value={formData.frequency}
                onChange={(e) => handleFieldChange('frequency', e.target.value)}
                className="w-full"
              >
                <option value="">Select frequency...</option>
                {frequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Years of Use
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.usage_years}
                onChange={(e) => handleFieldChange('usage_years', e.target.value)}
                className="w-full"
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Last Use Date
              </Label>
              <Input
                type="date"
                value={formData.last_use_date}
                onChange={(e) => handleFieldChange('last_use_date', e.target.value)}
                className="w-full"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  const MedicalHistoryForm = ({ isNew = false }) => {
    const [error, setError] = useState('')
    const historyTypes = [
      { value: 'family', label: 'Family History' },
      { value: 'medical', label: 'Medical History' },
      { value: 'allergy', label: 'Allergy' },
      { value: 'social', label: 'Social History' },
      { value: 'smoking', label: 'Smoking History' },
      { value: 'alcohol', label: 'Alcohol History' },
      { value: 'narcotics', label: 'Narcotics History' }
    ]

    const severityOptions = [
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]

    const validateForm = () => {
      if (!formData.history_type) {
        setError('Please select a history type')
        return false
      }
      if (!formData.description) {
        setError('Please enter a description')
        return false
      }
      if (formData.is_smoker && !formData.pack_years) {
        setError('Please enter pack years for smoking history')
        return false
      }
      if (formData.is_drinker && !formData.drinking_severity) {
        setError('Please select drinking severity')
        return false
      }
      return true
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setError('')

      if (!validateForm()) {
        return
      }

      try {
        await handleSave()
      } catch (err) {
        setError('Failed to save history. Please try again.')
      }
    }

    const handleFieldChange = (field, value) => {
      if (field === 'history_type') {
        // Reset specific fields when changing history type
        setFormData(prev => ({
          ...prev,
          [field]: value,
          // Reset smoking fields
          packs_per_day: '',
          years_smoked: '',
          pack_years: '',
          quit_date: '',
          // Reset alcohol fields
          drinks_per_week: '',
          alcohol_type: '',
          alcohol_years: '',
          // Reset narcotics fields
          substance_type: '',
          frequency: '',
          usage_years: '',
          last_use_date: ''
        }))
      } else if (field === 'packs_per_day' || field === 'years_smoked') {
        // Calculate pack years automatically
        const newValue = parseFloat(value) || 0
        const packs = field === 'packs_per_day' ? newValue : parseFloat(formData.packs_per_day) || 0
        const years = field === 'years_smoked' ? newValue : parseFloat(formData.years_smoked) || 0
        setFormData(prev => ({
          ...prev,
          [field]: value,
          pack_years: (packs * years).toFixed(1)
        }))
      } else {
        setFormData(prev => ({ ...prev, [field]: value }))
      }
      setError('')
    }

    return (
      <Card className="border-blue-200 bg-blue-50/30 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {isNew ? 'Add New Medical History' : 'Edit Medical History'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {isNew ? 'Enter the patient\'s medical history details' : 'Update the medical history information'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">
                  Type *
                </Label>
                <Select
                  value={formData.history_type}
                  onChange={(e) => handleFieldChange('history_type', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select type...</option>
                  {historyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">
                  Onset Date
                </Label>
                <Input
                  type="date"
                  value={formData.onset_date}
                  onChange={(e) => handleFieldChange('onset_date', e.target.value)}
                  className="w-full"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-1">
                  Description *
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={3}
                  className="w-full"
                  placeholder="Enter detailed description..."
                  required
                />
              </div>

              {/* Smoking History Fields */}
              {formData.history_type === 'smoking' && (
                <SubstanceHistoryFields
                  type={formData.history_type}
                  formData={formData}
                  handleFieldChange={handleFieldChange}
                />
              )}

              {/* Alcohol History Fields */}
              {formData.history_type === 'alcohol' && (
                <SubstanceHistoryFields
                  type={formData.history_type}
                  formData={formData}
                  handleFieldChange={handleFieldChange}
                />
              )}

              {/* Narcotics History Fields */}
              {formData.history_type === 'narcotics' && (
                <SubstanceHistoryFields
                  type={formData.history_type}
                  formData={formData}
                  handleFieldChange={handleFieldChange}
                />
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">
                  Severity
                </Label>
                <Select
                  value={formData.severity}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select severity...</option>
                  {severityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">
                  Notes
                </Label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  className="w-full"
                  placeholder="Additional notes..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_smoker}
                    onChange={(e) => handleFieldChange('is_smoker', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Smoker</span>
                </Label>
                {formData.is_smoker && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium text-gray-700 mb-1">
                      Pack Years
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pack_years}
                      onChange={(e) => handleFieldChange('pack_years', e.target.value)}
                      className="w-full"
                      placeholder="e.g. 10"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_drinker}
                    onChange={(e) => handleFieldChange('is_drinker', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Drinker</span>
                </Label>
                {formData.is_drinker && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </Label>
                    <Select
                      value={formData.drinking_severity}
                      onChange={(e) => handleFieldChange('drinking_severity', e.target.value)}
                      className="w-full"
                    >
                      <option value="">Select severity...</option>
                      {severityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.history_type || !formData.description}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isNew ? 'Add History' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  const MedicalHistoryCard = ({ history }) => {
    const Icon = getHistoryIcon(history.history_type)

    return (
      <Card className="hover:shadow-md transition-shadow group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="flex items-center space-x-2">
                <Badge className={getHistoryBadge(history.history_type)}>
                  {history.history_type?.replace('_', ' ').toUpperCase()}
                </Badge>
                {history.severity && (
                  <Badge variant="outline" className="text-xs">
                    {history.severity}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500">
                {formatDate(history.onset_date || history.created_at)}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(history)}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(history.id)}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-900">
              {history.description}
            </div>
            
            {/* Smoking and Drinking Status */}
            <div className="flex gap-3 mt-2">
              {history.is_smoker && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Smoker
                  </Badge>
                  {history.pack_years && (
                    <Badge variant="outline" className="text-xs">
                      {history.pack_years} pack years
                    </Badge>
                  )}
                </div>
              )}
              {history.is_drinker && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Drinker
                  </Badge>
                  {history.drinking_severity && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {history.drinking_severity}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {history.notes && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {history.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl text-gray-900">Medical History & Risk Factors</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive medical, family, and social history
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {histories?.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {histories.length} {histories.length === 1 ? 'record' : 'records'}
                </Badge>
              )}
              <Button
                onClick={handleAddNew}
                disabled={isAdding || editingId}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add History
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {/* Add New Form */}
        {isAdding && (
          <MedicalHistoryForm isNew={true} />
        )}

        {/* Edit Form */}
        {editingId && (
          <MedicalHistoryForm isNew={false} />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* History Cards */}
        {histories?.length > 0 ? (
          <div className="space-y-4">
            {histories.map((history) => (
              <MedicalHistoryCard key={history.id} history={history} />
            ))}
          </div>
        ) : !isLoading && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No medical history recorded yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add the patient's medical, family, and social history to build a comprehensive clinical profile.
              </p>
              <Button onClick={handleAddNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First History Record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Treatment History Section
export function TreatmentHistorySection({ 
  chemotherapy, 
  radiotherapy, 
  surgeries, 
  otherTreatments,
  treatmentHandlers,
  isLoading 
}) {
  const getTreatmentBadge = (response) => {
    const colors = {
      complete_response: 'bg-green-100 text-green-800',
      partial_response: 'bg-blue-100 text-blue-800',
      stable_disease: 'bg-yellow-100 text-yellow-800',
      progressive_disease: 'bg-red-100 text-red-800',
      successful: 'bg-green-100 text-green-800',
      partially_successful: 'bg-yellow-100 text-yellow-800',
      unsuccessful: 'bg-red-100 text-red-800'
    }
    return colors[response] || 'bg-gray-100 text-gray-800'
  }

  const TreatmentTable = ({ data, title, icon: Icon, type }) => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          {title}
          {data?.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {data.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
        ) : data?.length > 0 ? (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.id || index} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-sm">
                      {item.drug_name || item.procedure || item.site || item.name}
                    </div>
                    {item.dose && (
                      <Badge variant="outline" className="text-xs">
                        {item.dose}
                      </Badge>
                    )}
                    {(item.response || item.outcome) && (
                      <Badge className={getTreatmentBadge(item.response || item.outcome)}>
                        {(item.response || item.outcome).replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(item.start_date || item.date)}
                  </div>
                </div>
                {(item.frequency || item.surgeon || item.technique) && (
                  <div className="text-xs text-gray-600 mb-1">
                    {item.frequency || item.surgeon || item.technique}
                  </div>
                )}
                {item.indication && (
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Indication:</span> {item.indication}
                  </div>
                )}
                {(item.side_effects || item.complications) && (
                  <div className="text-xs text-gray-600 bg-red-50 p-2 rounded">
                    <span className="font-medium">Complications:</span> {item.side_effects || item.complications}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No {title.toLowerCase()} recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Beautiful EMR Display */}
      <TreatmentTable 
        data={chemotherapy} 
        title="Previous Chemotherapy" 
        icon={Zap} 
        type="chemotherapy" 
      />
      <TreatmentTable 
        data={radiotherapy} 
        title="Previous Radiotherapy" 
        icon={Target} 
        type="radiotherapy" 
      />
      <TreatmentTable 
        data={surgeries} 
        title="Previous Surgeries" 
        icon={Scissors} 
        type="surgeries" 
      />

      {/* Editable Tables for CRUD Operations */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit className="h-5 w-5 text-green-600" />
            Manage Chemotherapy Treatments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicalEditableTable
            data={chemotherapy}
            fields={chemotherapyFields}
            onAdd={treatmentHandlers.onCreateChemotherapy}
            onUpdate={treatmentHandlers.onUpdateChemotherapy}
            onDelete={treatmentHandlers.onDeleteChemotherapy}
            isLoading={isLoading}
            title="Chemotherapy Treatments"
            addButtonText="Add Chemotherapy"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit className="h-5 w-5 text-green-600" />
            Manage Radiotherapy Treatments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicalEditableTable
            data={radiotherapy}
            fields={radiotherapyFields}
            onAdd={treatmentHandlers.onCreateRadiotherapy}
            onUpdate={treatmentHandlers.onUpdateRadiotherapy}
            onDelete={treatmentHandlers.onDeleteRadiotherapy}
            isLoading={isLoading}
            title="Radiotherapy Treatments"
            addButtonText="Add Radiotherapy"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit className="h-5 w-5 text-green-600" />
            Manage Surgical Procedures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicalEditableTable
            data={surgeries}
            fields={surgeryFields}
            onAdd={treatmentHandlers.onCreateSurgery}
            onUpdate={treatmentHandlers.onUpdateSurgery}
            onDelete={treatmentHandlers.onDeleteSurgery}
            isLoading={isLoading}
            title="Surgical Procedures"
            addButtonText="Add Surgery"
          />
        </CardContent>
      </Card>
    </div>
  )
}



// Lab Results & Tests Section
export function LabResultsSection({ 
  labResults, 
  molecularTests, 
  imagingStudies, 
  testHandlers,
  isLoading 
}) {
  const getResultBadge = (result, normalRange) => {
    if (!result || !normalRange) return 'bg-gray-100 text-gray-800'
    
    // Simple logic for now - can be enhanced
    if (result.toLowerCase().includes('normal') || result.toLowerCase().includes('negative')) {
      return 'bg-green-100 text-green-800'
    } else if (result.toLowerCase().includes('positive') || result.toLowerCase().includes('abnormal')) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  const TestTable = ({ data, title, icon: Icon, type }) => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          {title}
          {data?.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {data.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
        ) : data?.length > 0 ? (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.id || index} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-sm">
                      {item.test_name || item.study_type || item.name}
                    </div>
                    {item.result && (
                      <Badge className={getResultBadge(item.result, item.normal_range)}>
                        {item.result}
                      </Badge>
                    )}
                    {item.status && (
                      <Badge variant="outline" className="text-xs">
                        {item.status}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(item.test_date || item.study_date || item.date)}
                  </div>
                </div>
                {item.value && (
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Value:</span> {item.value}
                    {item.unit && <span className="ml-1">({item.unit})</span>}
                  </div>
                )}
                {item.normal_range && (
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Normal Range:</span> {item.normal_range}
                  </div>
                )}
                {item.findings && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Findings:</span> {item.findings}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No {title.toLowerCase()} recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <TestTable 
        data={labResults} 
        title="Laboratory Results" 
        icon={FlaskConical} 
        type="lab_results" 
      />
      <TestTable 
        data={molecularTests} 
        title="Molecular Tests" 
        icon={Dna} 
        type="molecular_tests" 
      />
      <TestTable 
        data={imagingStudies} 
        title="Imaging Studies" 
        icon={Scan} 
        type="imaging_studies" 
      />
    </div>
  )
}

// Baselines Section
export function BaselinesSection({ baselines, baselineHandlers, isLoading }) {
  return (
    <div className="space-y-6">
      {/* Beautiful EMR Display */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Baselines & Staging
            {baselines?.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {baselines.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : baselines?.length > 0 ? (
            <div className="space-y-4">
              {baselines.map((baseline, index) => (
                <div key={baseline.id || index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-sm">
                        {baseline.diagnosis || baseline.primary_diagnosis || 'Baseline Assessment'}
                      </div>
                      {baseline.ecog_score !== null && baseline.ecog_score !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          ECOG {baseline.ecog_score}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(baseline.assessment_date || baseline.created_at)}
                    </div>
                  </div>
                  
                  {(baseline.tnm_t && baseline.tnm_n && baseline.tnm_m) && (
                    <div className="mb-3">
                      <CancerStageBadge 
                        tnm_t={baseline.tnm_t} 
                        tnm_n={baseline.tnm_n} 
                        tnm_m={baseline.tnm_m} 
                        size="sm"
                      />
                      <span className="text-xs text-gray-500 ml-2">
                        T{baseline.tnm_t} N{baseline.tnm_n} M{baseline.tnm_m}
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {baseline.weight && (
                      <div>
                        <span className="font-medium text-gray-700">Weight:</span> {baseline.weight} kg
                      </div>
                    )}
                    {baseline.height && (
                      <div>
                        <span className="font-medium text-gray-700">Height:</span> {baseline.height} cm
                      </div>
                    )}
                    {baseline.weight && baseline.height && (
                      <div className="flex items-center">
                        <BMIBadge weight={baseline.weight} height={baseline.height} size="sm" />
                      </div>
                    )}
                    {baseline.blood_pressure && (
                      <div>
                        <span className="font-medium text-gray-700">BP:</span> {baseline.blood_pressure}
                      </div>
                    )}
                  </div>
                  
                  {baseline.clinical_notes && (
                    <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {baseline.clinical_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No baselines recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable Table for CRUD Operations */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit className="h-5 w-5 text-green-600" />
            Manage Baseline Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicalEditableTable
            data={baselines}
            fields={baselineFields}
            onAdd={baselineHandlers.onCreate}
            onUpdate={baselineHandlers.onUpdate}
            onDelete={baselineHandlers.onDelete}
            isLoading={isLoading}
            title="Baseline Assessments"
            addButtonText="Add Baseline"
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Consultation Records Section
export function ConsultationRecordsSection({ recordings, recordingHandlers, isLoading }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Consultation Records & Transcripts
          {recordings?.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {recordings.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : recordings?.length > 0 ? (
          <div className="space-y-4">
            {recordings.map((recording, index) => (
              <div key={recording.id || index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-sm">{recording.filename || 'Audio Recording'}</div>
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Consultation
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {formatDate(recording.created_at)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-6"
                      onClick={() => recordingHandlers.onNavigateToDetail(recording.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
                
                {/* AI Summary Section */}
                {recording.summary && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        AI Clinical Summary
                      </Badge>
                    </div>
                    <div className="text-sm text-blue-900 whitespace-pre-wrap">
                      {recording.summary}
                    </div>
                  </div>
                )}
                
                {/* Transcript Preview */}
                {recording.transcript && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">Transcript Preview</span>
                      <span className="text-xs text-gray-500">
                        {recording.transcript.length} characters
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {recording.transcript.length > 200 
                        ? `${recording.transcript.substring(0, 200)}...` 
                        : recording.transcript
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultation records yet</h3>
            <p className="text-gray-500 mb-4">
              Audio recordings and transcripts from patient consultations will appear here.
            </p>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => recordingHandlers.onNavigateToRecord()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Record New Consultation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// History Section
export function HistorySection({ 
  histories, 
  chemotherapy, 
  radiotherapy, 
  surgeries, 
  historyHandlers, 
  treatmentHandlers, 
  isLoading 
}) {
  const [description, setDescription] = useState("")
  const [riskFactors, setRiskFactors] = useState({
    smoking: {
      active: false,
      packYears: "",
      startDate: "",
      quitDate: "",
      notes: ""
    },
    alcohol: {
      active: false,
      frequency: "",
      amount: "",
      startDate: "",
      quitDate: "",
      notes: ""
    },
    narcotics: {
      active: false,
      type: "",
      frequency: "",
      startDate: "",
      quitDate: "",
      notes: ""
    }
  })
  const [treatments, setTreatments] = useState({
    surgeries: surgeries || [],
    chemotherapy: chemotherapy || [],
    radiotherapy: radiotherapy || []
  })
  const [medications, setMedications] = useState([])

  const handleRiskFactorChange = (substance, field, value) => {
    setRiskFactors(prev => ({
      ...prev,
      [substance]: {
        ...prev[substance],
        [field]: value
      }
    }))
  }

  const RiskFactorSection = ({ type, details }) => {
    const fields = {
      smoking: [
        { label: "Pack Years", field: "packYears", type: "number" },
        { label: "Start Date", field: "startDate", type: "date" },
        { label: "Quit Date", field: "quitDate", type: "date" },
        { label: "Notes", field: "notes", type: "textarea", fullWidth: true }
      ],
      alcohol: [
        { label: "Frequency", field: "frequency", type: "select", 
          options: ["Daily", "Weekly", "Monthly", "Occasionally"] },
        { label: "Amount", field: "amount", type: "text" },
        { label: "Start Date", field: "startDate", type: "date" },
        { label: "Quit Date", field: "quitDate", type: "date" },
        { label: "Notes", field: "notes", type: "textarea", fullWidth: true }
      ],
      narcotics: [
        { label: "Type", field: "type", type: "text" },
        { label: "Frequency", field: "frequency", type: "select",
          options: ["Daily", "Weekly", "Monthly", "Occasionally"] },
        { label: "Start Date", field: "startDate", type: "date" },
        { label: "Quit Date", field: "quitDate", type: "date" },
        { label: "Notes", field: "notes", type: "textarea", fullWidth: true }
      ]
    }

    return (
      <div className="space-y-4">
        <h4 className="text-base font-bold text-gray-900 capitalize">{type}</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {fields[type].map((field) => (
            <div key={field.field} className={`space-y-1.5 ${field.fullWidth ? 'col-span-2' : ''}`}>
              <Label className="text-xs font-medium text-gray-700">{field.label}</Label>
              <div className="bg-gray-50 rounded-md p-2">
                <EditableField
                  value={details[field.field]}
                  onChange={(value) => handleRiskFactorChange(type, field.field, value)}
                  type={field.type}
                  options={field.options?.map(opt => ({ value: opt, label: opt }))}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="hover:bg-white rounded-sm transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Top Left: Description */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 border-b">
          <CardTitle className="text-lg font-bold">Clinical Description</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-gray-50 rounded-md p-3">
            <EditableField
              value={description}
              onChange={setDescription}
              type="textarea"
              placeholder="Enter clinical history description..."
              className="min-h-[200px] text-xs hover:bg-white rounded-sm transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Right: Risk Factors */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 border-b">
          <CardTitle className="text-lg font-bold">Risk Factors</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(riskFactors).map(([type, details]) => (
              <RiskFactorSection
                key={type}
                type={type}
                details={details}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Left: Previous Treatments */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 border-b">
          <CardTitle className="text-lg font-bold">Previous Treatments</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            {/* Surgeries */}
            <div>
              <h4 className="text-base font-bold text-gray-900 mb-3">Surgical History</h4>
              {treatments.surgeries.map((surgery, index) => (
                <div key={surgery.id || index} className="mb-3 bg-gray-50 rounded-md p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-xs font-medium text-gray-700 mb-1">Procedure</Label>
                      <EditableField
                        value={surgery.procedure}
                        onChange={(value) => handleTreatmentChange('surgeries', index, 'procedure', value)}
                        placeholder="Enter procedure"
                        className="hover:bg-white rounded-sm transition-colors"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-1">Date</Label>
                      <span className="text-xs text-gray-600">{surgery.date}</span>
                    </div>
                  </div>
                  {surgery.surgeon && (
                    <div className="mt-2">
                      <Label className="text-xs font-medium text-gray-700 mb-1">Surgeon</Label>
                      <EditableField
                        value={surgery.surgeon}
                        onChange={(value) => handleTreatmentChange('surgeries', index, 'surgeon', value)}
                        placeholder="Enter surgeon name"
                        className="hover:bg-white rounded-sm transition-colors"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Right: Medications */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Current Medications</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMedications([...medications, {
              name: '',
              dose: '',
              frequency: '',
              route: ''
            }])}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="bg-gray-50 rounded-md p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Medication</Label>
                    <EditableField
                      value={med.name}
                      onChange={(value) => {
                        const newMeds = [...medications]
                        newMeds[index] = { ...med, name: value }
                        setMedications(newMeds)
                      }}
                      placeholder="Enter medication name"
                      className="hover:bg-white rounded-sm transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Dose</Label>
                    <EditableField
                      value={med.dose}
                      onChange={(value) => {
                        const newMeds = [...medications]
                        newMeds[index] = { ...med, dose: value }
                        setMedications(newMeds)
                      }}
                      placeholder="Enter dose"
                      className="hover:bg-white rounded-sm transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Frequency</Label>
                    <EditableField
                      value={med.frequency}
                      onChange={(value) => {
                        const newMeds = [...medications]
                        newMeds[index] = { ...med, frequency: value }
                        setMedications(newMeds)
                      }}
                      placeholder="Enter frequency"
                      className="hover:bg-white rounded-sm transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Route</Label>
                    <EditableField
                      value={med.route}
                      type="select"
                      options={[
                        { value: "oral", label: "Oral" },
                        { value: "iv", label: "IV" },
                        { value: "im", label: "IM" },
                        { value: "sc", label: "SC" },
                        { value: "topical", label: "Topical" }
                      ]}
                      onChange={(value) => {
                        const newMeds = [...medications]
                        newMeds[index] = { ...med, route: value }
                        setMedications(newMeds)
                      }}
                      placeholder="Select route"
                      className="hover:bg-white rounded-sm transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const EMRClinicalSections = ({ 
  patientId, 
  patient,
  allMedicalData = {},
  onUpdateHistory,
  onCreateHistory,
  onDeleteHistory,
  onUpdateSurgery,
  onCreateSurgery,
  onDeleteSurgery,
  onUpdateMedication,
  onCreateMedication,
  onDeleteMedication,
  onUpdateChemotherapy,
  onCreateChemotherapy,
  onDeleteChemotherapy,
  onUpdateRadiotherapy,
  onCreateRadiotherapy,
  onDeleteRadiotherapy,
  onUpdateOtherTreatment,
  onCreateOtherTreatment,
  onDeleteOtherTreatment,
  isLoading = false 
}) => {
  const [clinicalNotes, setClinicalNotes] = useState(patient?.clinical_notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  // Update clinical notes when patient data changes
  useEffect(() => {
    setClinicalNotes(patient?.clinical_notes || '')
  }, [patient?.clinical_notes])

  // Extract data from allMedicalData
  const histories = allMedicalData.histories || []
  const surgeries = allMedicalData.surgeries || []
  const medications = allMedicalData.medications || []
  const chemotherapy = allMedicalData.chemotherapy || []
  const radiotherapy = allMedicalData.radiotherapy || []
  const otherTreatments = allMedicalData.other_treatments || []

  // Group histories by type for risk factors
  const historiesByType = histories.reduce((acc, history) => {
    const type = history.history_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(history)
    return acc
  }, {})

  // Calculate summary statistics
  const getOverviewStats = () => {
    const smokingHistory = historiesByType.smoking || []
    const familyHistory = historiesByType.family || []
    const activeMedications = medications.filter(med => !med.end_date || new Date(med.end_date) > new Date())
    
    const riskFactors = []
    
    // Smoking risk
    smokingHistory.forEach(smoking => {
      if (smoking.pack_years && smoking.pack_years > 20) {
        riskFactors.push({
          type: 'High Smoking Risk',
          value: `${smoking.pack_years} pack-years`,
          color: 'bg-red-100 text-red-800'
        })
      }
    })
    
    // Family history risk
    if (familyHistory.length > 0) {
      const cancerHistory = familyHistory.filter(h => 
        h.description && h.description.toLowerCase().includes('cancer')
      )
      if (cancerHistory.length > 0) {
        riskFactors.push({
          type: 'Family Cancer History',
          value: `${cancerHistory.length} relative(s)`,
          color: 'bg-orange-100 text-orange-800'
        })
      }
    }
    
    // Polypharmacy
    if (activeMedications.length > 5) {
      riskFactors.push({
        type: 'Polypharmacy',
        value: `${activeMedications.length} medications`,
        color: 'bg-yellow-100 text-yellow-800'
      })
    }
    
    return {
      totalHistories: histories.length,
      totalSurgeries: surgeries.length,
      totalMedications: medications.length,
      activeMedications: activeMedications.length,
      totalChemotherapy: chemotherapy.length,
      totalRadiotherapy: radiotherapy.length,
      totalOtherTreatments: otherTreatments.length,
      riskFactors
    }
  }

  const stats = getOverviewStats()

  const handleSaveNotes = async () => {
    try {
      // Save clinical notes directly to patient record  
      const API_BASE_URL = "http://localhost:8000"
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          clinical_notes: clinicalNotes 
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        
        // If clinical_notes field doesn't exist, provide helpful instruction
        if (response.status === 400 && errorText.includes('clinical_notes')) {
          throw new Error('Clinical notes field not found in database. Please add a "clinical_notes" column (text type) to your patients table in Supabase.')
        }
        throw new Error(`Failed to save clinical notes (${response.status})`)
      }
      
      setIsEditingNotes(false)
      // Refresh will happen via useEffect when patient data updates
      window.location.reload() // Simple refresh for now
    } catch (error) {
      console.error('Error saving clinical notes:', error)
      alert('Error: ' + error.message + '\n\nTo fix: Add a "clinical_notes" column (text type) to your patients table in Supabase.')
    }
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="risk-factors" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Risk Factors
          </TabsTrigger>
          <TabsTrigger value="surgeries" className="flex items-center gap-1">
            <Scissors className="h-4 w-4" />
            Surgeries ({stats.totalSurgeries})
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-1">
            <Pill className="h-4 w-4" />
            Medications ({stats.activeMedications})
          </TabsTrigger>
          <TabsTrigger value="chemotherapy" className="flex items-center gap-1">
            <FlaskConical className="h-4 w-4" />
            Chemotherapy ({stats.totalChemotherapy})
          </TabsTrigger>
          <TabsTrigger value="radiotherapy" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Radiotherapy ({stats.totalRadiotherapy})
          </TabsTrigger>
          <TabsTrigger value="other-treatments" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Other Treatments ({stats.totalOtherTreatments})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Statistics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Medical History Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalHistories}</div>
                    <div className="text-sm text-blue-600">History Records</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.totalSurgeries}</div>
                    <div className="text-sm text-green-600">Surgeries</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.activeMedications}</div>
                    <div className="text-sm text-purple-600">Active Medications</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.totalChemotherapy + stats.totalRadiotherapy + stats.totalOtherTreatments}
                    </div>
                    <div className="text-sm text-orange-600">Cancer Treatments</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.riskFactors.length > 0 ? (
                  <div className="space-y-2">
                    {stats.riskFactors.map((risk, index) => (
                      <Badge key={index} className={risk.color}>
                        {risk.type}: {risk.value}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No significant risk factors identified</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Clinical Notes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Clinical Notes
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {isEditingNotes ? 'Cancel' : (patient?.clinical_notes ? 'Edit Notes' : 'Add Notes')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clinical-notes">Clinical Notes</Label>
                    <Textarea
                      id="clinical-notes"
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="Enter clinical notes, observations, assessments, or other relevant information..."
                      rows={8}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNotes} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save Notes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditingNotes(false)
                        setClinicalNotes(patient?.clinical_notes || '')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {patient?.clinical_notes ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {patient.clinical_notes}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No clinical notes yet. Click "Add Notes" to start documenting.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Factors Tab */}
        <TabsContent value="risk-factors">
          <RiskFactorsSection
            patientId={patientId}
            histories={historiesByType}
            onUpdate={onUpdateHistory}
            onCreate={onCreateHistory}
            onDelete={onDeleteHistory}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Surgeries Tab */}
        <TabsContent value="surgeries">
          <SurgeriesSection
            patientId={patientId}
            surgeries={surgeries}
            onUpdate={onUpdateSurgery}
            onCreate={onCreateSurgery}
            onDelete={onDeleteSurgery}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications">
          <MedicationsSection
            patientId={patientId}
            medications={medications}
            onUpdate={onUpdateMedication}
            onCreate={onCreateMedication}
            onDelete={onDeleteMedication}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Chemotherapy Tab */}
        <TabsContent value="chemotherapy">
          <ChemotherapySection
            patientId={patientId}
            chemotherapy={chemotherapy}
            onUpdate={onUpdateChemotherapy}
            onCreate={onCreateChemotherapy}
            onDelete={onDeleteChemotherapy}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Radiotherapy Tab */}
        <TabsContent value="radiotherapy">
          <RadiotherapySection
            patientId={patientId}
            radiotherapy={radiotherapy}
            onUpdate={onUpdateRadiotherapy}
            onCreate={onCreateRadiotherapy}
            onDelete={onDeleteRadiotherapy}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Other Treatments Tab */}
        <TabsContent value="other-treatments">
          <OtherTreatmentsSection
            patientId={patientId}
            otherTreatments={otherTreatments}
            onUpdate={onUpdateOtherTreatment}
            onCreate={onCreateOtherTreatment}
            onDelete={onDeleteOtherTreatment}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EMRClinicalSections 