import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Reusable component for displaying clinical metrics as colored badges
 */
export function ClinicalBadge({ 
  label, 
  value, 
  category, 
  color = 'bg-gray-100 text-gray-800',
  size = 'sm',
  className = '',
  icon = null 
}) {
  if (!value && value !== 0) return null
  
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {icon && <span className="text-sm">{icon}</span>}
      <Badge 
        variant="secondary" 
        className={cn(
          'font-medium',
          color,
          size === 'xs' && 'text-xs px-1 py-0',
          size === 'sm' && 'text-xs px-2 py-1',
          size === 'md' && 'text-sm px-3 py-1'
        )}
      >
        {label}: {value}
        {category && (
          <span className="ml-1 opacity-80">({category})</span>
        )}
      </Badge>
    </div>
  )
}

/**
 * BMI-specific badge component
 */
export function BMIBadge({ weight, height, size = "default" }) {
  if (!weight || !height) return null
  
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  const roundedBMI = Math.round(bmi * 10) / 10
  
  let category, color
  
  if (bmi < 18.5) {
    category = 'Underweight'
    color = 'bg-blue-100 text-blue-800'
  } else if (bmi < 25) {
    category = 'Normal'
    color = 'bg-green-100 text-green-800'
  } else if (bmi < 30) {
    category = 'Overweight'
    color = 'bg-yellow-100 text-yellow-800'
  } else if (bmi < 35) {
    category = 'Obese Class I'
    color = 'bg-orange-100 text-orange-800'
  } else if (bmi < 40) {
    category = 'Obese Class II'
    color = 'bg-red-100 text-red-800'
  } else {
    category = 'Obese Class III'
    color = 'bg-red-200 text-red-900'
  }
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-2.5 py-1"
  }
  
  return (
    <Badge 
      className={`${color} ${sizeClasses[size]} font-medium border-0`}
    >
      BMI {roundedBMI}
    </Badge>
  )
}

/**
 * Cancer stage badge component
 */
export function CancerStageBadge({ tnm_t, tnm_n, tnm_m, size = "default" }) {
  if (!tnm_t || !tnm_n || !tnm_m) return null
  
  // Simplified staging logic for display
  const t = tnm_t.toLowerCase().replace(/[^\w\d]/g, '')
  const n = tnm_n.toLowerCase().replace(/[^\w\d]/g, '')
  const m = tnm_m.toLowerCase().replace(/[^\w\d]/g, '')
  
  let stage, color
  
  if (m === 'm1') {
    stage = 'Stage IV'
    color = 'bg-red-100 text-red-800'
  } else if (t === 'tis') {
    stage = 'Stage 0'
    color = 'bg-gray-100 text-gray-800'
  } else if (t === 't1' && n === 'n0') {
    stage = 'Stage I'
    color = 'bg-green-100 text-green-800'
  } else if ((t === 't2' && n === 'n0') || (t === 't1' && n === 'n1')) {
    stage = 'Stage II'
    color = 'bg-blue-100 text-blue-800'
  } else if (t === 't3' || n === 'n2' || n === 'n3') {
    stage = 'Stage III'
    color = 'bg-yellow-100 text-yellow-800'
  } else {
    stage = `T${tnm_t} N${tnm_n} M${tnm_m}`
    color = 'bg-gray-100 text-gray-600'
  }
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1", 
    default: "text-sm px-2.5 py-1"
  }
  
  return (
    <Badge 
      className={`${color} ${sizeClasses[size]} font-medium border-0`}
    >
      {stage}
    </Badge>
  )
}

/**
 * Pack-years badge component - Enhanced to support structured data
 */
export function PackYearsBadge({ description, packsPerDay, yearsSmoked, packYears, size = "default" }) {
  // Priority: Use structured data if available, otherwise parse description
  let calculatedPackYears = packYears
  
  if (!calculatedPackYears && packsPerDay && yearsSmoked) {
    calculatedPackYears = parseFloat(packsPerDay) * parseInt(yearsSmoked)
  }
  
  if (!calculatedPackYears && description) {
    const text = description.toLowerCase()
    
    // Look for pack-years pattern first
    const packYearMatch = text.match(/(\d+(?:\.\d+)?)\s*pack[\s-]*years?/)
    if (packYearMatch) {
      calculatedPackYears = parseFloat(packYearMatch[1])
    } else {
      // Try to extract packs per day and years
      const packsMatch = text.match(/(\d+(?:\.\d+)?)\s*packs?\s*per\s*day/)
      const yearsMatch = text.match(/(\d+)\s*years?/)
      
      if (packsMatch && yearsMatch) {
        const packs = parseFloat(packsMatch[1])
        const years = parseInt(yearsMatch[1])
        calculatedPackYears = packs * years
      }
    }
  }
  
  if (!calculatedPackYears) return null
  
  return formatPackYearsBadge(calculatedPackYears, size)
}

/**
 * Smoking risk badge component - Uses structured data
 */
export function SmokingRiskBadge({ packsPerDay, yearsSmoked, packYears, size = "default" }) {
  // Calculate pack years if not provided
  let calculatedPackYears = packYears
  if (!calculatedPackYears && packsPerDay && yearsSmoked) {
    calculatedPackYears = parseFloat(packsPerDay) * parseInt(yearsSmoked)
  }
  
  if (!calculatedPackYears) return null
  
  const rounded = Math.round(calculatedPackYears * 10) / 10
  
  let color, risk, icon
  if (calculatedPackYears < 10) {
    color = 'bg-green-100 text-green-800'
    risk = 'Light'
    icon = '🟢'
  } else if (calculatedPackYears < 20) {
    color = 'bg-yellow-100 text-yellow-800'
    risk = 'Moderate'
    icon = '🟡'
  } else if (calculatedPackYears < 30) {
    color = 'bg-orange-100 text-orange-800'
    risk = 'Heavy'
    icon = '🟠'
  } else {
    color = 'bg-red-100 text-red-800'
    risk = 'Very Heavy'
    icon = '🔴'
  }
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-2.5 py-1"
  }
  
  return (
    <Badge 
      className={`${color} ${sizeClasses[size]} font-medium border-0`}
    >
      {icon} {risk} ({rounded} pack-years)
    </Badge>
  )
}

function formatPackYearsBadge(packYears, size) {
  const rounded = Math.round(packYears * 10) / 10
  
  let color, risk
  if (packYears < 10) {
    color = 'bg-green-100 text-green-800'
    risk = 'Light'
  } else if (packYears < 20) {
    color = 'bg-yellow-100 text-yellow-800'
    risk = 'Moderate'
  } else if (packYears < 30) {
    color = 'bg-orange-100 text-orange-800'
    risk = 'Heavy'
  } else {
    color = 'bg-red-100 text-red-800'
    risk = 'Very Heavy'
  }
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-2.5 py-1"
  }
  
  return (
    <Badge 
      className={`${color} ${sizeClasses[size]} font-medium border-0`}
    >
      {rounded} pack-years ({risk})
    </Badge>
  )
} 