from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.database import db
from app.models import SchemeModel, SchemeListResponse
import math

router = APIRouter(prefix="/schemes", tags=["Schemes"])

@router.get("", response_model=SchemeListResponse)
def get_schemes(
    search: Optional[str] = Query(None, description="Search term across name, description, eligibility"),
    category: Optional[str] = Query(None, description="Category filter (e.g. education, agriculture, women, health)"),
    beneficiary: Optional[str] = Query(None, description="Beneficiary type filter (e.g. Students, Women, Farmers)"),
    state: Optional[str] = Query("Tamil Nadu", description="State filter"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page")
):
    offset = (page - 1) * limit
    items, total = db.search_and_filter(
        query=search,
        category=category,
        beneficiary=beneficiary,
        state=state,
        limit=limit,
        offset=offset
    )
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return SchemeListResponse(
        items=[SchemeModel(**s) for s in items],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{scheme_id}", response_model=SchemeModel)
def get_scheme_by_id(scheme_id: str):
    scheme = db.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with ID '{scheme_id}' not found.")
    return SchemeModel(**scheme)
