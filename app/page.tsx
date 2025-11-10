"use client"

import { useEffect, useState, useMemo } from "react"
import { Upload, File, FileText } from "lucide-react"
import TextForm from "@/components/text-form"
import FileForm from "@/components/file-form"
import TextSubmissionCard from "@/components/text-submission-card"
import FileSubmissionCard from "@/components/file-submission-card"
import { connectStomp } from "@/lib/ws"

export type MsgType = "TEXT" | "FILE"

export interface Message {
  id: number | string
  type: MsgType
  content: string
  createdAt?: string
  other?: string | null
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"text" | "file">("text")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "", [])
  const messagesEndpoint = useMemo(
    () => process.env.NEXT_PUBLIC_MESSAGES_API_ENDPOINT || "/api/messages",
    []
  )
  const textEndpoint = useMemo(
    () => process.env.NEXT_PUBLIC_TEXT_API_ENDPOINT || "/api/text",
    []
  )
  const fileEndpoint = useMemo(
    () => process.env.NEXT_PUBLIC_FILE_API_ENDPOINT || "/api/file",
    []
  )
  const deleteBase = useMemo(
    () => process.env.NEXT_PUBLIC_DELETE_API_ENDPOINT || "/api",
    []
  )

  // Initial fetch + connect WS
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${apiBase}${messagesEndpoint}`)
        const data = await res.json()
        setMessages(data)
      } catch (e) {
        console.error("Fetch messages failed:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    const client = connectStomp({
      baseUrl: apiBase,
      onConnect: () => setWsConnected(true),
      onDisconnect: () => setWsConnected(false),
      onMessage: (msg) => setMessages((prev) => [msg, ...prev]),
      onDelete: (id) =>
        setMessages((prev) => prev.filter((m) => String(m.id) !== String(id))),
    })

    return () => {
      try {
        client?.deactivate()
      } catch {}
    }
  }, [apiBase, messagesEndpoint])

  const handleTextSubmit = async (text: string) => {
    try {
      await fetch(`${apiBase}${textEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, type: "TEXT" }),
        cache: "no-store",
      })
      // KHÔNG setMessages ở đây; đợi WS đẩy vào để đồng bộ id/createdAt
    } catch (e) {
      console.error("Submit text failed:", e)
    }
  }

  const handleFileSubmit = async (selectedFiles: File[]) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const endpoint = process.env.NEXT_PUBLIC_FILE_API_ENDPOINT || "/api/file"

      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${apiBase}${endpoint}`, {
          method: "POST",
          body: formData,
        })
        const data = await response.json()
        // setMessages((prev) => [data, ...prev])
      }
    } catch (error) {
      console.error("Failed to submit file:", error)
    }
  }

  const handleDelete = async (id: number | string) => {
    try {
      await fetch(`${apiBase}${deleteBase}/${id}`, { method: "DELETE" })
      setMessages((prev) => prev.filter((m) => String(m.id) !== String(id)))
    } catch (e) {
      console.error("Delete failed:", e)
      setMessages((prev) => prev.filter((m) => String(m.id) !== String(id)))
    }
  }

  const textMessages = messages.filter((m) => m.type === "TEXT")
  const fileMessages = messages.filter((m) => m.type === "FILE")

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Chia sẻ Text & File</h1>
          <p className="text-slate-600 text-lg">
            Tải lên tài liệu và thông tin của bạn một cách dễ dàng
          </p>
          <div className="mt-3 text-sm">
            Trạng thái realtime:{" "}
            <span className={wsConnected ? "text-green-600" : "text-slate-400"}>
              {wsConnected ? "Đã kết nối" : "Chưa kết nối"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("text")}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "text"
                ? "text-blue-600 border-blue-600"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Text ({textMessages.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "file"
                ? "text-blue-600 border-blue-600"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <File className="w-4 h-4" />
              File ({fileMessages.length})
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === "text" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <TextForm onSubmit={handleTextSubmit} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Lịch sử Text
                </h2>
                <div className="space-y-4">
                  {loading ? (
                    <Loading />
                  ) : textMessages.length > 0 ? (
                    textMessages.map((m) => (
                      <TextSubmissionCard
                        key={m.id}
                        submission={{
                          id: String(m.id),
                          text: m.content,
                          submittedAt: m.createdAt
                            ? new Date(m.createdAt).toLocaleString("vi-VN")
                            : "",
                        }}
                        onDelete={() => handleDelete(m.id)}
                      />
                    ))
                  ) : (
                    <Empty state="text" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <FileForm onSubmit={handleFileSubmit} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <File className="w-5 h-5 text-blue-600" />
                  Lịch sử File
                </h2>
                <div className="space-y-4">
                  {loading ? (
                    <Loading />
                  ) : fileMessages.length > 0 ? (
                    fileMessages.map((m) => (
                      <FileSubmissionCard
                        key={m.id}
                        submission={{
                          id: String(m.id),
                          text: m.content,
                          fileName: m.content.split("/").pop() || "file",
                          fileSize: "0",
                          uploadedAt: m.createdAt
                            ? new Date(m.createdAt).toLocaleString("vi-VN")
                            : "",
                          fileUrl: m.content,
                        }}
                        onDelete={() => handleDelete(m.id)}
                      />
                    ))
                  ) : (
                    <Empty state="file" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Loading() {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full border-2 border-slate-300 border-t-transparent w-8 h-8" />
      <p className="text-slate-500 mt-2">Đang tải...</p>
    </div>
  )
}

function Empty({ state }: { state: "text" | "file" }) {
  const Icon = state === "text" ? FileText : File
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-500">
        {state === "text" ? "Chưa có text nào được gửi" : "Chưa có file nào được tải lên"}
      </p>
    </div>
  )
}
