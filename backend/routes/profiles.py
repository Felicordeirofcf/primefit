from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.core.database import get_db
from src.core.models import Profile as DBProfile
from schemas import Profile

router = APIRouter()

@router.get("/profiles", response_model=List[Profile])
async def get_profiles(db: Session = Depends(get_db)):
    profiles = db.query(DBProfile).all()
    if not profiles:
        return []
    return profiles


