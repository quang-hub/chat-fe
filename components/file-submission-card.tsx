"use client"

import { Trash2, FileText, Download } from "lucide-react"

interface Submission {
  id: number
  text: string
  fileName: string
  fileSize: number | string
  uploadedAt: string
}

interface FileSubmissionCardProps {
  submission: Submission
  onDelete: () => void
}

export default function FileSubmissionCard({ submission, onDelete }: FileSubmissionCardProps) {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()

    const iconClass = "w-8 h-8"

    switch (ext) {
      case "pdf":
        return <div className="text-red-500 font-bold text-sm">PDF</div>
      case "doc":
      case "docx":
        return <div className="text-blue-500 font-bold text-sm">DOC</div>
      case "xls":
      case "xlsx":
        return <div className="text-green-500 font-bold text-sm">XLS</div>
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <div className="text-purple-500 font-bold text-sm">IMG</div>
      case "mp4":
      case "avi":
      case "mov":
        return <div className="text-orange-500 font-bold text-sm">VID</div>
      default:
        return <FileText className={`${iconClass} text-slate-400`} />
    }
  }

  const handleDownload = () => {
    const fileName = submission.text.split("/").pop();
    const fileUrl = process.env.NEXT_PUBLIC_API_BASE_URL + "/api/download/" + fileName;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
      {/* File Icon */}
      <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
        {getFileIcon(submission.fileName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-900 truncate mb-1">{submission.fileName}</h4>
        {/* <p className="text-xs text-slate-500 mb-2 line-clamp-1">{submission.}</p> */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{submission.uploadedAt}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownload}
          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
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
