"""User endpoints - stub implementation"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.utils.auth import get_current_user
from app.models.user import UserConsumer, UserBusiness
from app.schemas.user import UserConsumerUpdate, UserBusinessUpdate
from datetime import datetime

router = APIRouter()

@router.get("/me")
async def get_current_user_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    user = current_user["user"]
    user_type = current_user.get("user_type", "consumer")
    
    # Return properly formatted user data
    user_data = {
        "id": user.id,
        "name": user.name,
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
