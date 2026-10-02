import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">SchemeSmart</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Verified Data Engine
              </span>
            </div>
            <p className="text-slate-500 max-w-md leading-relaxed">
              SchemeSmart helps citizens discover, evaluate eligibility, check document readiness,
              and prepare for Tamil Nadu government welfare initiatives through verified data and
              contextual AI guidance.
            </p>
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Grounded in verified Tamil Nadu scheme records • Zero AI Hallucination</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/schemes" className="hover:text-emerald-700 transition">
                  Browse All Schemes
                </Link>
              </li>
              <li>
                <Link href="/recommend" className="hover:text-emerald-700 transition">
                  Eligibility Calculator
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-emerald-700 transition">
                  Document Readiness
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-emerald-700 transition">
                  Scheme Comparison
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Official Portals</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.tn.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <span>tn.gov.in Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tnesevai.tn.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <span>e-Sevai Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tnpds.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <span>TNPDS Ration Services</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 SchemeSmart. College AI/ML Project & Hackathon Initiative.</p>
          <p className="text-slate-400">
            Official government scheme rules & documentation remain the final authority.
          </p>
        </div>
      </div>
    </footer>
  );
}
