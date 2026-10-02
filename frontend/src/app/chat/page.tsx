"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Languages,
  Building2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import VoiceControls from "@/components/VoiceControls";

export default function ChatPage() {
  const {
    setPageContext,
    chatMessages,
    sendChatMessage,
    clearChat,
    isSendingChat,
    activeLanguage,
    setActiveLanguage,
  } = useApp();

  const tamil = activeLanguage === "ta";

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageContext("chatbot");
  }, [setPageContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = (text?: string) => {
    const msg = text || inputVal;
    if (!msg.trim()) return;
    sendChatMessage(msg, activeLanguage);
    setInputVal("");
  };

  const samplePrompts = [
    "I am a 20 year old engineering student from Tamil Nadu. My family income is 1.5 lakh. Which schemes can I apply for?",
    "கலைஞர் மகளிர் உரிமை தொகை திட்டம் விவரங்கள் என்ன?",
    "Enakku enna government scholarship kidaikkum?",
    "What documents are required for Chief Minister Comprehensive Health Insurance Scheme?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{tamil ? "தமிழ்நாடு அரசு உதவியாளர்" : "Tamil Nadu Government Assistant"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {tamil ? "SchemeSmart இருமொழி AI chatbot" : "SchemeSmart English–Tamil AI Chatbot"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {tamil
              ? "தமிழ் அல்லது ஆங்கிலத்தில் கேள்விகளைக் கேளுங்கள். பதில்கள் சரிபார்க்கப்பட்ட திட்டத் தரவுகளை அடிப்படையாகக் கொண்டவை."
              : "Ask questions in English or Tamil (தமிழ்). Responses are grounded in verified scheme records."}
          </p>
        </div>

        {/* Language selector & actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold shadow-xs">
            <Languages className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <button
              onClick={() => setActiveLanguage("en")}
              className={`px-2 py-1 rounded transition ${
                activeLanguage === "en" ? "bg-emerald-700 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLanguage("ta")}
              className={`px-2 py-1 rounded transition ${
                activeLanguage === "ta" ? "bg-emerald-700 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              தமிழ்
            </button>
          </div>

          <button
            onClick={clearChat}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg shadow-xs transition"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-emerald-700 text-white rounded-br-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {msg.role === "assistant" && (
                  <div className="flex justify-end mt-1">
                    <VoiceControls text={msg.content} language={activeLanguage} compact />
                  </div>
                )}

                {/* Grounded scheme cards */}
                {msg.relevantSchemes && msg.relevantSchemes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {msg.relevantSchemes.map((s: any) => (
                      <Link
                        key={s.scheme_id}
                        href={`/schemes/${s.scheme_id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-900 transition group"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-emerald-800 text-xs block truncate">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-slate-500">{s.category}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md transition text-left cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.role === "user" ? "text-emerald-200" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSendingChat && (
            <div className="flex gap-3 items-center text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-500 font-medium">Retrieving verified scheme data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset demo prompts */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-full shrink-0 transition cursor-pointer"
            >
              {p.length > 50 ? p.slice(0, 50) + "..." : p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-300 rounded-xl focus-within:ring-1 focus-within:ring-emerald-500 focus-within:bg-white transition">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={tamil ? "தமிழ்நாடு திட்டங்களைப் பற்றி கேளுங்கள்..." : "Ask anything about Tamil Nadu schemes (English or தமிழ்)..."}
                className="min-w-0 flex-1 text-xs sm:text-sm bg-transparent px-4 py-3 focus:outline-none"
              />
              <VoiceControls onChange={setInputVal} language={activeLanguage} />
            </div>
            <button
              type="submit"
              disabled={!inputVal.trim() || isSendingChat}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-5 py-3 rounded-xl transition shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 font-bold text-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{tamil ? "அனுப்பு" : "Send"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
