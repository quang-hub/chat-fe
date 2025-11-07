"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, AlertCircle } from "lucide-react"

interface FileFormProps {
  onSubmit: (file: File, description: string) => void
}

export default function FileForm({ onSubmit }: FileFormProps) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
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

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFile(files[0])
      setError("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) {
      setError("Vui lòng nhập nội dung")
      return
    }

    if (!file) {
      setError("Vui lòng chọn file")
      return
    }

    setLoading(true)
    try {
      await onSubmit(file, text)
      setText("")
      setFile(null)
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
        <label htmlFor="text" className="block text-sm font-medium text-slate-700">
          Mô tả
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập mô tả hoặc nội dung thêm..."
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          disabled={loading}
        />
      </div>

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
          } ${file ? "bg-blue-50" : "bg-slate-50"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
            disabled={loading}
          />

          <div className="text-center">
            <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragActive ? "text-blue-600" : "text-slate-400"}`} />

            {file ? (
              <div>
                <p className="text-sm font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-900">Kéo file vào đây hoặc click để chọn</p>
                <p className="text-xs text-slate-500 mt-1">Hỗ trợ tất cả các loại file</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {loading ? "Đang gửi..." : "Gửi File"}
      </button>
    </form>
  )
}
