import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AvatarUpload } from './AvatarUpload'

export function UserProfileSection() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-8">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              aria-describedby="fullName-error"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive" id="fullName-error">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="credentials">Credentials</Label>
            <Input
              id="credentials"
              {...register('credentials')}
              placeholder="MD, PhD, etc."
              aria-describedby="credentials-error"
            />
            {errors.credentials && (
              <p className="text-sm text-destructive" id="credentials-error">
                {errors.credentials.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              {...register('licenseNumber')}
              aria-describedby="licenseNumber-error"
            />
            {errors.licenseNumber && (
              <p className="text-sm text-destructive" id="licenseNumber-error">
                {errors.licenseNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="w-48">
          <AvatarUpload />
        </div>
      </div>
    </div>
  )
} 