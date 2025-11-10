"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, AlertCircle, X } from "lucide-react"

interface FileFormProps {
  onSubmit: (files: File[]) => void
}

export default function FileForm({ onSubmit }: FileFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [isDragActive, setIsDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles])
      setError("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
      setError("")
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      setError("Vui lòng chọn ít nhất một file")
      return
    }

    setLoading(true)
    try {
      await onSubmit(files)
      setFiles([])
      setError("")
    } catch (err) {
      setError("Có lỗi xảy ra khi gửi file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Gửi File</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Chọn file</label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${loading ? "cursor-not-allowed" : "cursor-pointer"} ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
          } ${files.length > 0 ? "bg-blue-50" : "bg-slate-50"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
            disabled={loading}
            multiple
          />

          <div className="text-center">
            <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragActive ? "text-blue-600" : "text-slate-400"}`} />

            {files.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-slate-900">{files.length} file được chọn</p>
                <p className="text-xs text-slate-500 mt-1">Click để thêm file khác</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-900">Kéo file vào đây hoặc click để chọn</p>
                <p className="text-xs text-slate-500 mt-1">Hỗ trợ nhiều file cùng lúc</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Danh sách file ({files.length})</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || files.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {loading ? "Đang gửi..." : `Gửi ${files.length} file`}
      </button>
    </form>
  )
}
