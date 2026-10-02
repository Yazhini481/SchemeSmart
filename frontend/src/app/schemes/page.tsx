"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Filter,
  Compass,
  ArrowRight,
  GitCompare,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";

const CATEGORIES = [
  { id: "", label: "All Categories" },
  { id: "education", label: "Education" },
  { id: "agriculture", label: "Agriculture" },
  { id: "women", label: "Women Welfare" },
  { id: "health", label: "Health" },
  { id: "employment", label: "Employment & Skills" },
  { id: "housing", label: "Housing & Urban" },
  { id: "sports", label: "Sports" },
  { id: "transport", label: "Transport" },
  { id: "social", label: "Social Welfare" },
];

const BENEFICIARIES = [
  { id: "", label: "All Beneficiaries" },
  { id: "Students", label: "Students" },
  { id: "Women", label: "Women" },
  { id: "Farmers", label: "Farmers" },
  { id: "Youth", label: "Youth & Unemployed" },
  { id: "Senior Citizens", label: "Senior Citizens" },
  { id: "Low-income Families", label: "Low-Income Families" },
  { id: "Persons with Disabilities", label: "Differently Abled" },
];

function SchemesContent() {
  const searchParams = useSearchParams();
  const { setPageContext, selectedSchemeIds, toggleSelectScheme } = useApp();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [beneficiary, setBeneficiary] = useState("");
  const [page, setPage] = useState(1);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageContext("scheme_list");
  }, [setPageContext]);

  useEffect(() => {
    fetchSchemes();
  }, [search, category, beneficiary, page]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (beneficiary) params.append("beneficiary", beneficiary);
      params.append("page", page.toString());
      params.append("limit", "12");

      const res = await fetch(`${API_BASE}/schemes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch schemes");
      const data = await res.json();
      setSchemes(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Fetch schemes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setBeneficiary("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Verified Government Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tamil Nadu Government Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore 150+ verified initiatives with eligibility conditions, required documents, and
            application guidelines.
          </p>
        </div>

        {selectedSchemeIds.length > 0 && (
          <Link
            href="/compare"
            className="self-start md:self-auto flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Selected ({selectedSchemeIds.length}/2)</span>
          </Link>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, eligibility, or benefit..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Category"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition text-slate-700"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Beneficiary Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={beneficiary}
              onChange={(e) => {
                setBeneficiary(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Beneficiary"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition text-slate-700"
            >
              {BENEFICIARIES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0">Quick Filter:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                category === cat.id
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
          {(category || beneficiary || search) && (
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 shrink-0 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <span>
          Showing <strong className="text-slate-800">{schemes.length}</strong> of{" "}
          <strong className="text-slate-800">{total}</strong> verified initiatives
        </span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Scheme Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-xl border border-slate-200 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No schemes matched your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for a different keyword or reset filters to browse all 150 verified Tamil
            Nadu schemes.
          </p>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => {
            const isSelected = selectedSchemeIds.includes(scheme.scheme_id);
            const isOnline = scheme.application_mode === "online";

            return (
              <div
                key={scheme.scheme_id}
                className={`bg-white rounded-xl border transition-all flex flex-col justify-between hover:shadow-md ${
                  isSelected
                    ? "border-purple-500 ring-2 ring-purple-100"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div className="p-5 space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {scheme.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isOnline
                          ? "bg-teal-50 text-teal-800 border border-teal-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isOnline ? "Online Portal" : "Offline / Document Info"}
                    </span>
                  </div>

                  {/* Title & Tamil Title */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 hover:text-emerald-700 transition">
                      <Link href={`/schemes/${scheme.scheme_id}`}>{scheme.name}</Link>
                    </h3>
                    {scheme.name_tamil && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {scheme.name_tamil}
                      </p>
                    )}
                  </div>

                  {/* Beneficiary */}
                  <div className="text-xs text-slate-600">
                    <strong className="font-semibold text-slate-800">Target: </strong>
                    <span>{scheme.beneficiary_type || "General Citizens"}</span>
                  </div>

                  {/* Description / Benefits */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Eligibility Snippet */}
                  <div className="text-[11px] bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
                    <span className="font-bold text-slate-700 block">Eligibility:</span>
                    <p className="text-slate-600 line-clamp-2">{scheme.eligibility_text}</p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleSelectScheme(scheme.scheme_id)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded transition cursor-pointer ${
                      isSelected
                        ? "bg-purple-100 text-purple-800 border border-purple-300"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-purple-700" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <GitCompare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Compare</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/schemes/${scheme.scheme_id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 transition"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
          Loading Tamil Nadu schemes directory...
        </div>
      }
    >
      <SchemesContent />
    </Suspense>
  );
}
