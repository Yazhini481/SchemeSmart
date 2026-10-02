import re
from typing import Dict, Any
from app.models import UserProfile

TN_DISTRICTS = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal",
    "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
    "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
    "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
    "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
]

def extract_profile_from_text(text: str) -> (UserProfile, Dict[str, Any]):
    """
    Extracts structured citizen demographics from natural language in English, Tamil, or Tanglish.
    """
    raw_entities: Dict[str, Any] = {}
    lower_text = text.lower()

    # 1. Age extraction
    # Matches: "20 years old", "20 yr", "age 20", "aged 20", "vayasu 20", "வயது 20", "20 years", "am 21"
    age = None
    age_patterns = [
        r'(?:am|aged?|age|vayasu|vayadhu|வயது)\s*(?:is|of|:)?\s*(\d{1,2})',
        r'(\d{1,2})\s*(?:years?\s*old|yrs?\s*old|varusham|வயது|yr)',
        r'(?:i am|naan)\s*(\d{1,2})',
    ]
    for pattern in age_patterns:
        match = re.search(pattern, lower_text)
        if match:
            val = int(match.group(1))
            if 1 <= val <= 105:
                age = val
                raw_entities["age"] = age
                break

    # 2. Income extraction
    # Matches: "1.5 lakh", "1.8 lakhs", "1.5L", "150000", "Rs. 1,50,000", "1.2 லட்சம்"
    income = None
    lakh_match = re.search(r'(?:rs\.?|inr|₹)?\s*([\d\.]+)\s*(?:lakhs?|lacs?|lac|லட்சம்|l\b)', lower_text)
    if lakh_match:
        try:
            num = float(lakh_match.group(1))
            income = num * 100000
            raw_entities["income"] = income
        except ValueError:
            pass

    if income is None:
        # Check raw number e.g. 150000 or 1,50,000
        num_match = re.search(r'(?:income|earns?|earning|salary|வருமானம்)\s*(?:is|around|of|:)?\s*(?:rs\.?|inr|₹)?\s*([\d,]{4,9})', lower_text)
        if num_match:
            try:
                raw_num = num_match.group(1).replace(",", "")
                income = float(raw_num)
                raw_entities["income"] = income
            except ValueError:
                pass

    # 3. State extraction
    state = "Tamil Nadu"
    if "tamil nadu" in lower_text or "tamilnadu" in lower_text or "தமிழ்நாடு" in lower_text or "tn" in lower_text:
        state = "Tamil Nadu"
        raw_entities["state"] = state

    # 4. District extraction
    district = None
    for d in TN_DISTRICTS:
        if d.lower() in lower_text:
            district = d
            raw_entities["district"] = district
            break

    # 5. Student status
    student = None
    student_keywords = [
        "student", "studying", "study", "engineering", "college", "school",
        "undergraduate", "postgraduate", "degree", "diploma", "b.e", "b.tech",
        "padikiren", "padikkiren", "மாணவர்", "மாணவி"
    ]
    if any(k in lower_text for k in student_keywords):
        student = True
        raw_entities["student"] = True

    # 6. Farmer status
    farmer = None
    farmer_keywords = [
        "farmer", "agriculture", "farming", "crop", "paddy", "vivasaayi",
        "vivasayi", "விவசாயி", "வேளாண்மை"
    ]
    if any(k in lower_text for k in farmer_keywords):
        farmer = True
        raw_entities["farmer"] = True

    # 7. Gender
    gender = None
    female_keywords = [
        "female", "woman", "women", "girl", "lady", "pregnant", "mother",
        "widow", "pen", "பெண்", "மகள்"
    ]
    male_keywords = [
        "male", "man", "boy", "aan", "ஆண்"
    ]
    if any(k in lower_text for k in female_keywords):
        gender = "female"
        raw_entities["gender"] = gender
    elif any(k in lower_text for k in male_keywords):
        gender = "male"
        raw_entities["gender"] = gender

    # 8. Disability
    disability = None
    disability_keywords = [
        "disabled", "disability", "differently abled", "handicap", "handicapped",
        "pwd", "மாற்றுத்திறனாளி"
    ]
    if any(k in lower_text for k in disability_keywords):
        disability = True
        raw_entities["disability"] = True

    # 9. BPL status
    bpl = None
    bpl_keywords = [
        "bpl", "below poverty line", "ration card", "poor family", "economically backward"
    ]
    if any(k in lower_text for k in bpl_keywords):
        bpl = True
        raw_entities["bpl"] = True

    # 10. Caste / Community
    caste = None
    caste_keywords = {
        "SC": ["sc", "scheduled caste", "ஆதிதிராவிடர்"],
        "ST": ["st", "scheduled tribe", "பழங்குடியினர்"],
        "MBC": ["mbc", "most backward"],
        "BC": ["bc", "backward class"],
        "General": ["general", "oc", "forward caste"]
    }
    for c_type, kw_list in caste_keywords.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', lower_text) for kw in kw_list):
            caste = c_type
            raw_entities["caste"] = caste
            break

    # 11. Occupation derivation
    occupation = None
    if student:
        if "engineering" in lower_text:
            occupation = "Engineering Student"
        else:
            occupation = "Student"
    elif farmer:
        occupation = "Farmer"
    elif "unemployed" in lower_text or "seeking job" in lower_text or "வேலையில்லை" in lower_text:
        occupation = "Unemployed"
    elif "entrepreneur" in lower_text or "business" in lower_text or "வியாபாரி" in lower_text:
        occupation = "Entrepreneur"

    if occupation:
        raw_entities["occupation"] = occupation

    profile = UserProfile(
        age=age,
        gender=gender,
        state=state,
        district=district,
        occupation=occupation,
        income=income,
        caste=caste,
        disability=disability,
        bpl=bpl,
        student=student,
        farmer=farmer
    )

    return profile, raw_entities
