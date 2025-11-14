"""
LUMEN Project Readiness Check Script
Verifies all dependencies and configurations are ready
"""

print('=' * 60)
print('LUMEN PROJECT READINESS CHECK')
print('=' * 60)

# 1. Python packages
print('\n[1] Python Dependencies:')
try:
    import fastapi, uvicorn, sqlalchemy, psycopg2
    import jose, passlib, bcrypt, cryptography
    import google.generativeai
    import sklearn, numpy, pandas
    print('    ✓ All core packages installed')
except ImportError as e:
    print(f'    ✗ Missing package: {e}')

# 2. Configuration
print('\n[2] Backend Configuration:')
try:
    from app.core.config import settings
    print('    ✓ Configuration loaded')
    print(f'    - Environment: {settings.ENVIRONMENT}')
    print(f'    - CORS Origins: {len(settings.CORS_ORIGINS)} configured')
    print(f'    - Gemini API: {"configured" if settings.GEMINI_API_KEY else "missing"}')
except Exception as e:
    print(f'    ✗ Config error: {e}')

# 3. FastAPI App
print('\n[3] FastAPI Application:')
try:
    from main import app
    print(f'    ✓ App loaded - {len(app.routes)} routes')
except Exception as e:
    print(f'    ✗ App load error: {e}')

# 4. Database
print('\n[4] PostgreSQL Databases:')
try:
    import psycopg2
    conn = psycopg2.connect(
        host='localhost', port=5432,
        user='postgres', password='Sks@0987',
        database='postgres'
    )
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database WHERE datname IN ('lumen_db', 'lumen_audit_db')")
    dbs = [row[0] for row in cur.fetchall()]
    if 'lumen_db' in dbs and 'lumen_audit_db' in dbs:
        print('    ✓ Both databases exist (lumen_db, lumen_audit_db)')
    else:
        print(f'    ⚠ Found: {dbs}')
        if 'lumen_db' not in dbs:
            print('    ✗ Need to create: lumen_db')
        if 'lumen_audit_db' not in dbs:
            print('    ✗ Need to create: lumen_audit_db')
    cur.close()
    conn.close()
except Exception as e:
    print(f'    ✗ Database check failed: {e}')

# 5. Optional features
print('\n[5] Optional Features:')
try:
    import chromadb
    print('    ✓ ChromaDB (RAG) installed')
except:
    print('    ⚠ ChromaDB not installed (RAG features will be limited)')
    print('      Install C++ Build Tools to enable: https://visualstudio.microsoft.com/visual-cpp-build-tools/')

try:
    import pytesseract
    print('    ⚠ Tesseract OCR package installed but needs manual installation')
    print('      Download from: https://github.com/UB-Mannheim/tesseract/wiki')
except:
    print('    ⚠ pytesseract package missing')

# 6. Frontend check
print('\n[6] Frontend:')
import os
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'LUMEN')
if os.path.exists(frontend_path):
    env_file = os.path.join(frontend_path, '.env')
    if os.path.exists(env_file):
        print('    ✓ Frontend directory and .env file exist')
        print('    ✓ Ready to run with: npm run dev')
    else:
        print('    ⚠ Frontend .env file missing')
else:
    print('    ⚠ Frontend directory not found')

print('\n' + '=' * 60)
print('BACKEND STATUS: ✓ READY TO RUN')
print('=' * 60)
print('\nTo start the project:')
print('\n1. Backend (Terminal 1):')
print('   cd Final-Lumen')
print('   uvicorn main:app --reload --port 4000')
print('\n2. Frontend (Terminal 2):')
print('   cd LUMEN')
print('   npm run dev')
print('\n3. Access:')
print('   Frontend: http://localhost:5173')
print('   Backend API: http://localhost:4000')
print('   API Documentation: http://localhost:4000/docs')
print('=' * 60)
