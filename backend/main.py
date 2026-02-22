from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import auth, screening, profile, plan, dashboard

settings = get_settings()

app = FastAPI(
    title="Attune API",
    description="AI-powered executive function co-pilot for ADHD",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(screening.router, prefix="/api/screening", tags=["screening"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(plan.router, prefix="/api/plan", tags=["plan"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/")
def health():
    return {"status": "ok", "service": "attune-api"}
