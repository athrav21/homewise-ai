import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

try:
    from ..services.scoring_service import (
        MODEL_STATUS_REGISTRY,
        calculate_personalized_match,
        apply_available_models
    )
    from ..services.recommendation_service import rank_localities_for_user
    from ..services.llm_report_service import generate_llm_report
except ImportError:
    from services.scoring_service import (
        MODEL_STATUS_REGISTRY,
        calculate_personalized_match,
        apply_available_models
    )
    from services.recommendation_service import rank_localities_for_user
    from services.llm_report_service import generate_llm_report

router = APIRouter()

# Load MMR Localities Dataset from JSON/JS fallback
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "mumbaiNeighborhoodData.js"))

def load_localities_from_js():
    """Parses locality objects from mumbaiNeighborhoodData.js."""
    try:
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            code = f.read()

        import re
        match = re.search(r"export const MUMBAI_LOCALITIES = (\[.*?\]);", code, re.DOTALL)
        if match:
            json_str = match.group(1)
            json_str = re.sub(r"//.*?\n", "\n", json_str)
            json_str = re.sub(r",\s*([\]}])", r"\1", json_str)
            json_str = re.sub(r"(\w+):", r'"\1":', json_str)
            return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing JS dataset: {e}")

    # Baseline fallback if regex parse fails
    return [
        {
            "id": "mumbai-1", "name": "Bandra West", "city": "Mumbai", "latitude": 19.0596, "longitude": 72.8295,
            "averagePriceCr": 6.5, "schoolScore": 94, "hospitalScore": 92, "marketScore": 95, "connectivityScore": 91,
            "safetyScore": 88, "airQualityScore": 68, "waterScore": 88, "powerScore": 92, "priceScore": 57,
            "floodSafetyScore": 72, "futureInfrastructureScore": 88, "summary": "Premium coastal lifestyle hub."
        },
        {
            "id": "mumbai-18", "name": "Powai", "city": "Mumbai", "latitude": 19.1176, "longitude": 72.9060,
            "averagePriceCr": 3.4, "schoolScore": 93, "hospitalScore": 89, "marketScore": 88, "connectivityScore": 86,
            "safetyScore": 90, "airQualityScore": 76, "waterScore": 90, "powerScore": 94, "priceScore": 78,
            "floodSafetyScore": 80, "futureInfrastructureScore": 92, "summary": "Modern tech hub surrounded by Powai lake."
        },
        {
            "id": "mumbai-29", "name": "Thane West", "city": "Thane", "latitude": 19.2183, "longitude": 72.9781,
            "averagePriceCr": 1.95, "schoolScore": 88, "hospitalScore": 86, "marketScore": 86, "connectivityScore": 84,
            "safetyScore": 88, "airQualityScore": 75, "waterScore": 84, "powerScore": 90, "priceScore": 88,
            "floodSafetyScore": 84, "futureInfrastructureScore": 94, "summary": "Rapidly growing self-contained suburban city."
        },
        {
            "id": "mumbai-33", "name": "Vashi", "city": "Navi Mumbai", "latitude": 19.0770, "longitude": 72.9980,
            "averagePriceCr": 2.1, "schoolScore": 90, "hospitalScore": 88, "marketScore": 90, "connectivityScore": 89,
            "safetyScore": 92, "airQualityScore": 74, "waterScore": 86, "powerScore": 92, "priceScore": 86,
            "floodSafetyScore": 88, "futureInfrastructureScore": 90, "summary": "Premier planned commercial and residential node."
        }
    ]

LOCALITIES_DB = load_localities_from_js()

class LocationAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    localityName: Optional[str] = "Selected Location"
    budgetMax: float = Field(default=3.5, description="Maximum budget ceiling in ₹ Crore")
    preferences: Dict[str, Any] = Field(default_factory=dict)

