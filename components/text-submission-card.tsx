"use client"

import { Trash2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface TextSubmission {
  id: number
  text: string
  submittedAt: string
}

interface TextSubmissionCardProps {
  submission: TextSubmission
  onDelete: () => void
}

export default function TextSubmissionCard({ submission, onDelete }: TextSubmissionCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(submission.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 mb-2">{submission.text}</p>
        <p className="text-xs text-slate-500">{submission.submittedAt}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Copy"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
