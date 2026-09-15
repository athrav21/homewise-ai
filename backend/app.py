import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from .routes.neighborhood import router as neighborhood_router
except ImportError:
    from routes.neighborhood import router as neighborhood_router

app = FastAPI(
    title="HomeWise AI Backend",
    description="12-Factor Property-Centric Neighborhood Intelligence Architecture for Mumbai Metropolitan Region",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite default port 5173 and standard web ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(neighborhood_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app:app", host=host, port=port, reload=True)
