
import re
from typing import Dict, Any, List, Optional
from app.models import ChatContext, UserProfile, ChatResponse
from app.database import db
from app.services.eligibility import check_eligibility
from app.services.profile_extraction import extract_profile_from_text
from app.services.retrieval import retrieval_engine

TANGLISH_KEYWORDS = [
    "enakku", "enna", "kidaikkum", "thittam", "padikiren", "vivasayi",
    "varusham", "thevai", "eppadi", "apply pannalama", "naan", "illai",
    "pannunga", "solunga", "solla", "irukku", "kudupangala", "vayasu"
]

def detect_language(text: str, requested_lang: Optional[str] = None) -> str:
    # Tamil Unicode check
    if any('\u0B80' <= ch <= '\u0BFF' for ch in text):
        return "ta"
    if requested_lang and requested_lang in ["ta", "tanglish", "en"]:
        return requested_lang
    lower = text.lower()
    if any(k in lower for k in TANGLISH_KEYWORDS):
        return "tanglish"
    return "en"

def format_eligibility_report(scheme: Dict[str, Any], profile: UserProfile, lang: str) -> str:
    status, reasons, missing_info, _ = check_eligibility(scheme, profile)
    scheme_name = scheme.get("name", "this scheme")
    scheme_name_ta = scheme.get("name_tamil") or scheme_name

    if lang == "ta":
        lines = [f"**{scheme_name_ta} - தகுதி விவரம்:**\n"]
        if status == "ELIGIBLE":
            lines.append("✓ நீங்கள் இந்த திட்டத்திற்கு தகுதியானவர்!")
        elif status == "POTENTIAL_MATCH":
            lines.append("⚠ நீங்கள் தகுதி பெற வாய்ப்புள்ளது (கூடுதல் தகவல் தேவை):")
        else:
            lines.append("✗ தற்போதைய தகவலின்படி நீங்கள் தகுதி பெறவில்லை:")

        for r in reasons:
            lines.append(f"  {r}")
        for m in missing_info:
            lines.append(f"  {m}")

        lines.append(f"\n→ விண்ணப்ப முறை: {scheme.get('application_mode', 'நேரடி முறை')}")
        return "\n".join(lines)

    elif lang == "tanglish":
        lines = [f"**{scheme_name} - Eligibility Status:**\n"]
        if status == "ELIGIBLE":
            lines.append("✓ Neenga indha scheme-ku eligible!")
        elif status == "POTENTIAL_MATCH":
            lines.append("⚠ Neenga eligible aaga vaaipu irukku (Konjam info thevai):")
        else:
            lines.append("✗ Ungal profile-ku indha criteria match aagala:")

        for r in reasons:
            lines.append(f"  {r}")
        for m in missing_info:
            lines.append(f"  {m}")

        lines.append(f"\n→ Application Mode: {scheme.get('application_mode', 'Offline')}")
        return "\n".join(lines)

    else:
        lines = [f"Based on your profile for **{scheme_name}**:\n"]
        if status == "ELIGIBLE":
            lines.append("✓ You satisfy the structured eligibility conditions (Eligible):")
        elif status == "POTENTIAL_MATCH":
            lines.append("⚠ You appear to be a potential match (May be eligible, additional information needed):")
        else:
            lines.append("✗ You do not currently meet the stated eligibility criteria (Ineligible):")

        for r in reasons:
            lines.append(f"  {r}")
        for m in missing_info:
            lines.append(f"  {m}")

        lines.append(f"\n→ Application Mode: {scheme.get('application_mode', 'Offline').capitalize()}")
        if scheme.get('application_mode') == 'offline':
            lines.append("ℹ This is primarily an offline/in-person application process.")
        else:
            lines.append("ℹ Online application available on the official portal.")

        return "\n".join(lines)

