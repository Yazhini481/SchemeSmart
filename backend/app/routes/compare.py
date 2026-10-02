from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database import db
from app.models import ComparisonRequest, ComparisonResponse

router = APIRouter(prefix="/compare", tags=["Compare"])

def format_age_req(min_a, max_a):
    if min_a is not None and max_a is not None:
        return f"{min_a} to {max_a} years"
    elif min_a is not None:
        return f"Minimum {min_a} years"
    elif max_a is not None:
        return f"Maximum {max_a} years"
    return "No specific age constraint"

def format_income_req(max_i):
    if max_i:
        return f"Up to ₹{max_i:,.0f} per year"
    return "No specific income cap mentioned"

@router.post("", response_model=ComparisonResponse)
def compare_schemes(req: ComparisonRequest):
    if len(req.scheme_ids) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least two scheme IDs to compare.")

    schemes_data = []
    for sid in req.scheme_ids[:2]:
        s = db.get_scheme_by_id(sid)
        if not s:
            raise HTTPException(status_code=404, detail=f"Scheme '{sid}' not found.")
        schemes_data.append(s)

    s1, s2 = schemes_data[0], schemes_data[1]

    comparisons: Dict[str, Dict[str, Any]] = {
        "name": {
            "label": "Scheme Name",
            "scheme_1": s1.get("name"),
            "scheme_2": s2.get("name")
        },
        "name_tamil": {
            "label": "Tamil Name",
            "scheme_1": s1.get("name_tamil") or "N/A",
            "scheme_2": s2.get("name_tamil") or "N/A"
        },
        "category": {
            "label": "Category",
            "scheme_1": s1.get("category"),
            "scheme_2": s2.get("category")
        },
        "beneficiary_type": {
            "label": "Target Beneficiaries",
            "scheme_1": s1.get("beneficiary_type"),
            "scheme_2": s2.get("beneficiary_type")
        },
        "purpose": {
            "label": "Objective & Description",
            "scheme_1": s1.get("description"),
            "scheme_2": s2.get("description")
        },
        "benefits": {
            "label": "Benefits Provided",
            "scheme_1": s1.get("benefits"),
            "scheme_2": s2.get("benefits")
        },
        "age_requirements": {
            "label": "Age Requirements",
            "scheme_1": format_age_req(s1.get("eligibility_age_min"), s1.get("eligibility_age_max")),
            "scheme_2": format_age_req(s2.get("eligibility_age_min"), s2.get("eligibility_age_max"))
        },
        "income_requirements": {
            "label": "Income Requirements",
            "scheme_1": format_income_req(s1.get("eligibility_income_max")),
            "scheme_2": format_income_req(s2.get("eligibility_income_max"))
        },
        "gender_requirements": {
            "label": "Gender Eligibility",
            "scheme_1": (s1.get("eligibility_gender") or "all").capitalize(),
            "scheme_2": (s2.get("eligibility_gender") or "all").capitalize()
        },
        "caste_requirements": {
            "label": "Community / Caste",
            "scheme_1": s1.get("eligibility_caste") or "All communities",
            "scheme_2": s2.get("eligibility_caste") or "All communities"
        },
        "disability_requirements": {
            "label": "Disability Condition",
            "scheme_1": "Specifically for persons with disabilities" if s1.get("eligibility_disability") else "General citizen eligibility",
            "scheme_2": "Specifically for persons with disabilities" if s2.get("eligibility_disability") else "General citizen eligibility"
        },
        "bpl_requirements": {
            "label": "BPL / Ration Card Criteria",
            "scheme_1": "BPL / Priority Ration Card required" if s1.get("eligibility_bpl") else "Standard criteria",
            "scheme_2": "BPL / Priority Ration Card required" if s2.get("eligibility_bpl") else "Standard criteria"
        },
        "documents": {
            "label": "Required Documents",
            "scheme_1": s1.get("documents_required"),
            "scheme_2": s2.get("documents_required")
        },
        "application_process": {
            "label": "Application Process",
            "scheme_1": s1.get("application_process"),
            "scheme_2": s2.get("application_process")
        },
        "application_mode": {
            "label": "Application Mode",
            "scheme_1": (s1.get("application_mode") or "offline").capitalize(),
            "scheme_2": (s2.get("application_mode") or "offline").capitalize()
        },
        "application_link": {
            "label": "Official / Application URL",
            "scheme_1": s1.get("apply_url") or s1.get("official_url"),
            "scheme_2": s2.get("apply_url") or s2.get("official_url")
        }
    }

    return ComparisonResponse(
        schemes=[s1, s2],
        comparisons=comparisons
    )
