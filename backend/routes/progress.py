from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.core.database import get_db
from src.core.models import Progress as DBProgress
from src.schemas.progress import Progress

router = APIRouter()

@router.get("/progress", response_model=List[Progress])
async def get_progress(db: Session = Depends(get_db)):
    progress_data = db.query(DBProgress).all()
    if not progress_data:
        return []
    return progress_data


