"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  GitCompare,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Info,
  Calendar,
  Users,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const schemeId = resolvedParams.id;
  const router = useRouter();

  const {
    setPageContext,
    setCurrentSchemeId,
    setAssistantOpen,
    sendChatMessage,
    toggleSelectScheme,
    selectedSchemeIds,
    userProfile,
  } = useApp();

  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageContext("scheme_detail");
    setCurrentSchemeId(schemeId);

    return () => {
      setCurrentSchemeId(null);
    };
  }, [schemeId, setPageContext, setCurrentSchemeId]);

  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/schemes/${schemeId}`);
        if (!res.ok) throw new Error("Scheme not found in verified database");
        const data = await res.json();
        setScheme(data);
      } catch (err: any) {
        setError(err.message || "Failed to load scheme details");
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [schemeId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading verified scheme records...
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Scheme Not Found</h2>
        <p className="text-xs text-slate-500">{error || "The requested scheme record does not exist."}</p>
        <Link
          href="/schemes"
          className="inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 bg-emerald-700 text-white rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Schemes</span>
        </Link>
      </div>
    );
  }

  const isOnline = scheme.application_mode === "online";
  const isSelectedForCompare = selectedSchemeIds.includes(scheme.scheme_id);

  const rawDocs = scheme.documents_required || "";
  const docsList = rawDocs
    .split(rawDocs.includes(";") ? ";" : rawDocs.includes(",") ? "," : "\n")
    .map((d: string) => d.trim())
    .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scheme Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSelectScheme(scheme.scheme_id)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              isSelectedForCompare
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isSelectedForCompare ? "Added to Compare" : "Compare Scheme"}</span>
          </button>

          <button
            onClick={() => {
              setAssistantOpen(true);
              sendChatMessage(`Am I eligible for ${scheme.name}?`);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI About Eligibility</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
            {scheme.category}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {scheme.state}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded ${
              isOnline
                ? "bg-teal-100 text-teal-800"
                : "bg-amber-100 text-amber-900 border border-amber-200"
            }`}
          >
            {isOnline ? "Online Portal Application" : "Offline / Physical Application Process"}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {scheme.name}
          </h1>
          {scheme.name_tamil && (
            <p className="text-sm sm:text-base text-slate-500 font-semibold mt-1">
              {scheme.name_tamil}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong className="font-semibold text-slate-800">Department: </strong>
              {scheme.department || scheme.ministry}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong className="font-semibold text-slate-800">Target Beneficiaries: </strong>
              {scheme.beneficiary_type || "All Citizens"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Scheme Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Scheme Overview</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {scheme.description}
            </p>
            {scheme.description_tamil && (
              <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                {scheme.description_tamil}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Key Benefits Provided</span>
            </h2>
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-4 text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              {scheme.benefits || scheme.description}
            </div>
          </div>

          {/* Eligibility Conditions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Eligibility Conditions</span>
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {scheme.eligibility_text}
            </div>
            {scheme.eligibility_text_tamil && (
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                {scheme.eligibility_text_tamil}
              </p>
            )}

            {/* Quick Structured Rules Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-2 rounded">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Age Range
                </span>
                <span className="font-bold text-slate-800">
                  {scheme.eligibility_age_min || scheme.eligibility_age_max
                    ? `${scheme.eligibility_age_min || 0} - ${scheme.eligibility_age_max || "No Max"} yrs`
                    : "No specific age constraint"}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2 rounded">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Gender
                </span>
                <span className="font-bold text-slate-800 capitalize">
                  {scheme.eligibility_gender || "All genders"}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2 rounded">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Max Income
                </span>
                <span className="font-bold text-slate-800">
                  {scheme.eligibility_income_max
                    ? `₹${scheme.eligibility_income_max.toLocaleString()}/yr`
                    : "Standard limits"}
                </span>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>Required Documents</span>
              </h2>
              <Link
                href={`/documents?scheme=${scheme.scheme_id}`}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
              >
                <span>Check Your Readiness</span>
              </Link>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {docsList.map((doc: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-700 font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Application Process</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {scheme.application_process}
            </p>
            {scheme.application_process_tamil && (
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                {scheme.application_process_tamil}
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Application Action Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 sticky top-20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Application Mode
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-1 capitalize">
                {scheme.application_mode} Process
              </h3>
            </div>

            {/* Offline vs Online Clarity Alert - STRICTLY FOLLOWING SECTION 16 */}
            {isOnline ? (
              <div className="bg-teal-50 border border-teal-200 text-teal-900 text-xs p-3 rounded-lg leading-relaxed space-y-1">
                <span className="font-bold block">Online Portal Available</span>
                <p>
                  You can submit an application directly online on the official Tamil Nadu government
                  portal.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg leading-relaxed space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-800">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Physical / Document Submission</span>
                </span>
                <p>
                  This initiative operates primarily via local department offices, ration shops,
                  hospitals, or institutions. Please review the official documentation before
                  applying in person.
                </p>
              </div>
            )}

            {/* Primary Action Button */}
            {isOnline ? (
              <a
                href={scheme.apply_url || scheme.official_url}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5"
              >
                <span>Apply Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href={scheme.official_url || "https://www.tn.gov.in"}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5"
              >
                <span>View Application / Document Info</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Secondary Action: Document Checker */}
            <Link
              href={`/documents?scheme=${scheme.scheme_id}`}
              className="w-full text-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Verify My Required Documents</span>
            </Link>

            {/* AI Assistant Callout */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Context-Aware AI Helper</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                The floating assistant at bottom-right automatically has this scheme loaded. Click it
                to ask:
              </p>
              <button
                onClick={() => {
                  setAssistantOpen(true);
                  sendChatMessage(`Am I eligible for ${scheme.name}?`);
                }}
                className="text-[11px] font-semibold text-emerald-700 underline text-left cursor-pointer"
              >
                &ldquo;Am I eligible for this?&rdquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
