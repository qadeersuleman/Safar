"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, Compass, CornerDownLeft, Loader2, MapPin, MessageSquare, RefreshCw, Send, Sparkles, Ticket, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "gemini" | "fallback";
};

const SUGGESTIONS = [
  "Sukkur se Daharki ka kiraya kitna hai?",
  "Sindh Express aur AC bus ki timings?",
  "Live bus tracking kaise karein?",
  "Online ticket book karne ka tareeqa?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "assistant",
      content:
        "السلام علیکم! میں SafarGo کا AI اسسٹنٹ ہوں۔\n\nآپ مجھ سے سفر، بس ٹائمنگز، کرایہ (Fares)، ٹکٹ بکنگ یا لائیو ٹریکنگ کے بارے میں کچھ بھی پوچھ سکتے ہیں۔",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, messages, loading]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const botReply = data.reply || "Maazrat, jawab nahi mil saka. Barah-e-karam dobara koshish karein.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: botReply,
          source: data.source,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Internet ya server connection mein masla hai. Dobara check karein.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setMessages([
      {
        id: `m-${Date.now()}`,
        role: "assistant",
        content: "Nayi guftagu shuru ho gayi hai! Aap SafarGo ke bare mein kya janna chahte hain?",
      },
    ]);
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen((o) => !o)}
          aria-label="Open SafarGo AI Chatbot"
          className="group relative flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-amber-500 p-1 pr-4 font-display font-semibold text-white shadow-glow transition"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-ink-950/20 backdrop-blur-md">
            <Bot className="h-6 w-6 text-white transition-transform group-hover:rotate-12" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-brand-600 bg-mint" />
            </span>
          </span>
          <span className="hidden text-sm md:inline">Ask AI Assistant</span>
        </motion.button>
      </div>

      {/* Chat Drawer / Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed inset-x-3 bottom-20 z-50 mx-auto max-h-[82vh] w-auto max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-ink-900/95 shadow-2xl backdrop-blur-2xl md:right-6 md:bottom-24 md:left-auto md:w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-glow">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-mint" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-white">SafarGo AI Assistant</h3>
                    <span className="flex items-center gap-1 rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
                      <Sparkles className="h-3 w-3" /> Gemini
                    </span>
                  </div>
                  <p className="text-xs text-ink-300">Sindh N-5 Bus Travel & Fare Guide</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Reset conversation"
                  className="rounded-lg p-2 text-ink-400 transition hover:bg-white/5 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Close chat"
                  className="rounded-lg p-2 text-ink-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Links Bar */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-ink-950/50 px-3 py-2 text-xs">
              <span className="text-ink-400 font-medium">Quick:</span>
              <Link
                href="/track"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-brand-300 transition hover:bg-brand-500/20 hover:text-white"
              >
                <Compass className="h-3.5 w-3.5" /> Live Track
              </Link>
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-ink-200 transition hover:bg-white/10 hover:text-white"
              >
                <Ticket className="h-3.5 w-3.5" /> Book Seat
              </Link>
              <Link
                href="/routes"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-ink-200 transition hover:bg-white/10 hover:text-white"
              >
                <MapPin className="h-3.5 w-3.5" /> Fares
              </Link>
            </div>

            {/* Message Area */}
            <div className="flex h-[380px] flex-col gap-3 overflow-y-auto p-4 sm:h-[400px]">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm whitespace-pre-wrap break-words",
                        isUser
                          ? "rounded-tr-none bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow"
                          : "rounded-tl-none border border-white/10 bg-ink-800/90 text-ink-100",
                      )}
                    >
                      {m.content}

                      {/* Dynamic CTAs when assistant suggests them */}
                      {!isUser && (m.content.includes("/track") || m.content.toLowerCase().includes("live bus tracking")) && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                          <Link
                            href="/track"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/25 px-2.5 py-1.5 text-xs font-semibold text-brand-300 hover:bg-brand-500 hover:text-white transition"
                          >
                            <Compass className="h-3.5 w-3.5" /> Open Live Map Trace
                          </Link>
                        </div>
                      )}

                      {!isUser && (m.content.includes("/search") || m.content.toLowerCase().includes("book a seat")) && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                          <Link
                            href="/search"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 transition"
                          >
                            <Ticket className="h-3.5 w-3.5" /> Book Seat Now
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-white/10 bg-ink-800/80 px-4 py-3 text-xs text-ink-300">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                  <span>SafarGo AI soch raha hai...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips */}
            <div className="border-t border-white/5 bg-ink-950/40 p-2.5">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    disabled={loading}
                    onClick={() => handleSend(s)}
                    className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-ink-300 transition hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-white/10 bg-ink-950 p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Poochiye... (e.g. Sukkur se Ghotki kiraya?)"
                disabled={loading}
                className="h-11 flex-1 rounded-xl border border-white/10 bg-ink-800/90 px-3.5 text-xs text-white placeholder-ink-400 outline-none transition focus:border-brand-500 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 font-semibold text-white shadow-glow transition hover:bg-brand-600 disabled:opacity-40 disabled:shadow-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

