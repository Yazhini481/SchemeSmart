import os
import sqlite3
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from app.utils.data_loader import load_all_schemes, CATEGORY_MAP

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

class DatabaseManager:
    def __init__(self):
        self.use_supabase = bool(SUPABASE_URL and SUPABASE_KEY)
        self.supabase_client = None
        self._local_schemes: List[Dict[str, Any]] = []
        self._scheme_by_id: Dict[str, Dict[str, Any]] = {}
        self._init_data()

    def _init_data(self):
        # Always preload verified scheme dataset
        self._local_schemes = load_all_schemes()
        self._scheme_by_id = {}
        for s in self._local_schemes:
            self._scheme_by_id[s["scheme_id"].upper()] = s
            self._scheme_by_id[str(s["id"])] = s
            self._scheme_by_id[s["slug"]] = s

        if self.use_supabase:
            try:
                from supabase import create_client
                self.supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
                print("Connected to Supabase PostgreSQL.")
            except Exception as e:
                print(f"Supabase connection notice: {e}. Falling back to verified local store.")
                self.use_supabase = False
        else:
            print("Supabase credentials not configured in .env. Running on verified local scheme store.")

    def get_all_schemes(self) -> List[Dict[str, Any]]:
        if self.use_supabase and self.supabase_client:
            try:
                res = self.supabase_client.table("schemes").select("*").execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                print(f"Supabase fetch error, using local dataset: {e}")
        return self._local_schemes

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        sid_clean = scheme_id.strip().upper()
        # Direct lookup
        if sid_clean in self._scheme_by_id:
            return self._scheme_by_id[sid_clean]
        
        # Numeric lookup e.g. "1" -> "TN001"
        if sid_clean.isdigit():
            padded = f"TN{int(sid_clean):03d}"
            if padded in self._scheme_by_id:
                return self._scheme_by_id[padded]
        
        # Check by slug or substring
        slug_clean = scheme_id.strip().lower()
        if slug_clean in self._scheme_by_id:
            return self._scheme_by_id[slug_clean]

        for s in self._local_schemes:
            if s["scheme_id"].lower() == slug_clean or s["slug"] == slug_clean:
                return s
        return None

    def search_and_filter(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        beneficiary: Optional[str] = None,
        state: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> (List[Dict[str, Any]], int):
        all_items = self.get_all_schemes()
        filtered = all_items

        # 1. State filter
        if state:
            st_lower = state.lower().strip()
            filtered = [s for s in filtered if st_lower in s.get("state", "").lower()]

        # 2. Category filter mapping
        if category:
            cat_lower = category.lower().strip()
            # Check if mapped to multiple actual categories
            mapped_actuals = CATEGORY_MAP.get(cat_lower, [cat_lower])
            mapped_actuals_lower = [m.lower() for m in mapped_actuals]
            filtered = [
                s for s in filtered
                if any(m in s.get("category", "").lower() for m in mapped_actuals_lower)
            ]

        # 3. Beneficiary filter
        if beneficiary:
            ben_lower = beneficiary.lower().strip()
            filtered = [
                s for s in filtered
                if ben_lower in s.get("beneficiary_type", "").lower() or ben_lower in s.get("category", "").lower()
            ]

        # 4. Search query
        if query:
            q_terms = [t.lower().strip() for t in query.split() if len(t.strip()) > 1]
            def matches(scheme: Dict[str, Any]) -> bool:
                searchable = (
                    f"{scheme.get('name', '')} {scheme.get('name_tamil', '')} "
                    f"{scheme.get('description', '')} {scheme.get('description_tamil', '')} "
                    f"{scheme.get('eligibility_text', '')} {scheme.get('benefits', '')} "
                    f"{scheme.get('category', '')} {scheme.get('beneficiary_type', '')} "
                    f"{scheme.get('documents_required', '')}"
                ).lower()
                return any(t in searchable for t in q_terms)

            if q_terms:
                filtered = [s for s in filtered if matches(s)]

        total = len(filtered)
        paginated = filtered[offset : offset + limit]
        return paginated, total

db = DatabaseManager()
