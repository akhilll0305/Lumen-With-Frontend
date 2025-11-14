"""
Gemini AI Service - Integration with Google Gemini API
"""

import google.generativeai as genai
from typing import Dict, List, Optional
import logging
import json
import time
from google.api_core import retry

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Google Gemini AI Service for classification and RAG"""
    
    def __init__(self):
        # Use gemini-1.5-flash-latest (stable) instead of experimental models
        # Fallback to basic responses if API fails
        try:
            self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
            self.chat_model = genai.GenerativeModel('gemini-1.5-flash-latest')
            logger.info("Gemini models initialized with gemini-1.5-flash-latest")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini models: {e}")
            self.model = None
            self.chat_model = None
    
    def _call_with_retry(self, func, *args, max_retries=3, **kwargs):
        """Call Gemini API with exponential backoff retry"""
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_str = str(e)
                # Check if it's a quota/rate limit error
                if "429" in error_str or "quota" in error_str.lower() or "rate limit" in error_str.lower():
                    if attempt < max_retries - 1:
                        wait_time = (2 ** attempt) * 5  # 5s, 10s, 20s
                        logger.warning(f"Rate limit hit, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"Max retries exceeded for Gemini API: {e}")
                        raise
                else:
                    # Non-rate-limit error, raise immediately
                    logger.error(f"Gemini API error: {e}")
                    raise
        return None
    
    def classify_transaction(
        self,
        merchant_name: str,
        amount: float,
        parsed_fields: Dict,
        user_categories: List[str],
        user_history: Optional[Dict] = None
    ) -> Dict:
        """
        Classify transaction using Gemini
        
        Returns: {
            "category": str,
            "confidence": float,
            "reasoning": str
        }
        """
        try:
            # Fallback if model not available
            if self.model is None:
                logger.warning("Gemini model not available, using fallback classification")
                return self._fallback_classification(merchant_name, user_categories)
            
            prompt = f"""You are a financial transaction classifier.

User's Categories: {', '.join(user_categories)}

Transaction Details:
- Merchant: {merchant_name}
- Amount: ₹{amount}
- Parsed Fields: {json.dumps(parsed_fields, indent=2)}

{f"User History: User typically categorizes similar merchants as: {user_history}" if user_history else ""}

Task: Classify this transaction into ONE of the user's categories.

Respond ONLY with valid JSON in this format:
{{
    "category": "category_name",
    "confidence": 0.95,
    "reasoning": "Brief explanation"
}}

If you cannot confidently classify (confidence < 0.6), use category "Unknown"."""

            response = self._call_with_retry(self.model.generate_content, prompt)
            result_text = response.text.strip()
            
            # Extract JSON from response
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text)
            
            # Validate category is in user's list
            if result['category'] not in user_categories and result['category'] != "Unknown":
                result['category'] = "Unknown"
                result['confidence'] = 0.3
                result['reasoning'] = "Category not in user's defined categories"
            
            logger.info(f"Classified transaction as {result['category']} with confidence {result['confidence']}")
            return result
        
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return self._fallback_classification(merchant_name, user_categories)
    
    def _fallback_classification(self, merchant_name: str, user_categories: List[str]) -> Dict:
        """Fallback classification using simple keyword matching"""
        merchant_lower = merchant_name.lower()
        
        # Simple keyword mapping
        keyword_map = {
            "groceries": ["grocery", "supermarket", "market", "store"],
            "food & dining": ["restaurant", "cafe", "pizza", "burger", "food", "dining"],
            "transport": ["uber", "ola", "taxi", "fuel", "petrol", "gas"],
            "utilities": ["electricity", "water", "phone", "internet"],
            "entertainment": ["movie", "cinema", "netflix", "spotify", "game"],
            "shopping": ["amazon", "flipkart", "shop"],
            "inventory": ["supplier", "wholesale", "stock"],
            "supplies": ["office", "supply", "stationery"],
        }
        
        # Check each category
        for category in user_categories:
            category_lower = category.lower()
            keywords = keyword_map.get(category_lower, [category_lower])
            
            for keyword in keywords:
                if keyword in merchant_lower:
                    return {
                        "category": category,
                        "confidence": 0.6,
                        "reasoning": f"Matched keyword '{keyword}' in merchant name (fallback classification)"
                    }
        
        return {
            "category": "Unknown",
            "confidence": 0.3,
            "reasoning": "Could not classify - Gemini API unavailable and no keyword match"
        }
    
    def generate_chat_response(
        self,
        query: str,
        context: List[Dict],
        session_memory: Dict,
        persistent_memory: Dict
    ) -> Dict:
        """
        Generate RAG response using Gemini
        
        Args:
            query: User's question
            context: Retrieved transaction/document context
            session_memory: Session-level facts
            persistent_memory: Persistent user facts
        
        Returns: {
            "response": str,
            "intent": str,
            "confidence": float,
            "provenance": [transaction_ids],
            "should_show_transactions": bool
        }
        """
        try:
            # Fallback if model not available
            if self.chat_model is None:
                logger.warning("Gemini chat model not available, using fallback response")
                return self._fallback_chat_response(query, context)
            
            # Detect if query is conversational (greetings, name, casual chat)
            query_lower = query.lower().strip()
            conversational_patterns = [
                "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
                "my name is", "i am", "i'm", "call me", "thanks", "thank you",
                "how are you", "what's up", "whats up", "sup", "what can you do",
                "help", "bye", "goodbye", "see you"
            ]
            
            is_conversational = any(pattern in query_lower for pattern in conversational_patterns)
            
            # If conversational and no transaction keywords, don't show transactions
            transaction_keywords = [
                "spend", "spent", "transaction", "payment", "paid", "bought", "purchase",
                "expense", "cost", "money", "rupee", "₹", "grocery", "food", "dining",
                "transport", "shopping", "bill", "merchant", "show me", "tell me about",
                "how much", "where", "when did i", "category", "total"
            ]
            
            has_transaction_keywords = any(keyword in query_lower for keyword in transaction_keywords)
            
            # Build context string only if needed
            context_str = ""
            if context and has_transaction_keywords:
                context_str = "\n\n".join([
                    f"Transaction {i+1} (ID: {ctx.get('id', 'N/A')}): ₹{ctx.get('amount', 0)} at {ctx.get('merchant', 'Unknown')} on {ctx.get('date', 'Unknown')}, Category: {ctx.get('category', 'N/A')}"
                    for i, ctx in enumerate(context[:5])  # Top 5 contexts
                ])
            
            session_facts = "\n".join([f"- {k}: {v}" for k, v in session_memory.items()])
            persistent_facts = "\n".join([f"- {k}: {v}" for k, v in persistent_memory.items()])
            
            prompt = f"""You are LUMEN, an AI financial assistant helping a user understand their transactions.