def process_chat_message(
    message: str,
    context: Optional[ChatContext],
    profile: Optional[UserProfile],
    lang_pref: Optional[str] = None
) -> ChatResponse:
    lang = detect_language(message, lang_pref)
    msg_lower = message.lower().strip()
    
    ctx_page = context.page if context and context.page else "home"
    ctx_scheme_id = context.scheme_id if context else None
    ctx_selected = context.selected_schemes if context and context.selected_schemes else []
    
    # Merge any profile passed in context
    current_profile = profile or UserProfile()
    if context and context.user_profile:
        for k, v in context.user_profile.items():
            if v is not None and getattr(current_profile, k, None) is None:
                setattr(current_profile, k, v)

    # 1. Profile Extraction from message if user provides facts
    extracted_prof, entities = extract_profile_from_text(message)
    if entities:
        for k, v in entities.items():
            if v is not None:
                setattr(current_profile, k, v)

    context_used = {
        "page": ctx_page,
        "scheme_id": ctx_scheme_id,
        "selected_schemes": ctx_selected,
        "active_profile": current_profile.model_dump(exclude_none=True)
    }

    # Greetings
    greetings = ["hi", "hello", "hey", "vanakkam", "வணக்கம்", "namaste"]
    if msg_lower in greetings:
        if lang == "ta":
            reply = (
                "வணக்கம்! நான் SchemeSmart AI உதவியாளர். தமிழ்நாடு அரசு திட்டங்கள் பற்றிய தகுதி, நன்மைகள் மற்றும் ஆவணங்கள் பற்றி என்னிடம் கேளுங்கள்."
            )
            suggestions = ["எனக்கு என்ன திட்டம் கிடைக்கும்?", "மாணவர்களுக்கான கல்வி உதவித்தொகை", "மகளிர் திட்டங்கள்"]
        elif lang == "tanglish":
            reply = (
                "Vanakkam! Naan SchemeSmart AI Assistant. Tamil Nadu government schemes pathi therinjuka naan help panren. Unga eligibility, documents, application process pathi kekalaam."
            )
            suggestions = ["Enakku enna scheme kidaikkum?", "Student scholarship schemes", "Magalir schemes"]
        else:
            reply = (
                "Hello! I am SchemeSmart AI, your assistant for Tamil Nadu government schemes. How can I help you today?"
            )
            suggestions = ["Which schemes am I eligible for?", "Student scholarships", "Women welfare schemes"]
        return ChatResponse(
            reply=reply,
            language=lang,
            detected_intent="greeting",
            context_used=context_used,
            suggestions=suggestions
        )

    # -------------------------------------------------------------------------
    # CONTEXT 1: SCHEME DETAIL PAGE
    # -------------------------------------------------------------------------
    if ctx_page == "scheme_detail" and ctx_scheme_id:
        scheme = db.get_scheme_by_id(ctx_scheme_id)
        if scheme:
            # Check eligibility intent
            if any(k in msg_lower for k in ["eligible", "apply", "porunthuma", "kidaikkuma", "eligible-ah", " தகுதி"]):
                reply = format_eligibility_report(scheme, current_profile, lang)
                suggestions = ["What documents are required?", "How do I apply?", "What are the benefits?"]
                return ChatResponse(
                    reply=reply,
                    language=lang,
                    detected_intent="scheme_eligibility_check",
                    context_used=context_used,
                    relevant_schemes=[scheme],
                    suggestions=suggestions
                )

            # Documents intent
            if any(k in msg_lower for k in ["document", "docs", "aavanam", "certificate", "ஆவணங்கள்", "சான்றிதழ்"]):
                docs = scheme.get("documents_required", "Not specified in scheme record.")
                if lang == "ta":
                    reply = f"**{scheme.get('name_tamil', scheme.get('name'))} திட்டத்திற்கு தேவையான ஆவணங்கள்:**\n\n{scheme.get('documents_required_tamil', docs)}"
                elif lang == "tanglish":
                    reply = f"**{scheme.get('name')} scheme-ku thevaiyaana documents:**\n\n{docs}"
                else:
                    reply = f"**Required Documents for {scheme.get('name')}:**\n\n{docs}"
                return ChatResponse(
                    reply=reply,
                    language=lang,
                    detected_intent="scheme_documents",
                    context_used=context_used,
                    relevant_schemes=[scheme],
                    suggestions=["Am I eligible?", "How do I apply?"]
                )

            # Benefits intent
            if any(k in msg_lower for k in ["benefit", "money", "amount", "nanmai", "kasu", "payan", "நன்மை"]):
                b = scheme.get("benefits") or scheme.get("description")
                if lang == "ta":
                    reply = f"**{scheme.get('name_tamil', scheme.get('name'))} திட்டத்தின் நன்மைகள்:**\n\n{scheme.get('description_tamil', b)}"
                elif lang == "tanglish":
                    reply = f"**{scheme.get('name')} benefits:**\n\n{b}"
                else:
                    reply = f"**Benefits of {scheme.get('name')}:**\n\n{b}"
                return ChatResponse(
                    reply=reply,
                    language=lang,
                    detected_intent="scheme_benefits",
                    context_used=context_used,
                    relevant_schemes=[scheme],
                    suggestions=["Check required documents", "Am I eligible?"]
                )

            # Application Process intent
            if any(k in msg_lower for k in ["how to apply", "process", "apply", "vinnapikalam", "eppadi apply", "விண்ணப்பிப்பது"]):
                proc = scheme.get("application_process", "")
                mode = scheme.get("application_mode", "offline")
                url = scheme.get("apply_url") or scheme.get("official_url")
                if lang == "ta":
                    reply = f"**விண்ணப்பிக்கும் முறை:**\n\n{scheme.get('application_process_tamil', proc)}\n\nமுறை: {mode}\nஇணைப்பு: {url}"
                elif lang == "tanglish":
                    reply = f"**Application Process for {scheme.get('name')}:**\n\n{proc}\n\nMode: {mode}\nOfficial Link: {url}"
                else:
                    reply = f"**Application Process for {scheme.get('name')}:**\n\n{proc}\n\n→ Mode: {mode.capitalize()}\n→ Official Link: {url}"
                return ChatResponse(
                    reply=reply,
                    language=lang,
                    detected_intent="scheme_application_process",
                    context_used=context_used,
                    relevant_schemes=[scheme],
                    suggestions=["What documents are required?", "Am I eligible?"]
                )

    # -------------------------------------------------------------------------
    # CONTEXT 2: DOCUMENT CHECKER PAGE
    # -------------------------------------------------------------------------
    if ctx_page == "document_checker" and ctx_scheme_id:
        scheme = db.get_scheme_by_id(ctx_scheme_id)
        if scheme:
            raw_docs_str = scheme.get("documents_required") or ""
            delim = ";" if ";" in raw_docs_str else ("," if "," in raw_docs_str else "\n")
            req_docs = [d.strip() for d in raw_docs_str.split(delim) if d.strip()]

            user_avail = []
            if context and context.documents_state and "available" in context.documents_state:
                user_avail = context.documents_state["available"]

            missing = [d for d in req_docs if d not in user_avail]

            if any(k in msg_lower for k in ["missing", "which document", "what doc", "thevai", "illai", "விடுபட்ட"]):
                if missing:
                    missing_list = "\n".join([f"• {m}" for m in missing])
                    if lang == "ta":
                        reply = f"**விடுபட்ட ஆவணங்கள் ({scheme.get('name_tamil', scheme.get('name'))}):**\n\n{missing_list}\n\nஇந்த ஆவணங்களை உங்கள் அருகில் உள்ள இ-சேவை மையம் அல்லது தாலுகா அலுவலகத்தில் பெறலாம்."
                    elif lang == "tanglish":
                        reply = f"**Unga missing documents for {scheme.get('name')}:**\n\n{missing_list}\n\nIndha documents-ai nearby e-Sevai centre or Taluk office-la vaangalaam."
                    else:
                        reply = f"**Missing Documents for {scheme.get('name')}:**\n\n{missing_list}\n\nYou can apply for these certificates at your nearest e-Sevai centre or Taluk office."
                else:
                    reply = "✓ You have marked all required documents! You are ready to proceed with the application."
                return ChatResponse(
                    reply=reply,
                    language=lang,
                    detected_intent="document_checker_missing",
                    context_used=context_used,
                    relevant_schemes=[scheme],
                    suggestions=["Where do I get an income certificate?", "How to apply?"]
                )

            # Explaining specific documents
            if "income certificate" in msg_lower or "வருமான சான்றிதழ்" in msg_lower:
                reply = (
                    "**Income Certificate (வருமான சான்றிதழ்):**\n"
                    "Issued by the Revenue Department (Tahsildar). You can apply through any Tamil Nadu e-Sevai centre or online at tnesevai.tn.gov.in. Usually requires Aadhaar, salary slip/ITR or self-declaration, and ration card."
                )
                return ChatResponse(
                    reply=reply,
                    language=lang,
                    detected_intent="document_explanation",
                    context_used=context_used
                )

    # -------------------------------------------------------------------------
    # CONTEXT 3: COMPARISON PAGE
    # -------------------------------------------------------------------------
    if ctx_page == "comparison" and len(ctx_selected) >= 2:
        s1 = db.get_scheme_by_id(ctx_selected[0])
        s2 = db.get_scheme_by_id(ctx_selected[1])
        if s1 and s2:
            if any(k in msg_lower for k in ["difference", "compare", "main difference", "vidhyasam", "வித்தியாசம்"]):
                reply = (
                    f"**Comparison between {s1.get('name')} and {s2.get('name')}:**\n\n"
                    f"• **Target Beneficiaries:**\n  - {s1.get('name')}: {s1.get('beneficiary_type')}\n  - {s2.get('name')}: {s2.get('beneficiary_type')}\n\n"
                    f"• **Key Benefits:**\n  - {s1.get('name')}: {s1.get('benefits')}\n  - {s2.get('name')}: {s2.get('benefits')}\n\n"
                    f"• **Application Mode:**\n  - {s1.get('name')}: {s1.get('application_mode', 'offline').capitalize()}\n  - {s2.get('name')}: {s2.get('application_mode', 'offline').capitalize()}\n\n"
                    f"• **Documents:**\n  - {s1.get('name')}: {s1.get('documents_required')}\n  - {s2.get('name')}: {s2.get('documents_required')}"
                )
                return ChatResponse(
                    reply=reply,
                    language=lang,
                    detected_intent="scheme_comparison",
                    context_used=context_used,
                    relevant_schemes=[s1, s2]
                )

    # -------------------------------------------------------------------------
    # GENERAL DISCOVERY & RECOMMENDATION VIA RAG
    # -------------------------------------------------------------------------
    retrieved = retrieval_engine.retrieve(message, top_k=5)
    if retrieved and retrieved[0][1] > 0.05:
        top_scheme, score = retrieved[0]
        status, reasons, missing_info, _ = check_eligibility(top_scheme, current_profile)

        if lang == "ta":
            reply = (
                f"உங்கள் கேள்விக்கு பொருத்தமான திட்டம்: **{top_scheme.get('name_tamil', top_scheme.get('name'))}** ({top_scheme.get('category')})\n\n"
                f"**நன்மைகள்:** {top_scheme.get('description_tamil', top_scheme.get('benefits'))}\n"
                f"**தகுதி:** {top_scheme.get('eligibility_text_tamil', top_scheme.get('eligibility_text'))}\n\n"
                f"மேலும் விவரங்களுக்கு திட்ட அட்டையை கிளிக் செய்யவும்."
            )
        elif lang == "tanglish":
            reply = (
                f"Ungal query-ku match aagura scheme: **{top_scheme.get('name')}** ({top_scheme.get('category')})\n\n"
                f"**Benefits:** {top_scheme.get('benefits')}\n"
                f"**Eligibility:** {top_scheme.get('eligibility_text')}\n\n"
                f"Indha scheme-ku neenga eligible-ah nu paaka 'Am I eligible?' nu kekalaam."
            )
        else:
            reasons_str = "\n".join([f"  {r}" for r in reasons[:2]])
            reply = (
                f"I found a relevant government scheme: **{top_scheme.get('name')}** ({top_scheme.get('category')}).\n\n"
                f"**Benefits:** {top_scheme.get('benefits')}\n\n"
                f"**Eligibility Summary:**\n{top_scheme.get('eligibility_text')}\n"
            )
            if reasons:
                reply += f"\n**Your Profile Match:**\n{reasons_str}\n"

        return ChatResponse(
            reply=reply,
            language=lang,
            detected_intent="scheme_discovery",
            context_used=context_used,
            relevant_schemes=[top_scheme],
            suggestions=["Am I eligible for this scheme?", "What documents are needed?", "Show more schemes"]
        )

    # Fallback with strict hallucination protection
    if lang == "ta":
        fallback_msg = "கிடைக்கக்கூடிய திட்டத் தகவலில் இந்த விவரம் இல்லை. தயவுசெய்து தமிழ்நாடு அரசு போர்ட்டலை (www.tn.gov.in) சரிபார்க்கவும்."
    elif lang == "tanglish":
        fallback_msg = "Indha information available scheme data-la illa. Official Tamil Nadu department portal-la verify pannunga."
    else:
        fallback_msg = "I couldn't find that specific information in the available verified scheme data. Please verify on the official government portal (www.tn.gov.in)."

    return ChatResponse(
        reply=fallback_msg,
        language=lang,
        detected_intent="fallback_unknown",
        context_used=context_used,
        suggestions=["Find schemes for students", "Women welfare schemes", "Agriculture schemes"]
    )
