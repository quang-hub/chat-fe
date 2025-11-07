import { Stomp, CompatClient, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import type { Message } from "@/app/page"

export function connectStomp(opts: {
  baseUrl: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage: (msg: Message) => void
  onDelete: (id: number | string) => void
}): CompatClient {
  const sock = new SockJS(`${opts.baseUrl}/ws`)
  const client = Stomp.over(sock)

  // tắt log ồn
  client.debug = () => {}

  client.connect(
    {},
    () => {
      opts.onConnect?.()

      client.subscribe("/topic/messages", (frame: IMessage) => {
        try {
          const msg: Message = JSON.parse(frame.body)
          opts.onMessage(msg)
        } catch (e) {
          console.error("Parse message failed", e)
        }
      })

      client.subscribe("/topic/messages/delete", (frame: IMessage) => {
        try {
          // server có thể gửi "123" hoặc 123
          const raw = frame.body?.trim()
          let id: number | string = raw
          try {
            id = JSON.parse(raw) // nếu là JSON hợp lệ
          } catch {}
          opts.onDelete(id!)
        } catch (e) {
          console.error("Parse delete failed", e)
        }
      })
    },
    (err) => {
      console.warn("STOMP disconnected", err)
      opts.onDisconnect?.()
      // tự reconnect
      setTimeout(() => connectStomp(opts), 3000)
    }
  )

  return client
}
