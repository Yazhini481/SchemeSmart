"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  CheckCircle2,
  FileCheck,
  GitCompare,
  Sparkles,
  UserCheck,
  Building2,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const {
    selectedSchemeIds,
    setAssistantOpen,
    userProfile,
    activeLanguage,
    setActiveLanguage,
  } = useApp();

  const tamil = activeLanguage === "ta";

  const navItems = [
    { label: tamil ? "திட்டங்கள்" : "Discover", href: "/schemes", icon: Compass },
    { label: tamil ? "தகுதி சரிபார்ப்பு" : "Check Eligibility", href: "/recommend", icon: CheckCircle2 },
    { label: tamil ? "ஆவண சரிபார்ப்பு" : "Document Checker", href: "/documents", icon: FileCheck },
    {
      label: tamil ? "ஒப்பிடுக" : "Compare",
      href: "/compare",
      icon: GitCompare,
      badge: selectedSchemeIds.length > 0 ? selectedSchemeIds.length : null,
    },
  ];

  const hasProfile = userProfile.age || userProfile.occupation || userProfile.income;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-emerald-800 transition">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                SchemeSmart
              </span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded tracking-wider">
                Tamil Nadu
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {tamil ? "அரசுத் திட்ட உதவியாளர்" : "AI-Powered Government Scheme Assistant"}
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-500"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Profile Indicator & AI Assistant Button */}
        <div className="flex items-center gap-3">
          {hasProfile && (
            <Link
              href="/recommend"
              className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-full hover:bg-slate-200 transition"
              title="Active Profile"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {userProfile.occupation || (userProfile.student ? "Student" : "Citizen")}
                {userProfile.age ? `, ${userProfile.age}y` : ""}
              </span>
            </Link>
          )}

          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tamil ? "AI-யிடம் கேளுங்கள்" : "Ask AI"}</span>
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-[11px] font-bold shadow-xs" aria-label="Interface language">
            <button type="button" onClick={() => setActiveLanguage("en")} className={`rounded px-2 py-1 transition ${!tamil ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              EN
            </button>
            <button type="button" onClick={() => setActiveLanguage("ta")} className={`rounded px-2 py-1 transition ${tamil ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