Session Facts (Current conversation):
{session_facts if session_facts else "None"}

Persistent User Facts:
{persistent_facts if persistent_facts else "None"}

Retrieved Transaction Context:
{context_str if context_str else "No specific transactions found"}

User Query: {query}

Instructions:
1. Detect if this is a conversational query (greetings, introducing name, casual chat) or a transaction-related query
2. For conversational queries: Respond naturally, be friendly, remember user facts. DO NOT mention transactions.
3. For transaction queries: Answer based on the provided transaction data, mention specific details
4. Classify the intent: "conversational" (greetings, name, chat), "transaction_query" (asking about spending), "summary", "trend", or "unknown"
5. Provide confidence score (0-1)
6. Set "should_show_transactions" to true ONLY if the query is about transactions and you found relevant data

Respond ONLY with valid JSON:
{{
    "response": "Your natural language response here",
    "intent": "intent_type",
    "confidence": 0.95,
    "provenance": [list of transaction IDs used, empty if conversational],
    "should_show_transactions": false,
    "reasoning": "Why you gave this answer"
}}"""

            response = self._call_with_retry(self.chat_model.generate_content, prompt)
            result_text = response.text.strip()
            
            # Extract JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text)
            
            # Ensure should_show_transactions is set
            if "should_show_transactions" not in result:
                # Default based on intent and context
                result["should_show_transactions"] = (
                    result.get("intent") not in ["conversational", "unknown"] 
                    and len(context) > 0
                    and has_transaction_keywords
                )
            
            logger.info(f"Generated chat response with intent {result.get('intent', 'unknown')}, show_transactions: {result.get('should_show_transactions', False)}")
            return result
        
        except Exception as e:
            logger.error(f"Chat generation error: {e}")
            return self._fallback_chat_response(query, context)
    
    def _fallback_chat_response(self, query: str, context: List[Dict]) -> Dict:
        """Fallback chat response when Gemini is unavailable"""
        query_lower = query.lower()
        
        # Greetings and conversational patterns
        if any(g in query_lower for g in ["hello", "hi", "hey", "good morning", "good evening"]):
            return {
                "response": "Hello! I'm LUMEN, your financial assistant. I can help you understand your transactions, spending patterns, and answer questions about your finances. How can I help you today?",
                "intent": "conversational",
                "confidence": 0.9,
                "provenance": [],
                "should_show_transactions": False,
                "reasoning": "Greeting detected"
            }
        
        if any(p in query_lower for p in ["my name is", "i am", "i'm", "call me"]):
            return {
                "response": "Nice to meet you! I'll remember that. Feel free to ask me anything about your transactions and spending.",
                "intent": "conversational",
                "confidence": 0.9,
                "provenance": [],
                "should_show_transactions": False,
                "reasoning": "User introduction detected"
            }
        
        if any(p in query_lower for p in ["how are you", "what's up", "whats up"]):
            return {
                "response": "I'm doing great, thank you for asking! I'm here to help you with your financial questions. What would you like to know?",
                "intent": "conversational",
                "confidence": 0.9,
                "provenance": [],
                "should_show_transactions": False,
                "reasoning": "Casual greeting"
            }
        
        if any(p in query_lower for p in ["thank", "thanks"]):
            return {
                "response": "You're welcome! Let me know if you need anything else.",
                "intent": "conversational",
                "confidence": 0.9,
                "provenance": [],
                "should_show_transactions": False,
                "reasoning": "Thanks detected"
            }
        
        if any(p in query_lower for p in ["help", "what can you do"]):
            return {
                "response": "I can help you analyze your transactions, track spending patterns, answer questions about specific purchases, and provide financial insights. Just ask me anything!",
                "intent": "conversational",
                "confidence": 0.9,
                "provenance": [],
                "should_show_transactions": False,
                "reasoning": "Help request"
            }
        
        if any(p in query_lower for p in ["bye", "goodbye", "see you"]):
            return {
                "response": "Goodbye! Feel free to come back anytime you need help with your finances.",
                "intent": "conversational",
                "confidence": 0.9,
                "provenance": [],
                "should_show_transactions": False,
                "reasoning": "Goodbye detected"
            }
        
        # Check for transaction-related keywords
        transaction_keywords = ["spend", "spent", "transaction", "payment", "paid", "bought", "purchase", "expense", "grocery", "food", "transport"]
        is_transaction_query = any(keyword in query_lower for keyword in transaction_keywords)
        
        # If we have context and it's a transaction query, provide basic summary
        if context and len(context) > 0 and is_transaction_query:
            total = sum(ctx.get('amount', 0) for ctx in context)
            count = len(context)
            return {
                "response": f"I found {count} relevant transaction(s) totaling ₹{total:.2f}. The transactions include: " + ", ".join([f"₹{ctx.get('amount', 0)} at {ctx.get('merchant', 'Unknown')}" for ctx in context[:3]]) + ". (Note: AI assistant is currently unavailable, showing basic data)",
                "intent": "summary",
                "confidence": 0.6,
                "provenance": [ctx.get('id') for ctx in context if 'id' in ctx],
                "should_show_transactions": True,
                "reasoning": "Fallback response with transaction data"
            }
        
        # No context available or not a transaction query
        if not is_transaction_query:
            return {
                "response": "I'm here to help! You can ask me about your transactions, spending patterns, or specific purchases. What would you like to know?",
                "intent": "conversational",
                "confidence": 0.7,
                "provenance": [],
                "should_show_transactions": False,
                "reasoning": "General query, no transaction keywords"
            }
        
        return {
            "response": "I'm currently running in limited mode. I couldn't find specific transactions related to your query. This could be because there are no matching transactions, or the AI service is temporarily unavailable. Please try again later or rephrase your question.",
            "intent": "unknown",
            "confidence": 0.3,
            "provenance": [],
            "should_show_transactions": False,
            "reasoning": "No context available and Gemini unavailable"
        }
    
    def extract_intent(self, query: str) -> str:
        """Extract intent from user query"""
        try:
            prompt = f"""Classify the intent of this user query about financial transactions:

