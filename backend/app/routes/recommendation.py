from fastapi import APIRouter
from app.models import (
    UserProfile, RecommendationRequest, RecommendationResponse,
    ProfileExtractRequest, ProfileExtractResponse
)
from app.services.recommendation import generate_recommendations
from app.services.profile_extraction import extract_profile_from_text

router = APIRouter(tags=["Recommendations & Profile"])

@router.post("/recommend", response_model=RecommendationResponse)
def recommend(req: RecommendationRequest):
    profile = UserProfile(
        name=req.name,
        age=req.age,
        gender=req.gender,
        state=req.state or "Tamil Nadu",
        district=req.district,
        occupation=req.occupation,
        income=req.income,
        caste=req.caste,
        community=req.community,
        disability=req.disability,
        bpl=req.bpl,
        student=req.student,
        farmer=req.farmer
    )
    return generate_recommendations(profile, query=req.query)

@router.post("/profile/extract", response_model=ProfileExtractResponse)
def extract_profile(req: ProfileExtractRequest):
    profile, entities = extract_profile_from_text(req.text)
    return ProfileExtractResponse(
        extracted=profile,
        detected_entities=entities
    )