class LlmReportRequest(BaseModel):
    locality: Dict[str, Any]
    scores: Dict[str, Any]
    preferences: Dict[str, Any] = Field(default_factory=dict)
    budgetMin: float = 1.0
    budgetMax: float = 3.5
    factors: Optional[List[Dict[str, Any]]] = None

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "HomeWise AI Backend", "version": "2.0.0"}

@router.get("/model-status")
def get_model_status():
    """Returns the loading status of all 12 trained ML models and GIS fallbacks."""
    return {
        "status": "success",
        "models": MODEL_STATUS_REGISTRY
    }

@router.post("/analyze-location")
def analyze_location(req: LocationAnalysisRequest):
    """
    Evaluates a property location across 12 factors, applies available ML inference,
    normalizes preference weights, and returns a personalized HomeWise Match Score.
    """
    closest = None
    min_dist = float("inf")

    for loc in LOCALITIES_DB:
        d = (loc["latitude"] - req.latitude)**2 + (loc["longitude"] - req.longitude)**2
        if d < min_dist:
            min_dist = d
            closest = loc

    if not closest:
        closest = LOCALITIES_DB[0]

    loc_name = req.localityName if req.localityName and req.localityName != "Selected Location" else closest["name"]
    price_cr = closest.get("averagePriceCr", 3.2)

    # Apply available trained ML models (School, Hospital, Market) with transparent fallbacks
    scores, ml_flags = apply_available_models(closest)

    # Calculate HomeWise Match Score
    match_score, price_score, weights = calculate_personalized_match(scores, req.preferences, req.budgetMax, price_cr)

    # 12 Factor Metadata with transparent data source and model attribution
    factors_meta = [
        {
            "id": "schools", "name": "School Quality", "score": scores["schoolScore"],
            "source": "UDISE+ / data.gov.in / OpenStreetMap",
            "modelType": "Trained ML (XGBoost Regressor)" if ml_flags["school"] else "Prototype Spatial Index",
            "confidence": "High (Trained Model)" if ml_flags["school"] else "Medium (Spatial Fallback)",
            "status": "Excellent" if scores["schoolScore"] >= 88 else "Good"
        },
        {
            "id": "hospitals", "name": "Hospital Accessibility", "score": scores["hospitalScore"],
            "source": "BMC / OpenCity / OpenStreetMap",
            "modelType": "Trained ML (Random Forest Regressor)" if ml_flags["hospital"] else "Prototype Spatial Index",
            "confidence": "High (Trained Model)" if ml_flags["hospital"] else "Medium (Spatial Fallback)",
            "status": "Strong" if scores["hospitalScore"] >= 85 else "Moderate"
        },
        {
            "id": "markets", "name": "Market Accessibility", "score": scores["marketScore"],
            "source": "Overpass API (OSM Retail POIs)",
            "modelType": "Trained ML (XGBoost Regressor)" if ml_flags["market"] else "Prototype Spatial Index",
            "confidence": "High (Trained Model)" if ml_flags["market"] else "Medium (Spatial Fallback)",
            "status": "Strong" if scores["marketScore"] >= 85 else "Good"
        },
        {
            "id": "safety", "name": "Safety & Low Crime Risk", "score": scores["safetyScore"],
            "source": "Mumbai Police / NCRB / data.gov.in",
            "modelType": "Crime Risk Station Spatial Index",
            "confidence": "Medium (Station Level Records)",
            "status": "Very Safe" if scores["safetyScore"] >= 88 else "Safe"
        },
        {
            "id": "connectivity", "name": "City Transit Connectivity", "score": scores["connectivityScore"],
            "source": "OpenStreetMap / MMRDA Metro Transit",
            "modelType": "GIS Spatial Distance Engine",
            "confidence": "High (Geospatial Transit Points)",
            "status": "Excellent" if scores["connectivityScore"] >= 90 else "Good"
        },
        {
            "id": "airQuality", "name": "Air Quality Index (AQI)", "score": scores["airQualityScore"],
            "source": "CPCB / MPCB Air Quality Monitors",
            "modelType": "Station Telemetry Index",
            "confidence": "High (Station Records)",
            "rawAqi": round((100 - scores["airQualityScore"]) * 2.2 + 40),
            "status": "Good Air" if scores["airQualityScore"] >= 75 else "Moderate Air"
        },
        {
            "id": "floodSafety", "name": "Monsoon Flood Safety", "score": scores["floodSafetyScore"],
            "source": "ISRO Bhuvan GIS Elevation Hazard Data",
            "modelType": "Topographic Raster Hazard Index",
            "confidence": "High (Bhuvan Raster Data)",
            "status": "Safe" if scores["floodSafetyScore"] >= 80 else "Low-Lying Waterlogging Risk"
        },
        {
            "id": "affordability", "name": "Property Affordability", "score": price_score,
            "source": "70K+ Mumbai Housing Listing Dataset",
            "modelType": "Housing Price Valuation Index",
            "confidence": "High (70K Dataset Valuation)",
            "status": "Within Budget" if price_cr <= req.budgetMax else "Above Budget Ceiling"
        },
        {
            "id": "water", "name": "Water Supply Reliability", "score": scores["waterScore"],
            "source": "BMC Municipal Water Supply Connections",
            "modelType": "Municipal Ward Connection Index",
            "confidence": "Medium (Ward Level Data)",
            "status": "Reliable 24x7" if scores["waterScore"] >= 88 else "Standard Municipal Hours"
        },
        {
            "id": "power", "name": "Power Grid Reliability", "score": scores["powerScore"],
            "source": "MSEDCL / Mahavitaran Electricity Data",
            "modelType": "Grid Outage Frequency Index",
            "confidence": "Limited (Data Availability Limited)",
            "status": "High Grid Stability" if scores["powerScore"] >= 90 else "Occasional Outages"
        },
        {
            "id": "futureInfrastructure", "name": "Future Infrastructure", "score": scores["futureInfrastructureScore"],
            "source": "MMRDA GIS / Infrastructure Master Plan",
            "modelType": "Project Spatial Buffer Index",
            "confidence": "High (MMRDA Master Plan)",
            "status": "High Growth Potential" if scores["futureInfrastructureScore"] >= 88 else "Moderate Infra Boost"
        },
        {
            "id": "livability", "name": "Overall Livability", "score": match_score,
            "source": "Calculated Composite Layer (11 Factors + User Weights)",
            "modelType": "MCDM Preference Weight Aggregation Engine",
            "confidence": "High (Personalized Aggregation)",
            "status": "Excellent Match" if match_score >= 85 else "Good Match"
        }
    ]

    # Rank Top 5 Localities for this user
    top_5_matches = rank_localities_for_user(LOCALITIES_DB, req.preferences, req.budgetMax)[:5]

    return {
        "status": "success",
        "localityName": loc_name,
        "matchedLocalityId": closest["id"],
        "latitude": req.latitude,
        "longitude": req.longitude,
        "predictedPriceCr": price_cr,
        "budgetMax": req.budgetMax,
        "isWithinBudget": price_cr <= req.budgetMax,
        "matchScore": match_score,
        "scores": scores,
        "weights": weights,
        "factors": factors_meta,
        "top5Recommendations": top_5_matches,
        "disclaimer": "Prototype Data — Not for Real Property Decisions. Calculated using 12-factor architecture with 3 active ML models (Hospital, School, Market)."
    }

@router.post("/generate-llm-report")
def generate_report_endpoint(req: LlmReportRequest):
    """
    Generates an executive intelligence report using configured LLM API (Gemini/OpenAI)
    with strict factual grounding on calculated scores and data sources.
    Falls back gracefully to deterministic synthesis if LLM API is unavailable.
    """
    report = generate_llm_report(
        locality_data=req.locality,
        scores=req.scores,
        preferences=req.preferences,
        budget_min=req.budgetMin,
        budget_max=req.budgetMax,
        factors_meta=req.factors or []
    )

    return {
        "status": "success",
        "localityName": req.locality.get("name"),
        "report": report
    }
