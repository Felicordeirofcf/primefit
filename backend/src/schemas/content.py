from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Modelo para conteúdo (artigos, dicas, etc.)
class Content(BaseModel):
    id: Optional[str] = None
    title: str
    summary: str
    body: str
    author_id: str
    category: str  # "article", "tip", "success_story", etc.
    tags: List[str]
    image_url: Optional[str] = None
    published: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Modelo para criação de conteúdo
class ContentCreate(BaseModel):
    title: str
    summary: str
    body: str
    category: str
    tags: List[str]
    image_url: Optional[str] = None
    published: bool = True
    
    class Config:
        from_attributes = True

# Modelo para comentário
class Comment(BaseModel):
    id: Optional[str] = None
    content_id: str
    user_id: str
    text: str
    created_at: datetime
    
    class Config:
        from_attributes = True
