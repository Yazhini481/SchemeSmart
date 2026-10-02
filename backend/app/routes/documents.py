import io
import re
from typing import Any, Dict, List, Tuple
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.database import db
from app.models import (
    DocumentCheckRequest,
    DocumentCheckResponse,
    DocumentMappingResponse,
    FormAnalysisResponse,
    FormField,
)

router = APIRouter(prefix="/documents", tags=["Documents"])

FIELD_RULES: List[Tuple[List[str], str, str, str, bool, str]] = [
    (["name", "applicant name", "பெயர்"], "Name of Applicant", "Your full name as shown on your official identity document.", "உங்கள் அதிகாரப்பூர்வ அடையாள ஆவணத்தில் உள்ள முழுப் பெயரை எழுதுங்கள்.", True, "Full name"),
    (["date of birth", "dob", "birth date", "பிறந்த தேதி"], "Date of Birth", "Enter your date of birth in day/month/year format.", "உங்கள் பிறந்த தேதியை நாள்/மாதம்/ஆண்டு வடிவில் எழுதுங்கள்.", True, "DD/MM/YYYY"),
    (["address", "முகவரி"], "Address", "Enter your current residential address, including district and PIN code.", "மாவட்டம் மற்றும் அஞ்சல் குறியீட்டுடன் உங்கள் தற்போதைய முகவரியை எழுதுங்கள்.", True, "Complete postal address"),
    (["annual family income", "family income", "income", "வருமானம்"], "Annual Family Income", "Enter the total income earned by your family in one year. Follow the income definition in the official scheme instructions.", "உங்கள் குடும்பத்தின் ஒரு வருட மொத்த வருமானத்தை எழுதுங்கள். திட்டத்தின் அதிகாரப்பூர்வ வழிமுறையில் உள்ள வருமான வரையறையைப் பின்பற்றுங்கள்.", True, "Amount in INR per year"),
    (["occupation", "தொழில்"], "Occupation", "Enter your current occupation or livelihood.", "உங்கள் தற்போதைய தொழில் அல்லது வாழ்வாதாரத்தை எழுதுங்கள்.", False, "Occupation name"),
    (["bank account", "account number", "வங்கி கணக்கு"], "Bank Account Number", "Copy the account number from your bank passbook or statement. Check every digit.", "உங்கள் வங்கி பாஸ்புக் அல்லது அறிக்கையில் உள்ள கணக்கு எண்ணை எழுதுங்கள். ஒவ்வொரு இலக்கத்தையும் சரிபார்க்கவும்.", True, "Digits only"),
    (["ifsc", "ஐஎஃப்எஸ்சி"], "IFSC Code", "Enter the 11-character IFSC code printed on your passbook or cheque.", "உங்கள் பாஸ்புக் அல்லது காசோலையில் உள்ள 11 எழுத்து IFSC குறியீட்டை எழுதுங்கள்.", True, "11 characters, for example SBIN0001234"),
    (["certificate number", "income certificate number", "சான்றிதழ் எண்"], "Certificate Number", "Copy the certificate number exactly as printed on the certificate.", "சான்றிதழில் அச்சிடப்பட்ட எண்ணை அப்படியே எழுதுங்கள்.", False, "Exact printed number"),
]

def _field_rule(label: str) -> Tuple[str, str, str, str, bool, str]:
    lowered = label.lower()
    for keywords, canonical, explanation, explanation_tamil, required, expected in FIELD_RULES:
        if any(keyword in lowered for keyword in keywords):
            return canonical, explanation, explanation_tamil, "form", required, expected
    return label.strip().rstrip(":") or "Unnamed field", "Enter the information requested by this field. Check the official scheme instructions if you are unsure.", "இந்த புலம் கேட்கும் தகவலை எழுதுங்கள். சந்தேகம் இருந்தால் திட்டத்தின் அதிகாரப்பூர்வ வழிமுறையைப் பாருங்கள்.", "form", False, "As requested on the form"

def _extract_text(filename: str, content: bytes) -> Tuple[str, bool, str]:
    extension = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if extension in {"txt", "csv"}:
        return content.decode("utf-8", errors="ignore"), False, "text"
    if extension == "pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages), False, "pdf"
        except Exception:
            return "", False, "pdf"
    try:
        from PIL import Image
        import pytesseract
        image = Image.open(io.BytesIO(content))
        return pytesseract.image_to_string(image), True, "image"
    except Exception:
        return "", False, "image"

