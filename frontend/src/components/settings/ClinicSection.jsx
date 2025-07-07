import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogoUpload } from './LogoUpload'

export function ClinicSection() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-8">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input
              id="clinicName"
              {...register('clinicName')}
              aria-describedby="clinicName-error"
            />
            {errors.clinicName && (
              <p className="text-sm text-destructive" id="clinicName-error">
                {errors.clinicName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              aria-describedby="address-error"
            />
            {errors.address && (
              <p className="text-sm text-destructive" id="address-error">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                aria-describedby="phone-error"
              />
              {errors.phone && (
                <p className="text-sm text-destructive" id="phone-error">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                {...register('taxId')}
                aria-describedby="taxId-error"
              />
              {errors.taxId && (
                <p className="text-sm text-destructive" id="taxId-error">
                  {errors.taxId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-48">
          <LogoUpload />
        </div>
      </div>
    </div>
  )
} 