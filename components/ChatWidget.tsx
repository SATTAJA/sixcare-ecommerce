"use client";

import { Bot, Copy, ChevronDown, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Halo Pengunjung SixCare! Ada yang bisa saya bantu hari ini?" },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom saat pesan berubah
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const newMessages: Message[] = [...messages, { from: "user", text: prompt }];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Tolong balas semua percakapan ini dalam Bahasa Indonesia: ${prompt}`,
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { from: "bot", text: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { from: "bot", text: "Maaf, terjadi kesalahan." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="transition-all duration-300">
      {/* Tombol mengambang */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-black hover:bg-neutral-800 text-white md:px-4 md:py-4 px-3 py-3 rounded-full shadow-lg z-50 transition-all duration-300"
      >
        <Bot />
      </button>

      {/* Popup Chat */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 sm:w-96 max-h-[600px] bg-white border border-gray-300 rounded-xl shadow-2xl z-50 flex flex-col transition-all duration-300">
          <div className="p-4 border-b border-gray-300 font-semibold flex justify-between items-center">
            SixCare Assistant
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-black">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            {/* Daftar pesan */}
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                <div
                  className={`max-w-[80%] px-4 py-2 text-sm whitespace-pre-wrap transition-all duration-300 ${
                    msg.from === "bot"
                      ? "bg-gray-100 text-gray-800 self-start rounded-tl-2xl rounded-r-2xl"
                      : "bg-black text-white self-end ml-auto rounded-tr-2xl rounded-l-2xl"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.from === "bot" && (
                  <div className="text-xs text-gray-400 hover:text-black flex gap-3 mt-1 ml-1 items-center">
                    <button onClick={() => copyToClipboard(msg.text)} title="Salin"><Copy size={15} /></button>
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-gray-400 text-sm">Mengetik...</div>}

            {/* Target scroll */}
            <div ref={bottomRef} />
          </div>

          {/* Tombol Scroll ke bawah */}
          <div className="px-2 pb-2 flex justify-end">
            <button
              onClick={scrollToBottom}
              className="text-gray-400 hover:text-pink-500 text-xs flex items-center gap-1"
            >
              <ArrowDown size={15} /> Scroll Bawah
            </button>
          </div>

          {/* Input Chat */}
          <div className="p-2 flex gap-2">
            <input
              type="text"
              placeholder="Tulis pesan..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-xl shadow px-3 py-2 text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-pink-400 hover:bg-pink-500 text-white px-3 py-2 rounded-full"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
