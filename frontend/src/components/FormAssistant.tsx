"use client";

import { useState } from "react";
import { AlertTriangle, Camera, Check, CheckCircle2, Download, FileSearch, LoaderCircle, Upload } from "lucide-react";
import VoiceControls from "@/components/VoiceControls";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";

type FormField = {
  id: string;
  label: string;
  value: string;
  explanation: string;
  explanation_tamil: string;
  required: boolean;
  expected_format: string;
  confidence: number;
  status: string;
};

type FormAnalysis = {
  filename: string;
  source_type: string;
  ocr_used: boolean;
  extracted_text: string;
  fields: FormField[];
  official_form_url?: string;
  required_documents: string[];
};

type FormAssistantProps = { schemeId: string };

function fieldError(field: FormField): string {
  const value = field.value.trim();
  if (!value) return field.required ? "Required field is empty." : "";
  if (field.label === "Date of Birth" && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return "Use DD/MM/YYYY.";
  if (field.label === "Annual Family Income" && !/^[\d,]+(?:\.\d{1,2})?$/.test(value)) return "Enter an amount in INR.";
  if (field.label === "Bank Account Number" && !/^\d{8,18}$/.test(value.replace(/\s/g, ""))) return "Use 8 to 18 digits.";
  if (field.label === "IFSC Code" && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(value)) return "Use an 11-character IFSC code.";
  return "";
}

export default function FormAssistant({ schemeId }: FormAssistantProps) {
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [uploading, setUploading] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [mappingResult, setMappingResult] = useState<{ field_id: string; value: string; confidence: number; status: string }[]>([]);
  const [error, setError] = useState("");

  const analyzeFile = async (file: File) => {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("scheme_id", schemeId);
    try {
      const response = await fetch(`${API_BASE}/documents/analyze-form`, { method: "POST", body: formData });
      if (!response.ok) throw new Error((await response.json()).detail || "Could not understand this form.");
      setAnalysis(await response.json());
      setMappingResult([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze the uploaded form.");
    } finally {
      setUploading(false);
    }
  };

  const updateField = (fieldId: string, value: string) => {
    setAnalysis((current) => current ? {
      ...current,
      fields: current.fields.map((field) => field.id === fieldId ? { ...field, value, status: value.trim() ? "complete" : "empty" } : field),
    } : current);
  };

  const mapDocument = async (file: File) => {
    setMapping(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE}/documents/map-document`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Could not read this document.");
      setMappingResult((await response.json()).matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not map this document.");
    } finally {
      setMapping(false);
    }
  };

  const applyMappedValue = (fieldId: string, value: string) => {
    if (!analysis) return;
    const field = analysis.fields.find((item) => item.label === fieldId);
    if (field) updateField(field.id, value);
  };

  const invalidFields = analysis?.fields.filter((field) => fieldError(field)) || [];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-6 bg-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <FileSearch className="w-4 h-4" />
              Application Assistance
            </div>
            <h2 className="text-xl font-black mt-2">Upload any government form</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">Take a photo of a physical form or upload the official PDF. We identify fields and explain what belongs in each one. You review every value before using it.</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs shrink-0">
            <button onClick={() => setLanguage("en")} className={`px-2.5 py-1 rounded ${language === "en" ? "bg-emerald-600 text-white" : "text-slate-400"}`}>English</button>
            <button onClick={() => setLanguage("ta")} className={`px-2.5 py-1 rounded ${language === "ta" ? "bg-emerald-600 text-white" : "text-slate-400"}`}>தமிழ்</button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition">
            <Camera className="w-5 h-5" />
            <span>Take photo / Upload form</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => event.target.files?.[0] && analyzeFile(event.target.files[0])} />
          </label>
          <label className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer hover:bg-slate-100 transition">
            <Upload className="w-5 h-5 text-emerald-700" />
            <span>Upload PDF or image</span>
            <input type="file" accept="application/pdf,image/*,.txt" className="hidden" onChange={(event) => event.target.files?.[0] && analyzeFile(event.target.files[0])} />
          </label>
        </div>

        {analysis?.official_form_url && (
          <a href={analysis.official_form_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950">
            <Download className="w-4 h-4" /> Download / open official scheme form
          </a>
        )}

        {uploading && <div className="flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="w-4 h-4 animate-spin text-emerald-600" /> Reading the form and identifying fields...</div>}
        {error && <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}

        {analysis && !uploading && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Fields found in {analysis.filename}</h3>
                <p className="text-[11px] text-slate-500 mt-1">{analysis.ocr_used ? "OCR was used on this image." : "Text was read from this upload."} Confirm values before using them.</p>
              </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${invalidFields.length ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>
                {invalidFields.length ? `${invalidFields.length} field(s) need attention` : "Ready for review"}
              </span>
            </div>

            <div className="space-y-3">
              {analysis.fields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{index + 1}. {field.label} {field.required && <span className="text-rose-600">*</span>}</p>
                      <p className="text-xs text-slate-600 mt-1">{language === "ta" ? field.explanation_tamil : field.explanation}</p>
                      {language === "en" && <p className="text-[11px] text-slate-500 mt-1">{field.explanation_tamil}</p>}
                      <p className="text-[10px] text-emerald-700 font-semibold mt-1">Expected: {field.expected_format}</p>
                    </div>
                    <VoiceControls text={language === "ta" ? field.explanation_tamil : field.explanation} language={language} compact />
                  </div>
                  <div className="flex items-center gap-2">
                    <input value={field.value} onChange={(event) => updateField(field.id, event.target.value)} placeholder="Enter your answer" className="flex-1 min-w-0 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    <VoiceControls onChange={(value) => updateField(field.id, value)} language={language} compact />
                  </div>
                  {fieldError(field) && <p className="text-[11px] font-semibold text-amber-700">{fieldError(field)}</p>}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900"><FileSearch className="w-4 h-4" /> Map a value from another document</div>
              <p className="text-[11px] text-blue-800">Upload an income certificate, bank document, or similar proof. Any match is only a suggestion and must be checked by you.</p>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-blue-300 text-xs font-bold text-blue-900 cursor-pointer">
                {mapping ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload supporting document
                <input type="file" accept="application/pdf,image/*,.txt" className="hidden" onChange={(event) => event.target.files?.[0] && mapDocument(event.target.files[0])} />
              </label>
              {mappingResult.map((match) => (
                <div key={`${match.field_id}-${match.value}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-blue-200 rounded-lg text-xs">
                  <span><strong>{match.field_id}:</strong> <code>{match.value}</code> <span className="text-slate-500">(possible match)</span></span>
                  <button onClick={() => applyMappedValue(match.field_id, match.value)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-blue-700 text-white font-bold"><Check className="w-3.5 h-3.5" /> Use this</button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h3 className="text-sm font-black text-slate-900">Application review</h3>
              {analysis.fields.map((field) => (
                <div key={field.id} className="flex items-center gap-2 text-xs">
                  {!fieldError(field) ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  <span className={!fieldError(field) ? "text-slate-700" : "text-amber-900"}>{field.label}</span>
                  {fieldError(field) && <span className="text-[10px] font-bold text-amber-700">{fieldError(field)}</span>}
                </div>
              ))}
              <p className="text-[11px] text-slate-500">Review every field and the scheme&apos;s required documents before submitting to the official department.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
