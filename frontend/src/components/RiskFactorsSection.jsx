import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Cigarette, 
  Wine, 
  Users, 
  AlertTriangle,
  Edit3,
  Trash2,
  Save,
  X,
  Calculator,
  Calendar,
  TrendingUp
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
import { cn } from '@/lib/utils'
import { 
  smokingHistoryFields, 
  alcoholHistoryFields, 
  familyHistoryFields,
  calculatePackYears,
  getRiskLevel,
  formatDate
} from '@/config/fieldConfigs'

const RiskFactorsSection = ({ 
  patientId, 
  histories = {}, 
  onUpdate, 
  onCreate, 
  onDelete, 
  isLoading = false 
}) => {
  const [activeRiskFactor, setActiveRiskFactor] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [showAddDialog, setShowAddDialog] = useState(null)

  // Get histories by type
  const smokingHistory = histories.smoking || []
  const alcoholHistory = histories.alcohol || []
  const familyHistory = histories.family || []
  const allergyHistory = histories.allergy || []

  // Calculate pack years automatically
  useEffect(() => {
    if (formData.packs_per_day && formData.years_smoked) {
      const packYears = calculatePackYears(formData.packs_per_day, formData.years_smoked)
      setFormData(prev => ({ ...prev, pack_years: packYears }))
    }
  }, [formData.packs_per_day, formData.years_smoked])

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type })
    setFormData(item)
  }

  const handleSave = async () => {
    try {
      if (editingItem.id) {
        // Pass the complete object with ID for updates
        await onUpdate({ ...formData, id: editingItem.id })
      } else {
        const dataWithPatientId = { ...formData, patient_id: patientId }
        await onCreate(dataWithPatientId)
      }
      setEditingItem(null)
      setFormData({})
      setShowAddDialog(null)
    } catch (error) {
      console.error('Error saving risk factor:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this risk factor?')) {
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Error deleting risk factor:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setFormData({})
    setShowAddDialog(null)
  }

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const shouldShowField = (field, currentData) => {
    // Simplified - always show fields since we removed conditional logic
    return true
  }

  const renderFormField = (field, value, onChange) => {
    if (!shouldShowField(field, formData)) return null

    const commonProps = {
      id: field.key,
      value: value || '',
      onChange: (e) => onChange(field.key, e.target.value),
      className: "w-full",
      disabled: field.readonly
    }

    switch (field.type) {
      case 'select':
        return (
          <select 
            value={value || ''} 
            onChange={(e) => onChange(field.key, e.target.value)}
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
            placeholder={field.placeholder}
            rows={3}
          />
        )
      case 'number':
        return (
          <Input 
            {...commonProps}
            type="number"
            step={field.step}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
          />
        )
      case 'date':
        return (
          <Input 
            {...commonProps}
            type="date"
          />
        )
      case 'hidden':
        return null
      default:
        return (
          <Input 
            {...commonProps}
            type="text"
            placeholder={field.placeholder}
          />
        )
    }
  }

  const renderEditForm = (fields, title) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => {
          if (field.type === 'hidden') return null
          return (
            <div key={field.key} className={cn(
              shouldShowField(field, formData) ? 'block' : 'hidden'
            )}>
              <Label htmlFor={field.key} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.calculated && <Calculator className="inline h-3 w-3 ml-1 text-blue-500" />}
              </Label>
              {renderFormField(field, formData[field.key], handleFieldChange)}
            </div>
          )
        })}
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

  // Risk Factor Card Component
  const RiskFactorCard = ({ title, icon: Icon, data, type, color, emptyMessage, fields }) => {
    const hasData = data && data.length > 0

    return (
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon className={cn("h-5 w-5", color)} />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{data?.length || 0} entries</Badge>
              <Dialog open={showAddDialog === type} onOpenChange={(open) => setShowAddDialog(open ? type : null)}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add {title}</DialogTitle>
                  </DialogHeader>
                  {renderEditForm(fields, `New ${title}`)}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="space-y-3">
              {data.map(item => (
                <RiskFactorItem 
                  key={item.id} 
                  item={item} 
                  type={type} 
                  onEdit={() => handleEdit(item, type)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>{emptyMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Risk Factor Item Component
  const RiskFactorItem = ({ item, type, onEdit, onDelete }) => {
    const getRiskDisplay = () => {
      switch (type) {
        case 'smoking':
          if (item.pack_years) {
            const risk = getRiskLevel('smoking', item.pack_years)
            return (
              <Badge className={cn("text-xs", risk.color)}>
                {item.pack_years} pack-years ({risk.level} risk)
              </Badge>
            )
          }
          break
        case 'alcohol':
          if (item.drinks_per_week) {
            const risk = getRiskLevel('alcohol', item.drinks_per_week)
            return (
              <Badge className={cn("text-xs", risk.color)}>
                {item.drinks_per_week} drinks/week ({risk.level} risk)
              </Badge>
            )
          }
          break
        case 'family':
          return (
            <Badge variant="outline" className="text-xs">
              {item.relation} - {item.condition}
            </Badge>
          )
        default:
          return null
      }
    }

    return (
      <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {type === 'smoking' && (
                <span className="text-sm font-medium">
                  {item.current_smoker === 'current' ? 'Current Smoker' : 
                   item.current_smoker === 'former' ? 'Former Smoker' : 'Never Smoked'}
                </span>
              )}
              {type === 'alcohol' && (
                <span className="text-sm font-medium">
                  {item.current_drinker === 'current' ? 'Current Drinker' : 
                   item.current_drinker === 'former' ? 'Former Drinker' : 'Never Drinks'}
                </span>
              )}
              {type === 'family' && (
                <span className="text-sm font-medium">
                  {item.condition}
                </span>
              )}
              {getRiskDisplay()}
            </div>

            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {item.onset_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Started: {formatDate(item.onset_date)}
                </span>
              )}
              {item.quit_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Quit: {formatDate(item.quit_date)}
                </span>
              )}
              {type === 'family' && item.age_of_onset && (
                <span>Age at diagnosis: {item.age_of_onset}</span>
              )}
            </div>
          </div>

          <div className="flex gap-1 ml-4">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Edit Form Modal */}
      {editingItem && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            {editingItem.type === 'smoking' && renderEditForm(smokingHistoryFields, 'Edit Smoking History')}
            {editingItem.type === 'alcohol' && renderEditForm(alcoholHistoryFields, 'Edit Alcohol History')}
            {editingItem.type === 'family' && renderEditForm(familyHistoryFields, 'Edit Family History')}
          </CardContent>
        </Card>
      )}

      {/* Risk Factor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskFactorCard
          title="Smoking History"
          icon={Cigarette}
          data={smokingHistory}
          type="smoking"
          color="text-red-500"
          emptyMessage="No smoking history recorded"
          fields={smokingHistoryFields}
        />

        <RiskFactorCard
          title="Alcohol History"
          icon={Wine}
          data={alcoholHistory}
          type="alcohol"
          color="text-purple-500"
          emptyMessage="No alcohol history recorded"
          fields={alcoholHistoryFields}
        />
      </div>

      <RiskFactorCard
        title="Family History"
        icon={Users}
        data={familyHistory}
        type="family"
        color="text-blue-500"
        emptyMessage="No family history recorded"
        fields={familyHistoryFields}
      />

      {allergyHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allergyHistory.map(allergy => (
                <div key={allergy.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{allergy.description}</p>
                    {allergy.severity && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {allergy.severity} severity
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(allergy, 'allergy')}>
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(allergy.id)} className="text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Alert */}
      {(smokingHistory.length > 0 || alcoholHistory.length > 0 || familyHistory.length > 0) && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Risk Factor Summary:</p>
              <div className="text-sm text-gray-600">
                {smokingHistory.length > 0 && smokingHistory[0].pack_years && (
                  <p>• Smoking: {smokingHistory[0].pack_years} pack-years 
                    ({getRiskLevel('smoking', smokingHistory[0].pack_years).level} risk)</p>
                )}
                {alcoholHistory.length > 0 && alcoholHistory[0].drinks_per_week && (
                  <p>• Alcohol: {alcoholHistory[0].drinks_per_week} drinks/week 
                    ({getRiskLevel('alcohol', alcoholHistory[0].drinks_per_week).level} risk)</p>
                )}
                {familyHistory.length > 0 && (
                  <p>• Family History: {familyHistory.length} condition(s) in family</p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default RiskFactorsSection 