"""User endpoints - stub implementation"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.utils.auth import get_current_user
from app.models.user import UserConsumer, UserBusiness
from app.schemas.user import UserConsumerUpdate, UserBusinessUpdate
from datetime import datetime
import os
import uuid
from pathlib import Path

router = APIRouter()

# Directory to store uploaded avatars
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
):
    """Upload avatar image (public endpoint for registration)"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return URL
        avatar_url = f"/uploads/avatars/{unique_filename}"
        return {"avatar_url": avatar_url}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")


@router.get("/me")
async def get_current_user_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    user = current_user["user"]
    user_type = current_user.get("user_type", "consumer")
    
    # Get name based on user type
    if user_type == "business":
        name = getattr(user, 'business_name', None) or getattr(user, 'contact_person', None)
    else:
        name = getattr(user, 'name', None)
    
    # Return properly formatted user data
    user_data = {
        "id": user.id,
        "name": name,
        "email": user.email,
        "phone": getattr(user, 'phone', None),
        "location": getattr(user, 'location', None),
        "avatar_url": getattr(user, 'avatar_url', None),
        "created_at": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at),
        "user_type": user_type,
    }
    
    # Add business-specific fields if business user
    if user_type == "business":
        user_data.update({
            "business_name": getattr(user, 'business_name', None),
            "contact_person": getattr(user, 'contact_person', None),
            "gstin": getattr(user, 'gstin', None),
        })
    
    return user_data

@router.put("/me")
@router.patch("/me")
async def update_user_profile(
    update_data: UserConsumerUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user_data = current_user["user"]
    user_type = current_user.get("user_type", "CONSUMER")
    
    try:
        if user_type == "CONSUMER":
            user = db.query(UserConsumer).filter(UserConsumer.id == user_data["id"]).first()
        else:
            user = db.query(UserBusiness).filter(UserBusiness.id == user_data["id"]).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            if hasattr(user, field) and value is not None:
                setattr(user, field, value)
        
        user.last_active = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        # Return updated user data
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": getattr(user, 'phone', None),
            "location": getattr(user, 'location', None),
            "avatar_url": getattr(user, 'avatar_url', None),
            "created_at": user.created_at,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.patch("/me/consent")
async def update_consent(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update consent flags - implement as needed"""
    return {"message": "Consent update endpoint - to be implemented"}
