"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  X,
  Send,
  Languages,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  GitCompare,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import VoiceControls from "@/components/VoiceControls";

export default function FloatingAssistant() {
  const {
    pageContext,
    currentSchemeId,
    selectedSchemeIds,
    userProfile,
    isAssistantOpen,
    setAssistantOpen,
    chatMessages,
    sendChatMessage,
    clearChat,
    isSendingChat,
    activeLanguage,
    setActiveLanguage,
  } = useApp();

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAssistantOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isAssistantOpen]);

  const handleSend = (text?: string) => {
    const msg = text || inputVal;
    if (!msg.trim()) return;
    sendChatMessage(msg, activeLanguage);
    setInputVal("");
  };

  const getContextBadge = () => {
    switch (pageContext) {
      case "scheme_detail":
        return {
          icon: FileText,
          label: currentSchemeId ? `Viewing ${currentSchemeId}` : "Scheme Detail",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "document_checker":
        return {
          icon: CheckCircle2,
          label: currentSchemeId ? `Doc Checker: ${currentSchemeId}` : "Document Checker",
          color: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "comparison":
        return {
          icon: GitCompare,
          label: `Comparing ${selectedSchemeIds.length} Schemes`,
          color: "bg-purple-50 text-purple-800 border-purple-200",
        };
      case "recommend":
        return {
          icon: Sparkles,
          label: "Eligibility Calculator",
          color: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "schemes":
        return {
          icon: FileText,
          label: "Scheme Discovery",
          color: "bg-slate-100 text-slate-800 border-slate-200",
        };
      default:
        return {
          icon: Bot,
          label: "General Assistant",
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const getContextPrompts = () => {
    if (pageContext === "scheme_detail") {
      return [
        "Am I eligible for this scheme?",
        "What documents are required?",
        "How do I apply?",
        "What are the benefits?",
      ];
    }
    if (pageContext === "document_checker") {
      return [
        "Which document am I missing?",
        "Where can I get an Income Certificate?",
        "Can I apply without these documents?",
      ];
    }
    if (pageContext === "comparison") {
      return [
        "What is the main difference?",
        "Which scheme has higher benefits?",
        "Compare document requirements",
      ];
    }
    if (pageContext === "recommend") {
      return [
        "Why was this recommended to me?",
        "Check schemes for college student",
        "Schemes for low income families",
      ];
    }
    return [
      "Scholarships for college students",
      "Kalaignar Magalir Urimai Thogai details",
      "Agriculture and crop subsidies",
      "Enakku enna scheme kidaikkum?",
    ];
  };

  const contextBadge = getContextBadge();
  const ContextIcon = contextBadge.icon;
  const contextPrompts = getContextPrompts();

  return (
    <>
      {/* Floating Action Button [AI ✦] */}
      {!isAssistantOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {/* Active Context Mini-Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
            <ContextIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>{contextBadge.label}</span>
          </div>

          <button
            onClick={() => setAssistantOpen(true)}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold px-4 py-3.5 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            aria-label="Open SchemeSmart AI Assistant"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="tracking-wide">AI ✦</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
          </button>
        </div>
      )}

      {/* Floating Slide-over Panel */}
      {isAssistantOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-115 bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">SchemeSmart AI</h3>
                  <p className="text-[11px] text-slate-400">Verified Context-Aware Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat history"
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAssistantOpen(false)}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Awareness Pill & Language Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium ${contextBadge.color}`}
              >
                <ContextIcon className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{contextBadge.label}</span>
              </div>

              {/* Language Switch */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded text-[11px]">
                <button
                  onClick={() => setActiveLanguage("en")}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    activeLanguage === "en" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setActiveLanguage("ta")}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    activeLanguage === "ta" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {msg.role === "assistant" && (
                    <div className="flex justify-end mt-1">
                      <VoiceControls text={msg.content} language={activeLanguage} compact />
                    </div>
                  )}

                  {/* Grounded scheme cards if returned */}
                  {msg.relevantSchemes && msg.relevantSchemes.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                      {msg.relevantSchemes.map((s: any) => (
                        <Link
                          key={s.scheme_id}
                          href={`/schemes/${s.scheme_id}`}
                          onClick={() => setAssistantOpen(false)}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-900 transition group"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-emerald-800 text-[11px] block truncate">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-slate-500">{s.category}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          className="text-[10px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-1 rounded transition text-left cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      msg.role === "user" ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isSendingChat && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-400 ml-1">Analyzing scheme data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context-Aware Action Prompts */}
          <div className="px-4 py-2 bg-white border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {contextPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full shrink-0 transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center bg-slate-50 border border-slate-300 rounded-lg focus-within:ring-1 focus-within:ring-emerald-500 focus-within:bg-white transition">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    activeLanguage === "ta"
                      ? "கேள்வி கேளுங்கள்..."
                      : "Ask anything about Tamil Nadu schemes..."
                  }
                  className="min-w-0 flex-1 text-xs bg-transparent px-3 py-2.5 focus:outline-none"
                />
                <VoiceControls onChange={setInputVal} language={activeLanguage} compact />
              </div>
              <button
                type="submit"
                disabled={!inputVal.trim() || isSendingChat}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
              <span>Verified Scheme Data Engine</span>
              <span>English / Tamil Supported</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
