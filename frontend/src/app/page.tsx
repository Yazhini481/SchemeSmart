"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  Wheat,
  HeartPulse,
  Briefcase,
  Home,
  CheckCircle2,
  FileCheck,
  GitCompare,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { setPageContext, setAssistantOpen, sendChatMessage, updateProfile, activeLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const tamil = activeLanguage === "ta";

  useEffect(() => {
    setPageContext("home");
  }, [setPageContext]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/schemes");
    }
  };

  const categories = [
    {
      id: "education",
      name: "Education & Students",
      nameTa: "கல்வி மற்றும் மாணவர்கள்",
      count: "22+ Schemes",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400",
    },
    {
      id: "women",
      name: "Women Welfare",
      nameTa: "மகளிர் நலம் மற்றும் உரிமை",
      count: "18+ Schemes",
      icon: Users,
      color: "bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400",
    },
    {
      id: "agriculture",
      name: "Agriculture & Farmers",
      nameTa: "வேளாண்மை மற்றும் விவசாயிகள்",
      count: "35+ Schemes",
      icon: Wheat,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400",
    },
    {
      id: "health",
      name: "Health & Medical",
      nameTa: "சுகாதாரம் மற்றும் மருத்துவம்",
      count: "14+ Schemes",
      icon: HeartPulse,
      color: "bg-red-50 text-red-700 border-red-200 hover:border-red-400",
    },
    {
      id: "employment",
      name: "Employment & Skills",
      nameTa: "வேலைவாய்ப்பு மற்றும் திறன்",
      count: "13+ Schemes",
      icon: Briefcase,
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400",
    },
    {
      id: "housing",
      name: "Housing & Infrastructure",
      nameTa: "வீட்டு வசதி மற்றும் உள்கட்டமைப்பு",
      count: "19+ Schemes",
      icon: Home,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400",
    },
  ];

  const quickDemos = [
    {
      title: "College Engineering Student",
      desc: "Age 20 • Tamil Nadu • Family Income ₹1.5 Lakh",
      profile: {
        age: 20,
        student: true,
        state: "Tamil Nadu",
        income: 150000,
        occupation: "Engineering Student",
      },
      matchPreview: "Higher Education Scholarship, Laptop Scheme, Bus Pass",
    },
    {
      title: "Woman Head of Household",
      desc: "Female • Tamil Nadu • Low Income Ration Card",
      profile: {
        gender: "female",
        state: "Tamil Nadu",
        income: 120000,
        bpl: true,
        occupation: "Homemaker",
      },
      matchPreview: "Kalaignar Magalir Urimai Thogai, Free Bus Travel",
    },
    {
      title: "Small Agricultural Farmer",
      desc: "Farmer • Tamil Nadu • Rural Landholding",
      profile: {
        farmer: true,
        state: "Tamil Nadu",
        occupation: "Farmer",
      },
      matchPreview: "Organic Farming Promotion, Crop Assistance, Seeds",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur">
            <Building2 className="w-3.5 h-3.5" />
            <span>{tamil ? "தமிழ்நாடு அரசு நலத்திட்டங்கள் • 150+ சரிபார்க்கப்பட்ட திட்டங்கள்" : "Government of Tamil Nadu Welfare Directory • 150+ Verified Initiatives"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {tamil ? "உங்களுக்கு ஏற்ற அரசு திட்டங்களை" : "Find government schemes"} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
              {tamil ? "கண்டறியுங்கள்." : "that truly fit you."}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            {tamil
              ? "SchemeSmart தகுதி விதிகளைச் சரிபார்த்து, தேவையான ஆவணங்களை வழிகாட்டி, தமிழ் மற்றும் ஆங்கிலத்தில் நம்பகமான AI உதவியை வழங்குகிறது."
              : "SchemeSmart checks deterministic eligibility criteria, guides your required documents, and provides grounded AI assistance in English and Tamil (தமிழ்)."}
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mt-8 flex items-center bg-white rounded-xl p-1.5 shadow-2xl border border-white/20 text-slate-900"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g., 'scholarship', 'farmer subsidy', 'magalir')..."
              className="w-full px-3 py-2.5 text-sm bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg transition shadow-md shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow transition"
            >
              <span>{tamil ? "திட்டங்களைக் காண்க" : "Find Schemes"}</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>

            <Link
              href="/recommend"
              className="inline-flex items-center gap-2 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/30 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{tamil ? "என் தகுதியைச் சரிபார்க்கவும்" : "Check My Eligibility"}</span>
            </Link>

            <button
              onClick={() => {
                setAssistantOpen(true);
                sendChatMessage("Which scholarships and welfare schemes are available in Tamil Nadu?");
              }}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-emerald-300 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{tamil ? "AI-யிடம் கேளுங்கள்" : "Ask AI"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Sectors & Departments
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Categories</h2>
          </div>
          <Link
            href="/schemes"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View all 150 schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/schemes?category=${cat.id}`}
                className={`p-5 rounded-xl border transition-all hover:shadow-md flex items-start justify-between group ${cat.color}`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold opacity-75">{cat.count}</span>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs opacity-75 font-medium">{cat.nameTa}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white shadow-xs group-hover:scale-110 transition">
                  <Icon className="w-5 h-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Profile Recommendation Demos */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              One-Click Profiles
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Test Personalized Recommendation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a citizen persona below to run instant deterministic eligibility & recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickDemos.map((demo, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Persona #{idx + 1}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-1">{demo.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{demo.desc}</p>
                  <div className="mt-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-900 p-2 rounded-lg">
                    <span className="font-semibold block text-[11px] text-emerald-800">
                      Sample Matches:
                    </span>
                    <span className="text-[11px]">{demo.matchPreview}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    updateProfile(demo.profile);
                    router.push("/recommend");
                  }}
                  className="w-full text-center text-xs font-semibold py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Evaluate This Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Deterministic Eligibility</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rules strictly check age, income caps, community reservation, and state residency.
              No hallucinations or false guarantees.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Document Readiness Checker</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compare your documents against the exact required certificates. Missing documents are
              flagged with procurement instructions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Side-by-Side Comparison</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Evaluate any two government initiatives side-by-side on factual parameters without
              subjective bias.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