def _parse_fields(text: str) -> List[FormField]:
    fields: List[FormField] = []
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    pattern = re.compile(r"^(?:\d+[.)]?\s*)?(.+?)(?:\s*[:：]\s*|\s+[_\.]{3,}\s*$)")
    for line in lines:
        match = pattern.match(line)
        if not match:
            continue
        raw_label = re.sub(r"\s+", " ", match.group(1)).strip(" .:-")
        canonical, explanation, explanation_tamil, source, required, expected = _field_rule(raw_label)
        if len(raw_label) < 2 or len(raw_label) > 100 or any(field.label == canonical for field in fields):
            continue
        fields.append(FormField(id=f"field_{len(fields) + 1}", label=canonical, explanation=explanation, explanation_tamil=explanation_tamil, required=required, expected_format=expected, source=source, confidence=0.9))
    return fields

def _fallback_fields() -> List[FormField]:
    return [FormField(id=f"field_{index}", label=label, explanation=explanation, explanation_tamil=explanation_tamil, required=required, expected_format=expected, confidence=0.45) for index, (_, label, explanation, explanation_tamil, required, expected) in enumerate(FIELD_RULES[:7], 1)]

def normalize_doc(name: str) -> str:
    return name.lower().replace("card", "").replace("certificate", "").replace("proof", "").strip()

@router.post("/check", response_model=DocumentCheckResponse)
def check_document_readiness(req: DocumentCheckRequest):
    scheme = db.get_scheme_by_id(req.scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{req.scheme_id}' not found.")

    raw_docs_str = scheme.get("documents_required") or ""
    # Split documents by semicolon, comma, or newline
    delim = ";" if ";" in raw_docs_str else ("," if "," in raw_docs_str else "\n")
    required_docs = [d.strip() for d in raw_docs_str.split(delim) if d.strip()]

    user_docs_normalized = [normalize_doc(d) for d in req.available_documents]

    available = []
    missing = []

    for doc in required_docs:
        norm = normalize_doc(doc)
        if any(norm in u or u in norm for u in user_docs_normalized if u):
            available.append(doc)
        else:
            missing.append(doc)

    total_req = len(required_docs)
    avail_count = len(available)
    miss_count = len(missing)

    if miss_count == 0 and total_req > 0:
        readiness = "READY"
        guidance = "You have all required documents! You are ready to submit your application."
    elif avail_count > 0:
        readiness = "PARTIALLY_READY"
        guidance = f"You have {avail_count} of {total_req} documents. Obtain the remaining {miss_count} document(s) before applying."
    else:
        readiness = "MISSING_DOCUMENTS"
        guidance = f"Please collect the required {total_req} documents from your local e-Sevai centre, Taluk office, or school."

    is_online = scheme.get("application_mode") == "online"

    return DocumentCheckResponse(
        scheme_id=scheme.get("scheme_id"),
        scheme_name=scheme.get("name"),
        scheme_name_tamil=scheme.get("name_tamil"),
        required_documents=required_docs,
        available=available,
        missing=missing,
        readiness_status=readiness,
        total_required=total_req,
        available_count=avail_count,
        missing_count=miss_count,
        application_mode=scheme.get("application_mode", "offline"),
        is_online_application=is_online,
        application_process=scheme.get("application_process", ""),
        guidance=guidance
    )

@router.post("/analyze-form", response_model=FormAnalysisResponse)
async def analyze_form(file: UploadFile = File(...), scheme_id: str = Form(default="")):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A form file is required.")
    content = await file.read()
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Please upload a file smaller than 15 MB.")
    text, ocr_used, source_type = _extract_text(file.filename, content)
    fields = _parse_fields(text)
    if not fields:
        fields = _fallback_fields()
    scheme = db.get_scheme_by_id(scheme_id) if scheme_id else None
    return FormAnalysisResponse(
        filename=file.filename,
        source_type=source_type,
        ocr_used=ocr_used,
        extracted_text=text[:12000],
        fields=fields,
        official_form_url=(scheme or {}).get("apply_url") or (scheme or {}).get("official_url"),
        scheme_id=(scheme or {}).get("scheme_id"),
        scheme_name=(scheme or {}).get("name"),
        required_documents=[item.strip() for item in re.split(r"[;,\n]", (scheme or {}).get("documents_required", "")) if item.strip()],
    )

@router.post("/map-document", response_model=DocumentMappingResponse)
async def map_document(file: UploadFile = File(...)):
    content = await file.read()
    text, _, _ = _extract_text(file.filename or "document", content)
    matches: List[Dict[str, Any]] = []
    patterns = {
        "Certificate Number": r"(?:certificate|சான்றிதழ்)[^\n:#-]{0,30}(?:no|number|எண்)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9/.-]{4,})",
        "IFSC Code": r"\b([A-Z]{4}0[A-Z0-9]{6})\b",
        "Bank Account Number": r"(?:account|கணக்கு)[^\d\n]{0,20}(\d{8,18})",
    }
    for field_id, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            matches.append({"field_id": field_id, "value": match.group(1), "confidence": 0.78, "status": "needs_review"})
    return DocumentMappingResponse(filename=file.filename or "document", extracted_text=text[:12000], matches=matches)
