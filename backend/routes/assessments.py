from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.core.database import get_db
from src.core.models import Assessment as DBAssessment
from src.schemas.assessment import Assessment

router = APIRouter()

@router.get("/assessments", response_model=List[Assessment])
async def get_assessments(db: Session = Depends(get_db)):
    assessments = db.query(DBAssessment).all()
    if not assessments:
        return []
    return assessments


