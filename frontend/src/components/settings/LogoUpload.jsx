import { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function LogoUpload() {
  const { watch, setValue } = useFormContext()
  const [isUploading, setIsUploading] = useState(false)
  const logoUrl = watch('logoUrl')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setIsUploading(true)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      setValue('logoUrl', publicUrl)
      toast.success('Logo uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }, [setValue])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1
  })

  const handleRemove = async () => {
    try {
      if (logoUrl) {
        // Extract file name from URL
        const fileName = logoUrl.split('/').pop()
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('logos')
          .remove([fileName])

        if (error) throw error
      }

      setValue('logoUrl', '')
      toast.success('Logo removed')
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove logo')
    }
  }

  return (
    <div className="space-y-2">
      <Label>Clinic Logo</Label>
      <div className="flex flex-col items-center gap-4">
        {logoUrl ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
            <img
              src={logoUrl}
              alt="Clinic Logo"
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        <div className="flex gap-2">
          <div
            {...getRootProps()}
            className={`
              relative cursor-pointer rounded-lg border-2 border-dashed p-2
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted'}
            `}
          >
            <input {...getInputProps()} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="pointer-events-none"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>

          {logoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Drag & drop or click to upload. Max 5MB.
        </p>
      </div>
    </div>
  )
} 