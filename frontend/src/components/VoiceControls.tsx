"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { API_BASE } from "@/config/api";

type VoiceLanguage = "en" | "ta" | "tanglish";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  results: { 0: SpeechRecognitionResultLike };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

interface VoiceControlsProps {
  text?: string;
  onChange?: (value: string) => void;
  language: string;
  compact?: boolean;
}

const recognitionLanguages: Record<VoiceLanguage, string> = {
  en: "en-IN",
  ta: "ta-IN",
  tanglish: "en-IN",
};

export default function VoiceControls({ text, onChange, language, compact = false }: VoiceControlsProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRequestRef = useRef<AbortController | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported] = useState(() => {
    if (typeof window === "undefined") return true;
    const speechWindow = window as SpeechWindow;
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition) && "speechSynthesis" in window;
  });

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = recognitionLanguages[language as VoiceLanguage] || recognitionLanguages.en;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      onChange?.(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language, onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current || !onChange) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    recognitionRef.current.lang = recognitionLanguages[language as VoiceLanguage] || recognitionLanguages.en;
    recognitionRef.current.start();
    setIsListening(true);
  };

  const toggleSpeaking = () => {
    if (!text || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      speechRequestRef.current?.abort();
      speechRequestRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      return;
    }

    if (language === "ta") {
      const controller = new AbortController();
      speechRequestRef.current = controller;
      setIsSpeaking(true);
      void fetch(`${API_BASE}/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "ta" }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Tamil voice generation failed");
          const audio = new Audio(URL.createObjectURL(await response.blob()));
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(audio.src);
            audioRef.current = null;
            speechRequestRef.current = null;
            setIsSpeaking(false);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audio.src);
            audioRef.current = null;
            speechRequestRef.current = null;
            setIsSpeaking(false);
          };
          await audio.play();
        })
        .catch((error: unknown) => {
          if ((error as { name?: string }).name !== "AbortError") {
            setIsSpeaking(false);
          }
          speechRequestRef.current = null;
        });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = recognitionLanguages[language as VoiceLanguage] || recognitionLanguages.en;
    const requestedLanguage = utterance.lang.toLowerCase();
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((voice) => voice.lang.toLowerCase() === requestedLanguage)
      || voices.find((voice) => voice.lang.toLowerCase().startsWith(requestedLanguage.split("-")[0]));

    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!voiceSupported) return null;

  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "shrink-0"}`}>
      {onChange && (
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? "Stop listening" : "Speak your question"}
          aria-label={isListening ? "Stop listening" : "Speak your question"}
          className={`${compact ? "p-1.5" : "p-2.5"} rounded-lg transition cursor-pointer ${
            isListening ? "bg-red-100 text-red-700" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
      {text && (
        <button
          type="button"
          onClick={toggleSpeaking}
          title={isSpeaking ? "Stop reading" : "Read response aloud"}
          aria-label={isSpeaking ? "Stop reading" : "Read response aloud"}
          className={`${compact ? "p-1.5" : "p-2.5"} rounded-lg transition cursor-pointer ${
            isSpeaking ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}
      {isListening && <LoaderCircle className="w-3.5 h-3.5 animate-spin text-emerald-600" aria-hidden="true" />}
    </div>
  );
}