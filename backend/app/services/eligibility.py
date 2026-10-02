from typing import Dict, Any, List, Tuple
from app.models import UserProfile

def check_eligibility(scheme: Dict[str, Any], profile: UserProfile) -> Tuple[str, List[str], List[str], float]:
    """
    Deterministically evaluates eligibility of a user profile against a scheme's structured criteria.
    Returns:
        status: "ELIGIBLE", "POTENTIAL_MATCH", "INELIGIBLE"
        reasons: List of verified matching criteria (e.g. "✓ Age requirement matches")
        missing_info: List of missing criteria marked as "Need more information"
        score: Internal relevance ranking score (not displayed as official %)
    """
    reasons = []
    missing_info = []
    failed = []
    score = 10.0 # Base score for existence in database

    # 1. State / Residence Check
    scheme_state = scheme.get("eligibility_state", "Tamil Nadu") or "Tamil Nadu"
    user_state = profile.state or "Tamil Nadu"
    if scheme_state.lower() in user_state.lower() or user_state.lower() in scheme_state.lower():
        reasons.append("✓ Tamil Nadu residency satisfied")
        score += 15.0
    else:
        failed.append(f"Requires residence in {scheme_state}")


    # 2. Gender Check
    scheme_gender = (scheme.get("eligibility_gender") or "all").lower()
    if scheme_gender != "all":
        if profile.gender:
            user_gender = profile.gender.lower().strip()
            if scheme_gender in user_gender or user_gender in scheme_gender:
                reasons.append(f"✓ Gender requirement satisfied ({scheme_gender.capitalize()})")
                score += 25.0
            else:
                failed.append(f"Scheme is designated specifically for {scheme_gender.capitalize()} beneficiaries")
        else:
            missing_info.append(f"⚠ Gender requirement ({scheme_gender.capitalize()}) needs to be verified")
            score += 5.0
    else:
        # Open to all genders
        pass

    # 3. Age Check
    min_age = scheme.get("eligibility_age_min")
    max_age = scheme.get("eligibility_age_max")
    if min_age is not None or max_age is not None:
        if profile.age is not None:
            age_ok = True
            if min_age is not None and profile.age < min_age:
                age_ok = False
                failed.append(f"Minimum age required is {min_age} years (User age: {profile.age})")
            if max_age is not None and profile.age > max_age:
                age_ok = False
                failed.append(f"Maximum age limit is {max_age} years (User age: {profile.age})")
            
            if age_ok:
                if min_age is not None and max_age is not None:
                    reasons.append(f"✓ Age requirement matches ({min_age}–{max_age} years)")
                elif min_age is not None:
                    reasons.append(f"✓ Age requirement matches (Above {min_age} years)")
                else:
                    reasons.append(f"✓ Age requirement matches (Under {max_age} years)")
                score += 20.0
        else:
            if min_age is not None and max_age is not None:
                missing_info.append(f"⚠ Age criteria applies ({min_age}–{max_age} years)")
            elif min_age is not None:
                missing_info.append(f"⚠ Age criteria applies (Minimum {min_age} years)")
            else:
                missing_info.append(f"⚠ Age criteria applies (Maximum {max_age} years)")
            score += 5.0

    # 4. Income Check
    income_max = scheme.get("eligibility_income_max")
    if income_max is not None:
        if profile.income is not None:
            if profile.income <= income_max:
                reasons.append(f"✓ Income falls within limit (<= ₹{income_max:,.0f}/year)")
                score += 20.0
            else:
                failed.append(f"Family income exceeds maximum threshold of ₹{income_max:,.0f}")
        else:
            missing_info.append(f"⚠ Annual income verification required (Limit: ₹{income_max:,.0f})")
            score += 5.0

    # 5. Caste / Community Check
    scheme_caste = (scheme.get("eligibility_caste") or "all").lower()
    if scheme_caste != "all":
        if profile.caste or profile.community:
            user_caste = (profile.caste or profile.community or "").lower()
            if any(c in user_caste for c in scheme_caste.split('/')):
                reasons.append(f"✓ Community category matches ({scheme.get('eligibility_caste')})")
                score += 20.0
            else:
                failed.append(f"Restricted to community category: {scheme.get('eligibility_caste')}")
        else:
            missing_info.append(f"⚠ Community category ({scheme.get('eligibility_caste')}) required")
            score += 5.0

    # 6. Disability Check
    if scheme.get("eligibility_disability"):
        if profile.disability is not None:
            if profile.disability:
                reasons.append("✓ Persons with disabilities reservation satisfied")
                score += 30.0
            else:
                failed.append("Designated for persons with certified disability")
        else:
            missing_info.append("⚠ Disability certificate / status verification required")
            score += 5.0

    # 7. Student / Education Check
    beneficiary = (scheme.get("beneficiary_type") or "").lower()
    cat = (scheme.get("category") or "").lower()
    if "student" in beneficiary or "education" in cat:
        if profile.student is not None:
            if profile.student:
                reasons.append("✓ Student / educational enrollment matches")
                score += 25.0
            else:
                failed.append("Designated for enrolled students")
        elif profile.occupation and any(k in profile.occupation.lower() for k in ["student", "studying", "college", "school"]):
            reasons.append("✓ Student status inferred from occupation")
            score += 25.0
        else:
            missing_info.append("⚠ Student enrollment verification needed")
            score += 5.0

    # 8. Farmer Check
    if "farmer" in beneficiary or "agriculture" in cat or "fisheries" in cat:
        if profile.farmer is not None:
            if profile.farmer:
                reasons.append("✓ Agriculture / Farmer status matches")
                score += 25.0
            else:
                failed.append("Designated specifically for farmers and agriculturalists")
        elif profile.occupation and any(k in profile.occupation.lower() for k in ["farmer", "agriculture", "vivasaayi"]):
            reasons.append("✓ Farmer status matches")
            score += 25.0
        else:
            missing_info.append("⚠ Land-holding or farmer status verification needed")
            score += 5.0

    # 9. BPL Check
    if scheme.get("eligibility_bpl"):
        if profile.bpl is not None:
            if profile.bpl:
                reasons.append("✓ Below Poverty Line (BPL) / Priority ration card matches")
                score += 20.0
            else:
                failed.append("Requires BPL or priority ration card")
        else:
            missing_info.append("⚠ BPL / ration card status verification needed")
            score += 5.0

    # Final Classification
    if failed:
        status = "INELIGIBLE"
        # Heavily penalize failed rules
        score = -100.0
    elif missing_info:
        status = "POTENTIAL_MATCH"
    else:
        status = "ELIGIBLE"
        score += 20.0

    return status, reasons, missing_info, score
