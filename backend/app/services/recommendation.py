from typing import List, Dict, Any, Optional
from app.models import UserProfile, RecommendationItem, RecommendationResponse
from app.services.eligibility import check_eligibility
from app.services.retrieval import retrieval_engine
from app.database import db

def generate_recommendations(profile: UserProfile, query: Optional[str] = None) -> RecommendationResponse:
    # Build query text from profile if no explicit query
    search_terms = []
    if query:
        search_terms.append(query)
    if profile.student or (profile.occupation and "student" in profile.occupation.lower()):
        search_terms.append("student scholarship higher education school laptop bicycle")
    if profile.farmer or (profile.occupation and "farmer" in profile.occupation.lower()):
        search_terms.append("farmer agriculture crop subsidy loan fertilizer")
    if profile.gender == "female":
        search_terms.append("women girl magalir mother")
    if profile.disability:
        search_terms.append("disability differently abled pension assistance")
        
    if profile.age and profile.age >= 60:
        search_terms.append("senior citizen old age pension elderly")
    if profile.bpl:
        search_terms.append("bpl welfare financial assistance low income")

    search_query = " ".join(search_terms)

    # 1. Semantic retrieval of top candidates
    candidates_with_sim = retrieval_engine.retrieve(search_query, top_k=60)

    recommendations: List[RecommendationItem] = []
    eligible_items = []
    potential_items = []

    for scheme, sim_score in candidates_with_sim:
        status, reasons, missing_info, rule_score = check_eligibility(scheme, profile)

        # Skip completely ineligible schemes unless they matched explicitly
        if status == "INELIGIBLE":
            continue

        total_score = rule_score + (sim_score * 30.0)

        # Check online vs offline mode
        is_online = scheme.get("application_mode", "offline") == "online"
        apply_url = scheme.get("apply_url") or scheme.get("official_url")

        item = RecommendationItem(
            scheme_id=scheme.get("scheme_id", ""),
            name=scheme.get("name", ""),
            name_tamil=scheme.get("name_tamil"),
            category=scheme.get("category", ""),
            beneficiary_type=scheme.get("beneficiary_type", "Citizens"),
            reasons=reasons,
            missing_information=missing_info,
            eligibility_status=status,
            benefits=scheme.get("benefits", "") or scheme.get("description", ""),
            documents_required=scheme.get("documents_required", ""),
            apply_url=apply_url,
            official_url=scheme.get("official_url"),
            application_mode=scheme.get("application_mode", "offline"),
            is_online_application=is_online,
            relevance_score=round(total_score, 1)
        )

        if status == "ELIGIBLE":
            eligible_items.append((item, total_score))
        elif status == "POTENTIAL_MATCH":
            potential_items.append((item, total_score))

    # Sort each group by total score descending
    eligible_items.sort(key=lambda x: x[1], reverse=True)
    potential_items.sort(key=lambda x: x[1], reverse=True)

    sorted_items = [x[0] for x in eligible_items] + [x[0] for x in potential_items]

    # If no items found, fallback to general popular schemes
    if not sorted_items:
        fallback_schemes = db.get_all_schemes()[:10]
        for scheme in fallback_schemes:
            status, reasons, missing_info, _ = check_eligibility(scheme, profile)
            if status != "INELIGIBLE":
                sorted_items.append(RecommendationItem(
                    scheme_id=scheme.get("scheme_id", ""),
                    name=scheme.get("name", ""),
                    name_tamil=scheme.get("name_tamil"),
                    category=scheme.get("category", ""),
                    beneficiary_type=scheme.get("beneficiary_type", "Citizens"),
                    reasons=reasons or ["✓ Available state welfare initiative"],
                    missing_information=missing_info,
                    eligibility_status=status,
                    benefits=scheme.get("benefits", ""),
                    documents_required=scheme.get("documents_required", ""),
                    apply_url=scheme.get("apply_url"),
                    official_url=scheme.get("official_url"),
                    application_mode=scheme.get("application_mode", "offline"),
                    is_online_application=scheme.get("application_mode") == "online"
                ))

    return RecommendationResponse(
        recommendations=sorted_items[:20],
        total=len(sorted_items),
        profile_summary={
            "age": profile.age,
            "gender": profile.gender,
            "state": profile.state,
            "income": profile.income,
            "occupation": profile.occupation,
            "student": profile.student,
            "farmer": profile.farmer
        }
    )
