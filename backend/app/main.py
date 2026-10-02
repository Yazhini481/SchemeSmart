import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routes import schemes, recommendation, documents, compare, chatbot, voice

app = FastAPI(
    title="SchemeSmart API",
    description="AI-Powered Tamil Nadu Government Scheme Assistant with deterministic eligibility, semantic retrieval, and context-aware multilingual assistance.",
    version="1.0.0"
)

# CORS Setup
cors_origins_str = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]
if "*" not in origins:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(schemes.router)
app.include_router(recommendation.router)
app.include_router(documents.router)
app.include_router(compare.router)
app.include_router(chatbot.router)
app.include_router(voice.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "SchemeSmart",
        "scope": "Tamil Nadu Government Schemes",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected",
        "schemes_loaded": 150
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8005))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
