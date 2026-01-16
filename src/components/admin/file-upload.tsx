'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Upload, X, FileIcon, CheckCircle2, Loader2 } from 'lucide-react'


interface FileUploadProps {
    onUploadComplete: (url: string) => void
    accept?: string
    label?: string
}

export function FileUpload({ onUploadComplete, accept = "image/*,video/*,.pdf", label = "Upload File" }: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            setError(null)
            setFileName(file.name)

            const supabase = createBrowserClient()
            const fileExt = file.name.split('.').pop()
            const filePath = `${Math.random()}.${fileExt}`

            const { data, error: uploadError } = await supabase.storage
                .from('course-content')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('course-content')
                .getPublicUrl(filePath)

            onUploadComplete(publicUrl)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Error uploading file')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        <p className="text-sm text-gray-500">Uploading {fileName}...</p>
                    </div>
                ) : fileName && !error ? (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-8 w-8" />
                        <p className="text-sm font-medium">Uploaded: {fileName}</p>
                        <button
                            type="button"
                            onClick={() => { setFileName(null); setError(null) }}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Change File
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">{accept.replace(/\*/g, '')}</p>
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleUpload}
                            accept={accept}
                        />
                    </>
                )}
                {error && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
                )}
            </div>
        </div>
    )
}
