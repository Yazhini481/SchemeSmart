import os
import re
import pandas as pd
from typing import List, Dict, Any, Optional

CATEGORY_MAP = {
    "education": ["Education", "Skill Development"],
    "agriculture": ["Agriculture", "Fisheries"],
    "health": ["Health"],
    "women": ["Women Welfare", "Women Empowerment"],
    "employment": ["Employment", "Skill Development", "Entrepreneurship"],
    "business": ["Entrepreneurship", "Employment"],
    "housing": ["Housing", "Urban Development", "Rural Development", "Infrastructure"],
    "sports": ["Sports"],
    "transport": ["Transport"],
    "banking": ["Entrepreneurship", "Social Security"],
    "social": ["Social Welfare", "Social Security", "Public Welfare", "Food Security"],
    "sanitation": ["Urban Development", "Public Welfare", "Health"]
}

REVERSE_CATEGORY_MAP = {}
for friendly, actuals in CATEGORY_MAP.items():
    for act in actuals:
        if act.lower() not in REVERSE_CATEGORY_MAP:
            REVERSE_CATEGORY_MAP[act.lower()] = friendly

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def extract_structured_fields(row: pd.Series) -> Dict[str, Any]:
    name = str(row.get("scheme_name", "")).strip()
    name_ta = str(row.get("scheme_name_tamil", "")).strip() if pd.notna(row.get("scheme_name_tamil")) else ""
    cat = str(row.get("category", "")).strip()
    desc = str(row.get("description_en", "")).strip()
    desc_ta = str(row.get("description_ta", "")).strip() if pd.notna(row.get("description_ta")) else ""
    elig = str(row.get("eligibility_en", "")).strip()
    elig_ta = str(row.get("eligibility_ta", "")).strip() if pd.notna(row.get("eligibility_ta")) else ""
    docs = str(row.get("required_documents_en", "")).strip()
    docs_ta = str(row.get("required_documents_ta", "")).strip() if pd.notna(row.get("required_documents_ta")) else ""
    app_proc = str(row.get("application_process_en", "")).strip()
    app_proc_ta = str(row.get("application_process_ta", "")).strip() if pd.notna(row.get("application_process_ta")) else ""
    official_link = str(row.get("official_link", "https://www.tn.gov.in")).strip()

    combined_text = f"{name} {desc} {elig} {cat}".lower()

    # Determine beneficiary type
    beneficiary = "Citizens"
    if any(k in combined_text for k in ["farmer", "agriculture", "crop", "paddy", "irrigation", "soil"]):
        beneficiary = "Farmers"
    elif any(k in combined_text for k in ["girl student", "higher education", "school", "college", "student"]):
        beneficiary = "Students"
    elif any(k in combined_text for k in ["pregnant", "woman", "women", "widow", "mother", "magalir"]):
        beneficiary = "Women"
    elif any(k in combined_text for k in ["disability", "differently abled", "handicapped"]):
        beneficiary = "Persons with Disabilities"
    elif any(k in combined_text for k in ["senior citizen", "old age", "pension", "elderly"]):
        beneficiary = "Senior Citizens"
    elif any(k in combined_text for k in ["unemployed", "youth", "job seeker", "skill training", "entrepreneur"]):
        beneficiary = "Youth & Unemployed"
    elif any(k in combined_text for k in ["low income", "poor", "bpl", "ration card", "destitute"]):
        beneficiary = "Low-income Families"

    # Age criteria
    age_min = None
    age_max = None
    age_range_match = re.search(r'aged?\s*(\d{1,2})\s*[-–to]+\s*(\d{1,2})', combined_text)
    if age_range_match:
        age_min = int(age_range_match.group(1))
        age_max = int(age_range_match.group(2))
    elif "above 60" in combined_text or "senior citizen" in combined_text or "old age" in combined_text:
        age_min = 60
    elif "primary school" in combined_text or "breakfast" in combined_text:
        age_min = 5
        age_max = 12
    elif "girl child protection" in combined_text:
        age_min = 0
        age_max = 18
    elif "higher education" in combined_text or "college" in combined_text:
        age_min = 17
        age_max = 28
    elif "youth" in combined_text:
        age_min = 18
        age_max = 35

    # Gender criteria
    gender = "all"
    if any(k in combined_text for k in ["woman", "women", "girl", "pregnant", "mother", "widow", "magalir", "pudhumai penn"]):
        gender = "female"

    # Caste criteria
    caste = "all"
    if "sc/st" in combined_text or "scheduled caste" in combined_text:
        caste = "SC/ST"
    elif "bc/mbc" in combined_text or "backward class" in combined_text:
        caste = "BC/MBC"

    # Income limit
    income_max = None
    if any(k in combined_text for k in ["below poverty line", "bpl", "low income", "economically weaker", "poor"]):
        income_max = 200000
    if "1.5 lakh" in combined_text or "150000" in combined_text:
        income_max = 150000
    elif "2.5 lakh" in combined_text or "250000" in combined_text:
        income_max = 250000
    elif "1 lakh" in combined_text or "100000" in combined_text:
        income_max = 100000

    # Disability
    disability = any(k in combined_text for k in ["disability", "differently abled", "handicapped"])

    # BPL
    bpl = any(k in combined_text for k in ["bpl", "below poverty line", "poor families", "ration card holder", "destitute"])

    # Application mode
    proc_lower = app_proc.lower()
    if any(k in proc_lower for k in ["online portal", "apply online", "tn.gov.in portal", "esevai", "website"]):
        app_mode = "online"
    elif any(k in proc_lower for k in ["hospital", "ration shop", "primary health centre", "school administration", "taluk office", "collectorate"]):
        app_mode = "offline"
    else:
        app_mode = "hybrid"

    # Extract clean benefits string
    benefits = desc
    if len(desc) > 160:
        benefits = desc.split('.')[0] + '.'

    # Department / Ministry assignment
    ministry_map = {
        "Education": "School Education & Higher Education Department",
        "Agriculture": "Department of Agriculture and Farmers Welfare",
        "Fisheries": "Department of Animal Husbandry and Fisheries",
        "Health": "Health and Family Welfare Department",
        "Women Welfare": "Social Welfare and Women Empowerment Department",
        "Women Empowerment": "Social Welfare and Women Empowerment Department",
        "Employment": "Labour Welfare and Skill Development Department",
        "Skill Development": "Labour Welfare and Skill Development Department",
        "Entrepreneurship": "Micro, Small and Medium Enterprises Department",
        "Housing": "Housing and Urban Development Department",
        "Infrastructure": "Rural Development and Panchayat Raj Department",
        "Transport": "Transport Department",
        "Sports": "Youth Welfare and Sports Development Department",
        "Social Security": "Revenue and Disaster Management Department",
        "Social Welfare": "Social Welfare and Women Empowerment Department",
        "Food Security": "Food, Civil Supplies and Consumer Protection Department",
        "Urban Development": "Municipal Administration and Water Supply Department",
        "Rural Development": "Rural Development and Panchayat Raj Department",
        "Energy": "Energy Department",
        "Environment": "Environment, Climate Change and Forests Department",
        "Tourism": "Tourism, Culture and Religious Endowments Department",
        "Culture": "Tourism, Culture and Religious Endowments Department",
        "Public Welfare": "Public Department"
    }
    ministry = ministry_map.get(cat, "Government of Tamil Nadu")

    scheme_id_str = f"TN{int(row.get('scheme_id', 1)):03d}"

    return {
        "id": int(row.get("scheme_id", 1)),
        "scheme_id": scheme_id_str,
        "slug": slugify(name),
        "name": name,
        "name_tamil": name_ta,
        "description": desc,
        "description_tamil": desc_ta,
        "ministry": ministry,
        "department": ministry,
        "state": "Tamil Nadu",
        "category": cat,
        "beneficiary_type": beneficiary,
        "benefits": benefits,
        "eligibility_text": elig,
        "eligibility_text_tamil": elig_ta,
        "application_process": app_proc,
        "application_process_tamil": app_proc_ta,
        "documents_required": docs,
        "documents_required_tamil": docs_ta,
        "apply_url": official_link,
        "official_url": official_link,
        "eligibility_age_min": age_min,
        "eligibility_age_max": age_max,
        "eligibility_gender": gender,
        "eligibility_caste": caste,
        "eligibility_income_max": income_max,
        "eligibility_residence": "Tamil Nadu",
        "eligibility_state": "Tamil Nadu",
        "eligibility_disability": disability,
        "eligibility_bpl": bpl,
        "application_mode": app_mode,
        "url_status": "active",
        "scraped_at": "2026-03-01T10:00:00Z"
    }

def load_all_schemes(csv_path: Optional[str] = None) -> List[Dict[str, Any]]:
    if not csv_path:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        csv_path = os.path.join(base_dir, "dataset", "Schemes.csv")
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Schemes dataset not found at: {csv_path}")

    df = pd.read_csv(csv_path, encoding='utf-8')
    schemes = []
    for _, row in df.iterrows():
        try:
            item = extract_structured_fields(row)
            schemes.append(item)
        except Exception as e:
            continue
    return schemes
