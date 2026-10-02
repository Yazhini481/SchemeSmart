"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  User,
  RotateCcw,
  Building2,
  ChevronDown,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";

const TN_DISTRICTS = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli",
  "Erode", "Vellore", "Thanjavur", "Dindigul", "Kanchipuram", "Cuddalore",
  "Tiruppur", "Virudhunagar", "Karur", "Nagapattinam", "Namakkal", "Nilgiris"
];

export default function RecommendationPage() {
  const { setPageContext, userProfile, setUserProfile, updateProfile } = useApp();

  const [naturalInput, setNaturalInput] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setPageContext("recommend");
    // If profile already populated, trigger recommendation automatically
    if (userProfile.age || userProfile.occupation || userProfile.student || userProfile.farmer) {
      handleRecommend();
    }
  }, [setPageContext]);

  const handleExtractFromText = async (customText?: string) => {
    const textToExtract = customText || naturalInput;
    if (!textToExtract.trim()) return;

    setExtracting(true);
    try {
      const res = await fetch(`${API_BASE}/profile/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToExtract }),
      });
      if (!res.ok) throw new Error("Failed to extract profile");
      const data = await res.json();
      setUserProfile((prev) => ({ ...prev, ...data.extracted }));
      // Immediately run recommendation
      runRecommendationWithProfile(data.extracted);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setExtracting(false);
    }
  };

  const handleRecommend = () => {
    runRecommendationWithProfile(userProfile);
  };

  const runRecommendationWithProfile = async (prof: any) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prof),
      });
      if (!res.ok) throw new Error("Failed to evaluate recommendations");
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserProfile({
      state: "Tamil Nadu",
      student: false,
      farmer: false,
      disability: false,
      bpl: false,
    });
    setNaturalInput("");
    setRecommendations([]);
    setHasSearched(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Deterministic Eligibility Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Personalized Scheme Recommendation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Enter your details in natural language or fill the flexible form. The deterministic engine
          evaluates verified Tamil Nadu criteria without inventing requirements.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Natural Language Citizen Input */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Describe Your Situation (English / தமிழ்)</span>
            </label>
            <span className="text-[10px] text-slate-400">Rule-Assisted AI Entity Extractor</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="e.g. 'I am a 20 year old engineering student from Tamil Nadu. My family income is 1.5 lakh.'"
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
            <button
              type="button"
              disabled={extracting || !naturalInput.trim()}
              onClick={() => handleExtractFromText()}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition shrink-0 cursor-pointer"
            >
              {extracting ? "Extracting..." : "Auto-Fill Profile"}
            </button>
          </div>

          {/* Quick Demo Pre-fill Pill (For Hackathon Demo Flow Step 2) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <span className="font-semibold text-slate-600">Demo Example:</span>
            <button
              type="button"
              onClick={() => {
                const prompt =
                  "I am a 20 year old engineering student from Tamil Nadu. My family income is 1.5 lakh.";
                setNaturalInput(prompt);
                handleExtractFromText(prompt);
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded cursor-pointer transition font-medium"
            >
              &ldquo;I am a 20 year old engineering student from Tamil Nadu. My family income is 1.5 lakh.&rdquo;
            </button>
          </div>
        </div>

        {/* Optional Structured Fields Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Structured Citizen Profile (Fill only what is relevant)
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Age */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Age (Years)</label>
              <input
                type="number"
                value={userProfile.age || ""}
                onChange={(e) => updateProfile({ age: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gender</label>
              <select
                value={userProfile.gender || ""}
                onChange={(e) => updateProfile({ gender: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Any / Unspecified</option>
                <option value="female">Female (பெண்)</option>
                <option value="male">Male (ஆண்)</option>
                <option value="transgender">Transgender (திருநங்கை)</option>
              </select>
            </div>

            {/* Annual Income */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Annual Family Income (₹)</label>
              <input
                type="number"
                value={userProfile.income || ""}
                onChange={(e) => updateProfile({ income: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Occupation</label>
              <input
                type="text"
                value={userProfile.occupation || ""}
                onChange={(e) => updateProfile({ occupation: e.target.value || undefined })}
                placeholder="e.g. Engineering Student"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                value={userProfile.state || "Tamil Nadu"}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* District */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">District</label>
              <select
                value={userProfile.district || ""}
                onChange={(e) => updateProfile({ district: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select District</option>
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Caste / Community */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Community / Caste</label>
              <select
                value={userProfile.caste || ""}
                onChange={(e) => updateProfile({ caste: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Unspecified</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="MBC">MBC (Most Backward Class)</option>
                <option value="BC">BC (Backward Class)</option>
                <option value="General">General / OC</option>
              </select>
            </div>

            {/* Checkbox Flags */}
            <div className="flex flex-col justify-center space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userProfile.student || false}
                  onChange={(e) => updateProfile({ student: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-800">Enrolled Student</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userProfile.farmer || false}
                  onChange={(e) => updateProfile({ farmer: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-800">Farmer / Agri-Worker</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? "Evaluating Eligibility..." : "Find My Eligible Schemes"}</span>
          </button>
        </div>
      </div>

      {/* Recommendations Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your Potential Scheme Matches
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {recommendations.length} scheme(s) evaluated through deterministic criteria and semantic relevance.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">
              Evaluating eligibility conditions against verified dataset...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-semibold text-slate-700">No matching schemes found for this demographic.</p>
              <p>Try broadening your income or occupation criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((item) => {
                const isEligible = item.eligibility_status === "ELIGIBLE";
                return (
                  <div
                    key={item.scheme_id}
                    className={`bg-white rounded-xl border p-5 shadow-xs transition hover:shadow-md ${
                      isEligible
                        ? "border-emerald-200 bg-gradient-to-r from-emerald-50/20 to-white"
                        : "border-amber-200 bg-gradient-to-r from-amber-50/20 to-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isEligible
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {isEligible ? "✓ Eligible" : "⚠ Potential Match (Info Needed)"}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Target: {item.beneficiary_type}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900">
                          <Link
                            href={`/schemes/${item.scheme_id}`}
                            className="hover:text-emerald-700 transition"
                          >
                            {item.name}
                          </Link>
                        </h3>

                        {/* Why it matches (Section 11) */}
                        <div className="space-y-1 text-xs pt-1">
                          <span className="font-bold text-slate-700 block text-[11px]">
                            Why this matches your profile:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.reasons.map((r: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing information warning */}
                        {item.missing_information && item.missing_information.length > 0 && (
                          <div className="space-y-1 text-xs pt-1">
                            <span className="font-bold text-amber-800 block text-[11px]">
                              Additional verification required:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.missing_information.map((m: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed">
                          <strong className="text-slate-800">Benefits: </strong>
                          {item.benefits}
                        </p>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <Link
                          href={`/schemes/${item.scheme_id}`}
                          className="w-full sm:w-auto text-center text-xs font-semibold px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/documents?scheme=${item.scheme_id}`}
                          className="w-full sm:w-auto text-center text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center justify-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Check Documents</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
