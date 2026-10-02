"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  RotateCcw,
  Check,
} from "lucide-react";
import FormAssistant from "@/components/FormAssistant";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";

const COMMON_DOCUMENTS = [
  "Aadhaar Card",
  "Ration Card",
  "Income Certificate",
  "Community Certificate",
  "Bank Passbook",
  "School ID",
  "Residence Proof",
  "Bonafide Certificate",
  "Disability Certificate",
  "Birth Certificate",
  "Driving License",
  "Enrollment record",
  "College Bonafide",
  "Land Record (Patta/Chitta)",
];

function DocumentsContent() {
  const searchParams = useSearchParams();
  const {
    setPageContext,
    setCurrentSchemeId,
    availableDocuments,
    toggleAvailableDocument,
    setAssistantOpen,
    sendChatMessage,
  } = useApp();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(
    searchParams.get("scheme") || "TN001"
  );
  const [readinessData, setReadinessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPageContext("document_checker");
    setCurrentSchemeId(selectedSchemeId);

    return () => {
      setCurrentSchemeId(null);
    };
  }, [selectedSchemeId, setPageContext, setCurrentSchemeId]);

  useEffect(() => {
    fetchSchemesList();
  }, []);

  useEffect(() => {
    if (selectedSchemeId) {
      evaluateDocuments();
    }
  }, [selectedSchemeId, availableDocuments]);

  const fetchSchemesList = async () => {
    try {
      const res = await fetch(`${API_BASE}/schemes?limit=100`);
      if (!res.ok) throw new Error("Failed to fetch schemes list");
      const data = await res.json();
      setSchemes(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const evaluateDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/documents/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme_id: selectedSchemeId,
          available_documents: availableDocuments,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate documents");
      const data = await res.json();
      setReadinessData(data);
    } catch (err) {
      console.error("Document check error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isReady = readinessData?.readiness_status === "READY";
  const isPartial = readinessData?.readiness_status === "PARTIALLY_READY";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FileCheck className="w-4 h-4 text-emerald-700" />
          <span>Document Readiness Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Document Readiness Checker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Select a government scheme and mark the certificates you currently possess. The system
          compares required versus available documents without inventing mandatory requirements.
        </p>
      </div>

      {/* Scheme Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
          Select Target Scheme:
        </label>
        <select
          value={selectedSchemeId}
          onChange={(e) => setSelectedSchemeId(e.target.value)}
          aria-label="Select Target Scheme"
          className="w-full py-2.5 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800"
        >
          {schemes.map((s) => (
            <option key={s.scheme_id} value={s.scheme_id}>
              [{s.scheme_id}] {s.name} ({s.category})
            </option>
          ))}
        </select>
      </div>

      <FormAssistant schemeId={selectedSchemeId} />

      {/* Main Grid: Checklist vs Readiness Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Available Documents Checklist */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Available Documents</h3>
              <p className="text-xs text-slate-500">Check off the documents you have on hand.</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {availableDocuments.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COMMON_DOCUMENTS.map((doc) => {
              const isChecked = availableDocuments.includes(doc);
              return (
                <button
                  key={doc}
                  type="button"
                  onClick={() => toggleAvailableDocument(doc)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                    isChecked
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      isChecked
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{doc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: Scheme Readiness Evaluation */}
        <div className="lg:col-span-6 space-y-6">
          {readinessData && (
            <div
              className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
                isReady
                  ? "bg-gradient-to-b from-emerald-50/50 to-white border-emerald-300"
                  : isPartial
                  ? "bg-gradient-to-b from-amber-50/50 to-white border-amber-300"
                  : "bg-gradient-to-b from-rose-50/50 to-white border-rose-300"
              }`}
            >
              {/* Readiness Status Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Readiness Evaluation
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {readinessData.readiness_status.replace("_", " ")}
                  </h3>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    isReady
                      ? "bg-emerald-100 text-emerald-800"
                      : isPartial
                      ? "bg-amber-100 text-amber-900"
                      : "bg-rose-100 text-rose-900"
                  }`}
                >
                  {readinessData.available_count} / {readinessData.total_required} Ready
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    isReady ? "bg-emerald-600" : isPartial ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{
                    width: `${
                      readinessData.total_required > 0
                        ? (readinessData.available_count / readinessData.total_required) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* Guidance Message */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {readinessData.guidance}
              </p>

              {/* Breakdown: Required vs Available vs Missing */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Document Breakdown
                </h4>

                <div className="space-y-2">
                  {readinessData.required_documents.map((doc: string, idx: number) => {
                    const hasDoc = readinessData.available.includes(doc);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium ${
                          hasDoc
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                            : "bg-rose-50/70 border-rose-200 text-rose-950"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {hasDoc ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{doc}</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            hasDoc
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {hasDoc ? "Available" : "Missing"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Guidance Callout */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Document Assistance</span>
                </div>
                <p className="text-xs text-slate-300">
                  Ask the floating assistant: &ldquo;Which document am I missing?&rdquo; or &ldquo;Where can I get an Income Certificate?&rdquo;
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      setAssistantOpen(true);
                      sendChatMessage("Which document am I missing?");
                    }}
                    className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded transition cursor-pointer"
                  >
                    &ldquo;Which document am I missing?&rdquo;
                  </button>
                  <button
                    onClick={() => {
                      setAssistantOpen(true);
                      sendChatMessage("Where can I get an Income Certificate in Tamil Nadu?");
                    }}
                    className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded transition cursor-pointer"
                  >
                    &ldquo;How to get Income Certificate?&rdquo;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
          Loading Document Readiness Checker...
        </div>
      }
    >
      <DocumentsContent />
    </Suspense>
  );
}
