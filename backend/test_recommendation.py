import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from app.services.profile_extraction import extract_profile_from_text
from app.services.recommendation import generate_recommendations

text = "I am a 20 year old engineering student from Tamil Nadu. My family income is 1.5 lakh."
profile, entities = extract_profile_from_text(text)
print("Extracted Profile:", profile.model_dump())

rec_response = generate_recommendations(profile)
print(f"\nTotal Recommendations: {rec_response.total}")
for i, item in enumerate(rec_response.recommendations[:5], 1):
    print(f"\n{i}. [{item.scheme_id}] {item.name}")
    print(f"   Status: {item.eligibility_status}")
    print(f"   Reasons: {item.reasons}")
    print(f"   Missing Info: {item.missing_information}")
    print(f"   Online Application: {item.is_online_application}")
