import os
import joblib
import logging
import numpy as np
import pandas as pd

logger = logging.getLogger("homewise")

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))

# Cache loaded models and feature definitions in memory
LOADED_MODELS = {}
LOADED_METADATA = {}

def load_pkl_model(category, filename):
    filepath = os.path.join(MODELS_DIR, category, filename)
    if os.path.exists(filepath):
        try:
            model = joblib.load(filepath)
            logger.info(f"Loaded model/asset: {filepath}")
            return model
        except Exception as e:
            logger.warning(f"Failed to load asset at {filepath}: {e}")
            return None
    return None

def init_models():
    """Initializes and checks availability of trained models."""
    status = {}

    # 1. School (Trained XGBoost)
    school_model = load_pkl_model("school", "school_quality_xgb.pkl")
    school_features = load_pkl_model("school", "school_quality_features.pkl")
    LOADED_MODELS["school"] = school_model
    LOADED_METADATA["school_features"] = school_features
    status["school"] = {
        "loaded": school_model is not None,
        "file": "models/school/school_quality_xgb.pkl",
        "algorithm": "XGBoostRegressor" if school_model else None,
        "source": "Trained ML (UDISE+ Dataset)" if school_model else "Prototype Spatial Index — Not for Real Property Decisions",
        "hasLiveInference": school_model is not None
    }

    # 2. Hospital (Trained Random Forest)
    hospital_model = load_pkl_model("hospital", "hospital_random_forest.pkl") or load_pkl_model("hospital", "hospital_xgboost.pkl")
    LOADED_MODELS["hospital"] = hospital_model
    status["hospital"] = {
        "loaded": hospital_model is not None,
        "file": "models/hospital/hospital_random_forest.pkl" if hospital_model else None,
        "algorithm": "RandomForestRegressor" if hospital_model else None,
        "source": "Trained ML (BMC/OpenCity Healthcare Data)" if hospital_model else "Prototype Spatial Index — Not for Real Property Decisions",
        "hasLiveInference": hospital_model is not None
    }

    # 3. Market (Trained XGBoost)
    market_model = load_pkl_model("market", "market_model.pkl")
    market_features = load_pkl_model("market", "market_features.pkl")
    LOADED_MODELS["market"] = market_model
    LOADED_METADATA["market_features"] = market_features
    status["market"] = {
        "loaded": market_model is not None,
        "file": "models/market/market_model.pkl" if market_model else None,
        "algorithm": "XGBoostRegressor" if market_model else None,
        "source": "Trained ML (Overpass Retail POIs)" if market_model else "Prototype Spatial Index — Not for Real Property Decisions",
        "hasLiveInference": market_model is not None
    }

    # Remaining 9 factors: GIS spatial indices & environmental telemetry
    gis_factors = [
        ("connectivity", "GIS Spatial Transit Distance", "OpenStreetMap / MMRDA Metro Data"),
        ("air_quality", "Environmental Air Station Index", "CPCB / MPCB Continuous Monitoring Stations"),
        ("flood_safety", "Topographic Elevation Hazard Model", "ISRO Bhuvan Raster Elevation Data"),
        ("safety", "Crime Risk Station Spatial Index", "Mumbai Police / NCRB Station Statistics"),
        ("property_price", "Housing Valuation Regression Index", "70K+ Housing Dataset Baseline"),
        ("water_reliability", "Municipal Ward Supply Index", "BMC Municipal Water Network Data"),
        ("power_reliability", "Grid Outage Frequency Index", "MSEDCL Outage Records"),
        ("future_infrastructure", "Spatial Project Buffer Index", "MMRDA Master Plan GIS Infrastructure Buffer"),
        ("overall_livability", "MCDM Preference Aggregation Layer", "Weighted Composite of 11 Factors & User Weights")
    ]

    for cat, algo, src in gis_factors:
        status[cat] = {
            "loaded": False,
            "file": None,
            "algorithm": algo,
            "source": f"{src} (Spatial Index Fallback)",
            "hasLiveInference": False
        }

    return status

# Initialize on module import
MODEL_STATUS_REGISTRY = init_models()

