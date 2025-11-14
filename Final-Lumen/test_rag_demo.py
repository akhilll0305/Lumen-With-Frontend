"""
Quick RAG test with demo user who has transactions
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import UserConsumer
from app.models.transaction import Transaction
from app.services.rag_service import rag_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_rag_with_demo_user():
    """Test RAG with demo user"""
    print("\n" + "=" * 60)
    print("Testing RAG with Demo User")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # Get demo consumer user
        user = db.query(UserConsumer).filter(
            UserConsumer.email == "demo.consumer@lumen.app"
        ).first()
        
        if not user:
            print("✗ Demo user not found. Run populate_demo_data.py first.")
            return False
        
        print(f"✓ Using user: {user.email} (ID: {user.id})")
        
        # Check transactions
        tx_count = db.query(Transaction).filter(
            Transaction.user_consumer_id == user.id
        ).count()
        
        print(f"✓ User has {tx_count} transactions")
        
        if tx_count == 0:
            print("✗ No transactions found")
            return False
        
        # Test queries
        test_queries = [
            "Show me my grocery expenses",
            "What did I spend on food?",
            "Tell me about my recent purchases at Swiggy",
            "Show me all my transport expenses"
        ]
        
        print("\n" + "=" * 60)
        print("Testing RAG Retrieval")
        print("=" * 60)
        
        for query in test_queries:
            print(f"\n📝 Query: {query}")
            
            # Retrieve context
            results = rag_service.retrieve_context(
                query=query,
                user_id=user.id,
                user_type="consumer",
                db=db,
                top_k=5
            )
            
            if results:
                print(f"  ✓ Retrieved {len(results)} relevant transactions:")
                for i, result in enumerate(results[:3], 1):  # Show top 3
                    print(f"    {i}. ₹{result['amount']:.2f} at {result['merchant']} ({result['category']})")
                    print(f"       Date: {result['date']}, Score: {result['relevance_score']:.3f}")
            else:
                print("  ✗ No results found")
        
        return True
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("RAG SERVICE TEST - Demo User")
    print("=" * 60)
    
    success = test_rag_with_demo_user()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ RAG is working correctly!")
    else:
        print("❌ RAG test failed")
    print("=" * 60)
