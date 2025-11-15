"""Test script to verify /me endpoint returns correct name for business users"""
from app.core.database import SessionLocal
from app.models.user import UserBusiness, UserConsumer

db = SessionLocal()

print("=" * 60)
print("CHECKING BUSINESS USERS")
print("=" * 60)

business_users = db.query(UserBusiness).all()
if business_users:
    for user in business_users:
        print(f"\nBusiness User ID: {user.id}")
        print(f"  business_name: {user.business_name}")
        print(f"  contact_person: {user.contact_person}")
        print(f"  email: {user.email}")
        print(f"  avatar_url: {user.avatar_url}")
        
        # Simulate what the /me endpoint does
        name = getattr(user, 'business_name', None) or getattr(user, 'contact_person', None)
        print(f"  → Would return as 'name': {name}")
else:
    print("No business users found")

print("\n" + "=" * 60)
print("CHECKING CONSUMER USERS")
print("=" * 60)

consumer_users = db.query(UserConsumer).all()
if consumer_users:
    for user in consumer_users[:3]:  # Show first 3
        print(f"\nConsumer User ID: {user.id}")
        print(f"  name: {user.name}")
        print(f"  email: {user.email}")
        print(f"  avatar_url: {user.avatar_url}")
else:
    print("No consumer users found")

db.close()