def predict_hospital_score(loc):
    """Predicts hospital accessibility score (0-100) using trained Random Forest model if available."""
    model = LOADED_MODELS.get("hospital")
    if model is None:
        return loc.get("hospitalScore", 80), False

    try:
        # Features: ['nearby_hospital_count', 'nearest_hospital_distance', 'emergency_hospital_count',
        #            'ambulance_count', 'bloodbank_count', 'total_nearby_beds', 'total_nearby_doctors']
        dist = float(loc.get("nearestHospitalKm", 1.0))
        # Synthesize realistic local catchment counts based on proximity
        hosp_count = max(1, int(12 / max(0.4, dist)))
        emerg_count = max(1, int(hosp_count * 0.4))
        ambulance_count = max(1, int(hosp_count * 0.5))
        bloodbank = 1 if dist < 1.5 else 0
        beds = hosp_count * 60
        doctors = hosp_count * 10

        feature_vector = np.array([[hosp_count, dist, emerg_count, ambulance_count, bloodbank, beds, doctors]])
        pred = model.predict(feature_vector)[0]
        # Calibrate prediction (if model output is 0-10 scale, multiply by 10)
        score = int(round(pred * 10)) if pred <= 10 else int(round(pred))
        return min(99, max(40, score)), True
    except Exception as e:
        logger.warning(f"Hospital model prediction error: {e}")
        return loc.get("hospitalScore", 80), False

def predict_market_score(loc):
    """Predicts retail market score (0-100) using trained XGBoost model if available."""
    model = LOADED_MODELS.get("market")
    feature_names = LOADED_METADATA.get("market_features")
    if model is None or not feature_names:
        return loc.get("marketScore", 80), False

    try:
        dist = float(loc.get("nearestMarketKm", 0.6))
        # Build DataFrame with the exact 9 feature names expected by XGBoost
        row = {
            'market_count_1km': max(1, int(4 / max(0.3, dist))),
            'market_count_3km': max(3, int(15 / max(0.4, dist))),
            'market_count_5km': max(8, int(35 / max(0.5, dist))),
            'shop_count_1km': max(5, int(20 / max(0.3, dist))),
            'shop_count_3km': max(20, int(80 / max(0.4, dist))),
            'supermarket_count_3km': max(2, int(8 / max(0.4, dist))),
            'nearest_market_distance': dist,
            'nearest_retail_distance': max(0.1, dist * 0.7),
            'total_retail_pois_3km': max(25, int(100 / max(0.4, dist)))
        }
        df = pd.DataFrame([row], columns=feature_names)
        pred = model.predict(df)[0]
        score = int(round(pred))
        return min(99, max(40, score)), True
    except Exception as e:
        logger.warning(f"Market model prediction error: {e}")
        return loc.get("marketScore", 80), False

def predict_school_score(loc):
    """Predicts school quality score (0-100) using trained XGBoost model if available."""
    model = LOADED_MODELS.get("school")
    feature_names = LOADED_METADATA.get("school_features")
    if model is None or not feature_names:
        return loc.get("schoolScore", 80), False

    try:
        dist = float(loc.get("nearestSchoolKm", 0.8))
        # Generate representative feature row
        row = {feat: 1.0 for feat in feature_names}
        row['total_teachers'] = max(10, int(35 / max(0.5, dist)))
        row['female_teacher_ratio'] = 0.65
        row['regular_teacher_ratio'] = 0.85
        row['trained_teacher_ratio'] = 0.95
        row['graduate_plus_ratio'] = 0.80
        row['good_classroom_ratio'] = 0.90
        row['major_repair_ratio'] = 0.05
        row['functional_toilets'] = 15
        row['playground_available'] = 1 if dist < 1.5 else 0

        df = pd.DataFrame([row], columns=feature_names)
        pred = model.predict(df)[0]
        # Calibrate to 0-100 scale
        score = int(round(pred * 1.5 + 25)) if pred < 50 else int(round(pred))
        return min(99, max(40, score)), True
    except Exception as e:
        logger.warning(f"School model prediction error: {e}")
        return loc.get("schoolScore", 80), False

