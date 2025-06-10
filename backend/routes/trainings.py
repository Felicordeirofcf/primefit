from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.core.database import get_db
from src.core.models import Training as DBTraining
from src.schemas.training import Training

router = APIRouter()

@router.get("/trainings", response_model=List[Training])
async def get_trainings(db: Session = Depends(get_db)):
    trainings = db.query(DBTraining).all()
    if not trainings:
        return []
    return trainings


