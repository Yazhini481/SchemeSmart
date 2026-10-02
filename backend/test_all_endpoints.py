import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING SCHEMESMART BACKEND AUTOMATED TESTS")
    print("=" * 60)

    # 1. Root & Health
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("✓ GET / passed:", r.json()["app"])

    r = client.get("/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    print("✓ GET /health passed:", r.json()["status"])

    # 2. Scheme Discovery & Filters
    r = client.get("/schemes?limit=5")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] > 100, f"Expected >100 schemes, got {data['total']}"
    assert len(data["items"]) == 5
    print(f"✓ GET /schemes passed: Total {data['total']} schemes found, returned 5")

    # Category filter mapping
    r = client.get("/schemes?category=education&limit=3")
    assert r.status_code == 200
    ed_data = r.json()
    assert ed_data["total"] > 0
    print(f"✓ GET /schemes?category=education passed: Found {ed_data['total']} schemes")

    # Search filter
    r = client.get("/schemes?search=scholarship&limit=3")
    assert r.status_code == 200
    search_data = r.json()
    assert search_data["total"] > 0
    print(f"✓ GET /schemes?search=scholarship passed: Found {search_data['total']} schemes")

    # 3. Scheme Details
    r = client.get("/schemes/TN001")
    assert r.status_code == 200
    s1 = r.json()
    assert s1["scheme_id"] == "TN001"
    print(f"✓ GET /schemes/TN001 passed: '{s1['name']}'")

    # Also test numeric ID lookup
    r = client.get("/schemes/1")
    assert r.status_code == 200
    assert r.json()["scheme_id"] == "TN001"
    print("✓ GET /schemes/1 (numeric alias) passed")

    # 4. Profile Extraction
    prompt_text = "I am 21, studying engineering in Tamil Nadu. My family earns around 1.8 lakh per year."
    r = client.post("/profile/extract", json={"text": prompt_text})
    assert r.status_code == 200
    prof = r.json()["extracted"]
    assert prof["age"] == 21
    assert prof["student"] is True
    assert prof["income"] == 180000.0
    print(f"✓ POST /profile/extract passed: Age={prof['age']}, Student={prof['student']}, Income={prof['income']}")

    # 5. Recommendation Engine
    rec_payload = {
        "age": 20,
        "state": "Tamil Nadu",
        "student": True,
        "income": 150000.0,
        "occupation": "Engineering Student"
    }
    r = client.post("/recommend", json=rec_payload)
    assert r.status_code == 200
    recs = r.json()["recommendations"]
    assert len(recs) > 0
    top_rec = recs[0]
    print(f"✓ POST /recommend passed: Top match '{top_rec['name']}' (Status: {top_rec['eligibility_status']})")
    print(f"   Reasons: {top_rec['reasons']}")

    # 6. Document Readiness Checker
    doc_payload = {
        "scheme_id": "TN001",
        "available_documents": ["Aadhaar Card", "Ration Card"]
    }
    r = client.post("/documents/check", json=doc_payload)
    assert r.status_code == 200
    doc_res = r.json()
    assert doc_res["readiness_status"] == "PARTIALLY_READY"
    assert "Bank Passbook" in doc_res["missing"]
    print(f"✓ POST /documents/check passed: Status={doc_res['readiness_status']}, Missing={doc_res['missing']}")

    # 7. Comparison
    comp_payload = {
        "scheme_ids": ["TN001", "TN003"]
    }
    r = client.post("/compare", json=comp_payload)
    assert r.status_code == 200
    comp_res = r.json()
    assert len(comp_res["schemes"]) == 2
    print(f"✓ POST /compare passed: Compared '{comp_res['schemes'][0]['name']}' vs '{comp_res['schemes'][1]['name']}'")

    # 8. Context-Aware AI Chatbot
    # Context A: Scheme detail - "Am I eligible?"
    chat_payload = {
        "message": "Am I eligible for this scheme?",
        "language": "en",
        "context": {
            "page": "scheme_detail",
            "scheme_id": "TN001",
            "user_profile": {"gender": "female", "state": "Tamil Nadu", "age": 30}
        }
    }
    r = client.post("/chat", json=chat_payload)
    assert r.status_code == 200
    chat_res = r.json()
    assert "eligible" in chat_res["reply"].lower()
    print("✓ POST /chat (scheme_detail context) passed:")
    print("  ", chat_res["reply"][:120], "...")

    # Context B: Document checker - "Which document am I missing?"
    chat_payload = {
        "message": "Which document am I missing?",
        "language": "en",
        "context": {
            "page": "document_checker",
            "scheme_id": "TN001",
            "documents_state": {"available": ["Aadhaar Card"]}
        }
    }
    r = client.post("/chat", json=chat_payload)
    assert r.status_code == 200
    print("✓ POST /chat (document_checker context) passed")

    # Context C: Comparison - "What is the difference?"
    chat_payload = {
        "message": "What is the main difference?",
        "language": "en",
        "context": {
            "page": "comparison",
            "selected_schemes": ["TN001", "TN003"]
        }
    }
    r = client.post("/chat", json=chat_payload)
    assert r.status_code == 200
    print("✓ POST /chat (comparison context) passed")

    # Context D: Multilingual - Tanglish & Tamil
    r = client.post("/chat", json={"message": "Enakku enna scheme kidaikkum?", "language": "tanglish"})
    assert r.status_code == 200
    print("✓ POST /chat (Tanglish) passed")

    r = client.post("/chat", json={"message": "எனக்கு என்ன அரசு திட்டங்கள் கிடைக்கும்?", "language": "ta"})
    assert r.status_code == 200
    assert r.json()["language"] == "ta"
    print("✓ POST /chat (Tamil) passed")

    # Tamil script must be detected even when the UI still has English selected.
    r = client.post("/chat", json={"message": "எனக்கு என்ன அரசு திட்டங்கள் கிடைக்கும்?"})
    assert r.status_code == 200
    assert r.json()["language"] == "ta"
    print("✓ POST /chat (Tamil script with default language) passed")

    print("\n" + "=" * 60)
    print("ALL BACKEND TESTS COMPLETED SUCCESSFULLY (10/10 PASS)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
