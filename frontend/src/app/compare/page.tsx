"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  GitCompare,
  Building2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Info,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";

export default function ComparePage() {
  const {
    setPageContext,
    selectedSchemeIds,
    setSelectedSchemeIds,
    setAssistantOpen,
    sendChatMessage,
  } = useApp();

  const [schemesList, setSchemesList] = useState<any[]>([]);
  const [id1, setId1] = useState<string>(selectedSchemeIds[0] || "TN001");
  const [id2, setId2] = useState<string>(selectedSchemeIds[1] || "TN003");
  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    setPageContext("comparison");
    setSelectedSchemeIds([id1, id2]);
    fetchComparison(id1, id2);
  }, [id1, id2, setPageContext]);

  const fetchSchemes = async () => {
    try {
      const res = await fetch(`${API_BASE}/schemes?limit=100`);
      if (!res.ok) throw new Error("Failed to fetch schemes");
      const data = await res.json();
      setSchemesList(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComparison = async (sid1: string, sid2: string) => {
    if (!sid1 || !sid2 || sid1 === sid2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheme_ids: [sid1, sid2] }),
      });
      if (!res.ok) throw new Error("Failed to fetch comparison");
      const data = await res.json();
      setCompareData(data);
    } catch (err) {
      console.error("Comparison fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const comparisons = compareData?.comparisons;

  const comparisonRows = [
    { key: "category", label: "Category" },
    { key: "beneficiary_type", label: "Target Beneficiaries" },
    { key: "purpose", label: "Objective & Description" },
    { key: "benefits", label: "Key Benefits" },
    { key: "age_requirements", label: "Age Requirements" },
    { key: "income_requirements", label: "Income Limit" },
    { key: "gender_requirements", label: "Gender Eligibility" },
    { key: "caste_requirements", label: "Community / Caste" },
    { key: "disability_requirements", label: "Disability Condition" },
    { key: "bpl_requirements", label: "BPL / Ration Card" },
    { key: "documents", label: "Required Documents" },
    { key: "application_process", label: "Application Process" },
    { key: "application_mode", label: "Application Mode" },
    { key: "application_link", label: "Official Portal" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" />
            <span>Factual Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Scheme Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Compare two government initiatives side-by-side on verified parameters. Factual differences
            are highlighted without subjective bias.
          </p>
        </div>

        <button
          onClick={() => {
            setAssistantOpen(true);
            sendChatMessage("What is the main difference between these two schemes?");
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg shadow-xs transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Ask AI: &ldquo;What&apos;s the difference?&rdquo;</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            Scheme A:
          </label>
          <select
            value={id1}
            onChange={(e) => setId1(e.target.value)}
            aria-label="Select Scheme A"
            className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-slate-800"
          >
            {schemesList.map((s) => (
              <option key={s.scheme_id} value={s.scheme_id}>
                [{s.scheme_id}] {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            Scheme B:
          </label>
          <select
            value={id2}
            onChange={(e) => setId2(e.target.value)}
            aria-label="Select Scheme B"
            className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-slate-800"
          >
            {schemesList.map((s) => (
              <option key={s.scheme_id} value={s.scheme_id}>
                [{s.scheme_id}] {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">
          Loading comparison data...
        </div>
      ) : !comparisons ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
          Please select two different schemes to see their comparison.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-700">
            <div className="hidden md:block md:col-span-3 uppercase tracking-wider text-slate-400">
              Parameter
            </div>
            <div className="md:col-span-4 text-emerald-800 font-extrabold text-sm flex items-center gap-1.5">
              <span>{comparisons.name?.scheme_1}</span>
            </div>
            <div className="hidden md:block md:col-span-1 text-center text-slate-300 font-bold">
              VS
            </div>
            <div className="md:col-span-4 text-purple-800 font-extrabold text-sm flex items-center gap-1.5">
              <span>{comparisons.name?.scheme_2}</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {comparisonRows.map((row, idx) => {
              const item = comparisons[row.key];
              if (!item) return null;

              const val1 = item.scheme_1 || "Not specified";
              const val2 = item.scheme_2 || "Not specified";
              const isDifferent = val1.toLowerCase() !== val2.toLowerCase();

              return (
                <div
                  key={row.key}
                  className={`grid grid-cols-1 md:grid-cols-12 p-4 text-xs gap-3 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <div className="md:col-span-3 font-bold text-slate-700 flex items-center">
                    <span>{row.label}</span>
                    {isDifferent && (
                      <span className="ml-1.5 w-1.5 h-1.5 bg-purple-600 rounded-full" title="Parameter differs" />
                    )}
                  </div>

                  <div className="md:col-span-4 text-slate-700 leading-relaxed font-normal bg-emerald-50/20 md:bg-transparent p-2.5 md:p-0 rounded">
                    <span className="md:hidden text-[10px] font-bold text-emerald-700 block mb-1">
                      {comparisons.name?.scheme_1}:
                    </span>
                    {row.key === "application_link" ? (
                      <a
                        href={val1}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      val1
                    )}
                  </div>

                  <div className="hidden md:block md:col-span-1" />

                  <div className="md:col-span-4 text-slate-700 leading-relaxed font-normal bg-purple-50/20 md:bg-transparent p-2.5 md:p-0 rounded">
                    <span className="md:hidden text-[10px] font-bold text-purple-700 block mb-1">
                      {comparisons.name?.scheme_2}:
                    </span>
                    {row.key === "application_link" ? (
                      <a
                        href={val2}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      val2
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
