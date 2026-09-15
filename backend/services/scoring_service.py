import os
import joblib
import logging

logger = logging.getLogger("homewise")

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))

# Cache loaded models in memory
LOADED_MODELS = {}

def load_pkl_model(category, filename):
    filepath = os.path.join(MODELS_DIR, category, filename)
    if os.path.exists(filepath):
        try:
            model = joblib.load(filepath)
            logger.info(f"Loaded trained model: {filepath}")
            return model
        except Exception as e:
            logger.warning(f"Failed to load model at {filepath}: {e}")
            return None
    return None

def init_models():
    """Initializes and checks availability of trained models."""
    status = {}
    
    # 1. School
    school_model = load_pkl_model("school", "school_quality_xgb.pkl")
    LOADED_MODELS["school"] = school_model
    status["school"] = {
        "loaded": school_model is not None,
        "file": "models/school/school_quality_xgb.pkl",
        "algorithm": "XGBoostRegressor" if school_model else None,
        "source": "Trained ML (UDISE+)" if school_model else "Prototype Spatial Index — Not for Real Property Decisions"
    }

    # 2. Hospital
    hospital_model = load_pkl_model("hospital", "hospital_random_forest.pkl") or load_pkl_model("hospital", "hospital_xgboost.pkl")
    LOADED_MODELS["hospital"] = hospital_model
    status["hospital"] = {
        "loaded": hospital_model is not None,
        "file": "models/hospital/hospital_random_forest.pkl" if hospital_model else None,
        "algorithm": "RandomForestRegressor" if hospital_model else None,
        "source": "Trained ML (BMC/OpenCity)" if hospital_model else "Prototype Spatial Index — Not for Real Property Decisions"
    }

    # 3. Market
    market_model = load_pkl_model("market", "market_model.pkl")
    LOADED_MODELS["market"] = market_model
    status["market"] = {
        "loaded": market_model is not None,
        "file": "models/market/market_model.pkl" if market_model else None,
        "algorithm": "GradientBoosting" if market_model else None,
        "source": "Trained ML (Overpass POIs)" if market_model else "Prototype Spatial Index — Not for Real Property Decisions"
    }

    # 4. Air Quality
    aqi_model = load_pkl_model("air_quality", "air_quality_model.pkl")
    LOADED_MODELS["air_quality"] = aqi_model
    status["air_quality"] = {
        "loaded": aqi_model is not None,
        "file": "models/air_quality/air_quality_model.pkl" if aqi_model else None,
        "algorithm": "LSTM / TimeSeries" if aqi_model else None,
        "source": "Trained ML (CPCB/MPCB)" if aqi_model else "Prototype Spatial Index — Not for Real Property Decisions"
    }

    # 5. Crime / Safety
    safety_model = load_pkl_model("safety", "safety_model.pkl")
    LOADED_MODELS["safety"] = safety_model
    status["safety"] = {
        "loaded": safety_model is not None,
        "file": "models/safety/safety_model.pkl" if safety_model else None,
        "algorithm": "RandomForestRegressor" if safety_model else None,
        "source": "Trained ML (Mumbai Police/NCRB)" if safety_model else "Prototype Spatial Index — Not for Real Property Decisions"
    }

    # 6. Property Price
    price_model = load_pkl_model("property_price", "property_price_xgb.pkl")
    LOADED_MODELS["property_price"] = price_model
    status["property_price"] = {
        "loaded": price_model is not None,
        "file": "models/property_price/property_price_xgb.pkl" if price_model else None,
        "algorithm": "XGBoostRegressor" if price_model else None,
        "source": "Trained ML (70K+ Listings)" if price_model else "Prototype Spatial Index — Not for Real Property Decisions"
    }

    # Remaining models status
    for cat in ["connectivity", "flood_safety", "water_reliability", "power_reliability", "future_infrastructure"]:
        mod = load_pkl_model(cat, f"{cat}_model.pkl")
        LOADED_MODELS[cat] = mod
        status[cat] = {
            "loaded": mod is not None,
            "file": f"models/{cat}/{cat}_model.pkl" if mod else None,
            "algorithm": "GIS Spatial Engine" if not mod else "Trained ML",
            "source": "GIS Spatial Index" if not mod else f"Trained ML ({cat})"
        }

    return status

# Initialize on module import
MODEL_STATUS_REGISTRY = init_models()

def calculate_personalized_match(scores, preferences, budget_max, property_price_cr):
    """
    Calculates dynamic HomeWise Match Score (0-100) using normalized 1-10 preference weights.
    
    livabilityScore MUST be calculated from the other 11 factor scores and user preference weights.
    """
    # 1-10 Slider preference mapping
    pref_map = {
        "schoolScore": float(preferences.get("school", 5)),
        "hospitalScore": float(preferences.get("hospital", 5)),
        "marketScore": float(preferences.get("market", 5)),
        "safetyScore": float(preferences.get("safety", 5)),
        "connectivityScore": float(preferences.get("connectivity", 5)),
        "airQualityScore": float(preferences.get("airQuality", 5)),
        "floodSafetyScore": float(preferences.get("floodSafety", 5)),
        "priceScore": float(preferences.get("affordability", 5)),
        "waterScore": float(preferences.get("water", 5)),
        "powerScore": float(preferences.get("power", 5)),
        "futureInfrastructureScore": float(preferences.get("futureInfrastructure", 5))
    }

    total_importance = sum(pref_map.values())
    if total_importance <= 0:
        total_importance = 55.0  # fallback baseline 11 * 5

    weights = {k: v / total_importance for k, v in pref_map.items()}

    # Calculate Price Affordability Score (0-100) relative to budget_max
    if property_price_cr <= budget_max:
        # Fits budget perfectly
        under_pct = (budget_max - property_price_cr) / budget_max
        price_score = min(99, round(85 + under_pct * 15))
    else:
        # Over budget - penalty proportional to excess percentage
        excess_pct = (property_price_cr - budget_max) / budget_max
        price_score = max(15, round(80 - excess_pct * 140))

    scores["priceScore"] = price_score

    # Compute weighted sum across all 11 factors
    weighted_sum = 0.0
    for factor_key, weight in weights.items():
        val = float(scores.get(factor_key, 75))
        weighted_sum += val * weight

    # HomeWise Match Score (0-100)
    match_score = min(99, max(25, round(weighted_sum)))

    # Apply Hard Budget Filter Penalty if significantly over budget
    if property_price_cr > budget_max * 1.25:
        match_score = max(20, round(match_score * 0.7))

    scores["livabilityScore"] = match_score
    return match_score, price_score, weights
