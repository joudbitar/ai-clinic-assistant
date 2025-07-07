import { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function AvatarUpload() {
  const { watch, setValue } = useFormContext()
  const [isUploading, setIsUploading] = useState(false)
  const avatarUrl = watch('avatarUrl')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setIsUploading(true)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setValue('avatarUrl', publicUrl)
      toast.success('Avatar uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }, [setValue])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1
  })

  const handleRemove = async () => {
    try {
      if (avatarUrl) {
        // Extract file name from URL
        const fileName = avatarUrl.split('/').pop()
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('avatars')
          .remove([fileName])

        if (error) throw error
      }

      setValue('avatarUrl', '')
      toast.success('Avatar removed')
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove avatar')
    }
  }

  return (
    <div className="space-y-2">
      <Label>Profile Picture</Label>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {watch('fullName')?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>

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

          {avatarUrl && (
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