Query: "{query}"

Intents:
- exact_lookup: User asking about a specific payment ("Did I pay X?")
- summary: User wants aggregated data ("How much did I spend?")
- trend: User asking about patterns ("Where do I spend most?")
- conversational: General chat or greetings
- unknown: Cannot determine

Respond with ONLY ONE WORD: the intent name."""

            response = self.model.generate_content(prompt)
            intent = response.text.strip().lower()
            
            valid_intents = ["exact_lookup", "summary", "trend", "conversational", "unknown"]
            if intent not in valid_intents:
                intent = "unknown"
            
            return intent
        
        except Exception as e:
            logger.error(f"Intent extraction error: {e}")
            return "unknown"
    
    def explain_anomaly(
        self,
        transaction: Dict,
        pattern: Dict,
        anomaly_details: Dict
    ) -> str:
        """Generate human-readable explanation for anomaly"""
        try:
            prompt = f"""Explain why this transaction was flagged as unusual:

Transaction:
{json.dumps(transaction, indent=2)}

Normal Pattern:
{json.dumps(pattern, indent=2)}

Anomaly Details:
{json.dumps(anomaly_details, indent=2)}

Provide a clear, non-technical explanation for the user in 2-3 sentences."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
        
        except Exception as e:
            logger.error(f"Anomaly explanation error: {e}")
            return "This transaction appears unusual based on your spending patterns."


# Global instance
gemini_service = GeminiService()
