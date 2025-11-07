"use client"

import type React from "react"
import { useState } from "react"
import { Send, AlertCircle } from "lucide-react"

interface TextFormProps {
  onSubmit: (text: string) => void
}

export default function TextForm({ onSubmit }: TextFormProps) {
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) {
      setError("Vui lòng nhập nội dung")
      return
    }

    setLoading(true)
    try {
      await onSubmit(text)
      setText("")
      setError("")
    } catch (err) {
      setError("Có lỗi xảy ra khi gửi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Gửi Text</h3>

      <div className="space-y-2">
        <label htmlFor="text" className="block text-sm font-medium text-slate-700">
          Nội dung
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập nội dung text của bạn..."
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={8}
          disabled={loading}
        />
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
        <Send className="w-4 h-4" />
        {loading ? "Đang gửi..." : "Gửi Text"}
      </button>
    </form>
  )
}