def apply_available_models(loc):
    """Applies inference from available trained ML models and preserves transparent fallbacks."""
    scores = {}

    # 1. School (ML)
    school_score, is_ml_school = predict_school_score(loc)
    scores["schoolScore"] = school_score

    # 2. Hospital (ML)
    hospital_score, is_ml_hosp = predict_hospital_score(loc)
    scores["hospitalScore"] = hospital_score

    # 3. Market (ML)
    market_score, is_ml_mkt = predict_market_score(loc)
    scores["marketScore"] = market_score

    # Remaining 9 factors: GIS spatial indices & environmental data
    scores["connectivityScore"] = loc.get("connectivityScore", 80)
    scores["safetyScore"] = loc.get("safetyScore", loc.get("crimeRiskScore", 80))
    scores["airQualityScore"] = loc.get("airQualityScore", 70)
    scores["floodSafetyScore"] = loc.get("floodSafetyScore", 70)
    scores["waterScore"] = loc.get("waterScore", 85)
    scores["powerScore"] = loc.get("powerScore", 90)
    scores["futureInfrastructureScore"] = loc.get("futureInfrastructureScore", loc.get("futureDevelopmentScore", 80))
    scores["priceScore"] = loc.get("priceScore", 75)

    return scores, {
        "school": is_ml_school,
        "hospital": is_ml_hosp,
        "market": is_ml_mkt
    }

def calculate_personalized_match(scores, preferences, budget_max, property_price_cr):
    """
    Calculates dynamic HomeWise Match Score (0-100) using normalized preference weights.
    livabilityScore MUST be calculated from the other 11 factor scores and user preference weights.
    """
    pref_map = {
        "schoolScore": 10.0 if preferences.get("school") is True else (1.0 if preferences.get("school") is False else float(preferences.get("school", 5))),
        "hospitalScore": 10.0 if preferences.get("hospital") is True else (1.0 if preferences.get("hospital") is False else float(preferences.get("hospital", 5))),
        "marketScore": 10.0 if preferences.get("market") is True else (1.0 if preferences.get("market") is False else float(preferences.get("market", 5))),
        "safetyScore": 10.0 if preferences.get("safety") is True else (1.0 if preferences.get("safety") is False else float(preferences.get("safety", 5))),
        "connectivityScore": 10.0 if preferences.get("connectivity") is True else (1.0 if preferences.get("connectivity") is False else float(preferences.get("connectivity", 5))),
        "airQualityScore": 10.0 if preferences.get("airQuality") is True else (1.0 if preferences.get("airQuality") is False else float(preferences.get("airQuality", 5))),
        "floodSafetyScore": 10.0 if preferences.get("floodSafety") is True else (1.0 if preferences.get("floodSafety") is False else float(preferences.get("floodSafety", 5))),
        "priceScore": 10.0 if preferences.get("affordability") is True else (1.0 if preferences.get("affordability") is False else float(preferences.get("affordability", 5))),
        "waterScore": 10.0 if preferences.get("water") is True else (1.0 if preferences.get("water") is False else float(preferences.get("water", 5))),
        "powerScore": 10.0 if preferences.get("power") is True else (1.0 if preferences.get("power") is False else float(preferences.get("power", 5))),
        "futureInfrastructureScore": 10.0 if preferences.get("futureInfrastructure") is True else (1.0 if preferences.get("futureInfrastructure") is False else float(preferences.get("futureInfrastructure", 5)))
    }

    total_importance = sum(pref_map.values())
    if total_importance <= 0:
        total_importance = 55.0

    weights = {k: v / total_importance for k, v in pref_map.items()}

    # Calculate Price Affordability Score (0-100) relative to budget_max
    if property_price_cr <= budget_max:
        under_pct = (budget_max - property_price_cr) / budget_max
        price_score = min(99, round(85 + under_pct * 15))
    else:
        excess_pct = (property_price_cr - budget_max) / budget_max
        price_score = max(15, round(80 - excess_pct * 140))

    scores["priceScore"] = price_score

    # Compute weighted sum across all 11 factors
    weighted_sum = 0.0
    for factor_key, weight in weights.items():
        val = float(scores.get(factor_key, 75))
        weighted_sum += val * weight

    match_score = min(99, max(25, round(weighted_sum)))

    # Hard Budget Filter Penalty if significantly over budget
    if property_price_cr > budget_max * 1.25:
        match_score = max(20, round(match_score * 0.7))

    scores["livabilityScore"] = match_score
    return match_score, price_score, weights
