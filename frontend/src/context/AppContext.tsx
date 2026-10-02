"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  occupation?: string;
  income?: number;
  caste?: string;
  community?: string;
  disability?: boolean;
  bpl?: boolean;
  student?: boolean;
  farmer?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  language?: string;
  suggestions?: string[];
  relevantSchemes?: any[];
  timestamp: string;
}

interface AppContextType {
  pageContext: string;
  setPageContext: (page: string) => void;
  currentSchemeId: string | null;
  setCurrentSchemeId: (id: string | null) => void;
  selectedSchemeIds: string[];
  setSelectedSchemeIds: (ids: string[]) => void;
  toggleSelectScheme: (id: string) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateProfile: (partial: Partial<UserProfile>) => void;
  availableDocuments: string[];
  setAvailableDocuments: React.Dispatch<React.SetStateAction<string[]>>;
  toggleAvailableDocument: (doc: string) => void;
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (message: string, languageOverride?: string) => Promise<void>;
  clearChat: () => void;
  isSendingChat: boolean;
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pageContext, setPageContext] = useState<string>("home");
  const [currentSchemeId, setCurrentSchemeId] = useState<string | null>(null);
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<string[]>([
    "Aadhaar Card",
    "Ration Card",
  ]);
  const [isAssistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem("schemesmart-language") === "ta" ? "ta" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = activeLanguage === "ta" ? "ta" : "en";
    window.localStorage.setItem("schemesmart-language", activeLanguage === "ta" ? "ta" : "en");
  }, [activeLanguage]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    state: "Tamil Nadu",
    student: false,
    farmer: false,
    disability: false,
    bpl: false,
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am SchemeSmart AI, your verified assistant for Tamil Nadu government schemes. I automatically follow the screen you are on and guide you with eligibility, documents, and application steps.\n\nAsk me anything in English or Tamil (தமிழ்)!",
      suggestions: [
        "Which schemes am I eligible for?",
        "Scholarships for college students",
        "Women welfare monthly assistance",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const updateProfile = (partial: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...partial }));
  };

  const toggleSelectScheme = (id: string) => {
    setSelectedSchemeIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const toggleAvailableDocument = (doc: string) => {
    setAvailableDocuments((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const sendChatMessage = async (text: string, languageOverride?: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      language: languageOverride || activeLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      const payload = {
        message: text,
        language: languageOverride || activeLanguage,
        context: {
          page: pageContext,
          scheme_id: currentSchemeId,
          selected_schemes: selectedSchemeIds,
          user_profile: userProfile,
          documents_state: {
            available: availableDocuments,
          },
        },
        profile: userProfile,
      };

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        language: data.language,
        suggestions: data.suggestions || [],
        relevantSchemes: data.relevant_schemes || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I couldn't connect to the verified scheme server right now. Please ensure the backend is running at http://127.0.0.1:8005.",
        suggestions: ["Try asking again", "Find schemes"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  return (
    <AppContext.Provider
      value={{
        pageContext,
        setPageContext,
        currentSchemeId,
        setCurrentSchemeId,
        selectedSchemeIds,
        setSelectedSchemeIds,
        toggleSelectScheme,
        userProfile,
        setUserProfile,
        updateProfile,
        availableDocuments,
        setAvailableDocuments,
        toggleAvailableDocument,
        isAssistantOpen,
        setAssistantOpen,
        chatMessages,
        sendChatMessage,
        clearChat,
        isSendingChat,
        activeLanguage,
        setActiveLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
