# 🏠 HomeWise AI – 12-Model Neighborhood Intelligence System

**HomeWise AI** is an AI-powered neighborhood intelligence and location recommendation platform designed for home-buyers in the **Mumbai Metropolitan Region (MMR)**. 

When a user selects a property location on the interactive map, runtime APIs aggregate spatial features for that coordinate, pass them to **12 trained Machine Learning models**, and calculate individual urban factor scores (0–100) along with an **Overall Livability Rating**.

---

## 📊 12 Feature Models Specification Table

The platform integrates 12 distinct machine learning models and data pipelines:

| # | Feature / Model | Dataset to Use for Training | Runtime API / Data Source | Output Variable |
|---|---|---|---|---|
| **1** | 🏫 **School Quality** | UDISE+ Mumbai school dataset | UDISE+ / data.gov.in + OpenStreetMap | `schoolScore` (0–100) |
| **2** | 🏥 **Hospital Accessibility** | Mumbai Public Health Centres / Hospitals | BMC / OpenCity + OpenStreetMap | `hospitalScore` (0–100) |
| **3** | 🛒 **Market Accessibility** | OpenStreetMap POI dataset | Overpass API (OSM POIs) | `marketScore` (0–100) |
| **4** | 🛡️ **Safety / Crime Risk** | Mumbai Crime Statistics 2018–2025 | Mumbai Police / NCRB / data.gov.in | `safetyScore` (0–100) |
| **5** | 🚆 **City Connectivity** | OSM road/rail/metro + MMRDA Metro data | Overpass API + MMRDA GIS | `connectivityScore` (0–100) |
| **6** | 🌫️ **Air Quality** | Mumbai Hourly AQI 2017–2025 | CPCB / MPCB / OpenCity API | `airQualityScore` (0–100) |
| **7** | 🌊 **Flood Safety** | Bhuvan National Flood Vulnerability data | ISRO Bhuvan GIS Services | `floodSafetyScore` (0–100) |
| **8** | 🏠 **Property Affordability** | Mumbai House Price Dataset (70K+ listings) | Trained Valuation Model + Property API | `priceScore` & predicted price |
| **9** | 💧 **Water Reliability** | BMC Mumbai Water Connections dataset | BMC Municipal / OpenCity | `waterScore` (0–100) |
| **10** | ⚡ **Power Reliability** | Maharashtra electricity / outage data | MSEDCL / Mahavitaran + Govt data | `powerScore` (0–100) |
| **11** | 🚧 **Future Infrastructure** | MMRDA Metro / Infrastructure project data | MMRDA GIS & Project Master Plan | `futureInfrastructureScore` (0–100) |
| **12** | 🌆 **Overall Livability** | Generated from the 11 factor model outputs | Recommendation API / Meta-Model | `livabilityScore` (0–100) |

---

## 📁 Where Should You Keep Your Trained Models?

All trained model binaries, scalers, encoders, and feature metadata files must be saved under the root **`models/`** folder. Each model has its own dedicated directory:

```text
homewise-ai/
├── models/
│   ├── school/
│   │   ├── school_quality_xgb.pkl          # Trained XGBoost model for School Quality
│   │   ├── school_quality_imputer.pkl      # Preprocessing imputer/scaler
│   │   ├── school_quality_features.pkl     # Feature names list
│   │   └── model_config.json
│   │
│   ├── hospital/
│   │   ├── hospital_random_forest.pkl      # Random Forest model for Healthcare
│   │   ├── hospital_xgboost.pkl
│   │   └── model_config.json
│   │
│   ├── market/
│   │   ├── market_model.pkl                # Trained model for POI market density
│   │   ├── market_features.pkl
│   │   └── model_config.json
│   │
│   ├── safety/
│   │   ├── safety_model.pkl                # Crime rate & safety score predictor
│   │   ├── crime_scaler.pkl
│   │   └── model_config.json
│   │
│   ├── connectivity/
│   │   ├── connectivity_model.pkl          # Transit accessibility score predictor
│   │   └── model_config.json
│   │
│   ├── air_quality/
│   │   ├── air_quality_model.pkl           # AQI predictor / time-series model
│   │   └── model_config.json
│   │
│   ├── flood_safety/
│   │   ├── flood_vulnerability_model.pkl   # ISRO Bhuvan elevation & flood risk model
│   │   └── model_config.json
│   │
│   ├── property_price/
│   │   ├── property_price_xgb.pkl          # 70K+ Mumbai listing regression model
│   │   ├── feature_encoder.pkl
│   │   └── model_config.json
│   │
│   ├── water_reliability/
│   │   ├── water_reliability_model.pkl     # BMC water pressure & supply hours model
│   │   └── model_config.json
│   │
│   ├── power_reliability/
│   │   ├── power_reliability_model.pkl     # MSEDCL outage & feeder grid model
│   │   └── model_config.json
│   │
│   ├── future_infrastructure/
│   │   ├── future_infrastructure_model.pkl # MMRDA Metro & Coastal road impact model
│   │   └── model_config.json
│   │
│   └── overall_livability/
│       ├── overall_livability_meta_model.pkl # Meta-model combining 11 factor outputs
│       └── model_config.json
```

### Supported Model Formats:
- Python Pickle: `.pkl` / `.pickle`
- Joblib: `.joblib`
- ONNX: `.onnx`
- PyTorch: `.pt` / `.pth`
- TensorFlow / Keras: `.h5` / `.keras`

---

## 🛠️ Model Training & Data Pipeline Guide

### Feature Engineering & Inputs for Each Model

1. **School Quality Model (`models/school/`)**
   - **Inputs**: Count of primary/secondary schools within 2 km, student-teacher ratio, board affiliation (CBSE/ICSE/IB weight), distance to nearest top school (km).
   - **Algorithm**: `XGBoostRegressor` or `RandomForestRegressor`.

2. **Hospital Accessibility Model (`models/hospital/`)**
   - **Inputs**: Multi-specialty hospital count within 3 km, emergency bed capacity, trauma center access, distance to nearest 24x7 ER (km).
   - **Algorithm**: `RandomForestRegressor`.

3. **Market Accessibility Model (`models/market/`)**
   - **Inputs**: Supermarket density within 1 km, local bazaars, shopping malls within 3 km, commercial POI count from Overpass API.
   - **Algorithm**: `GradientBoostingRegressor`.

4. **Safety / Crime Risk Model (`models/safety/`)**
   - **Inputs**: Cognizable IPC crimes per 10k population, police station distance (km), street lighting density, CCTV coverage percentage.
   - **Algorithm**: `RandomForestRegressor` / `LogisticRegression`.

5. **Connectivity Model (`models/connectivity/`)**
   - **Inputs**: Distance to nearest Mumbai Suburban Railway station (km), Metro station distance (km), Western/Eastern Express Highway access (km), peak hour commute time to BKC.
   - **Algorithm**: `LightGBM` / `XGBoost`.

6. **Air Quality Model (`models/air_quality/`)**
   - **Inputs**: Annual PM2.5 avg, PM10 avg, NO2 concentration, green cover percentage, distance from industrial zones.
   - **Algorithm**: `LSTM` / `RandomForestRegressor`.

7. **Flood Safety Model (`models/flood_safety/`)**
   - **Inputs**: Mean sea level elevation (meters), stormwater drain capacity, historical waterlogging frequency (2018–2025), high-tide buffer distance.
   - **Algorithm**: `RandomForestClassifier` / `XGBoost`.

8. **Property Price Model (`models/property_price/`)**
   - **Inputs**: Latitude, longitude, carpet area (sq.ft), BHK count, building age, locality ID, floor level.
   - **Dataset**: 70,000+ Mumbai property listing dataset.
   - **Algorithm**: `XGBoostRegressor` / `CatBoost`.

9. **Water Reliability Model (`models/water_reliability/`)**
   - **Inputs**: Daily BMC municipal supply hours, water pressure (PSI), pipeline leakage rate, tanker dependency percentage.
   - **Algorithm**: `GradientBoostingRegressor`.

10. **Power Reliability Model (`models/power_reliability/`)**
    - **Inputs**: Annual load-shedding hours, feeder automation level, SAIDI/SAIFI grid indexes, underground cabling percentage.
    - **Algorithm**: `RandomForestRegressor`.

11. **Future Infrastructure Model (`models/future_infrastructure/`)**
    - **Inputs**: Distance to under-construction Metro lines (Line 2B, 4, 7, 9, 11), Coastal Road interchange distance (km), MTHL Sea Link access, completion timeline (months).
    - **Algorithm**: `XGBoostRegressor`.

12. **Overall Livability Model (`models/overall_livability/`)**
    - **Inputs**: Outputs of Models #1 to #11 (`schoolScore`, `hospitalScore`, `marketScore`, `safetyScore`, `connectivityScore`, `airQualityScore`, `floodSafetyScore`, `priceScore`, `waterScore`, `powerScore`, `futureInfrastructureScore`).
    - **Algorithm**: Multi-Criteria Decision Making (MCDM) TOPSIS / Weighted Meta-Regressor.

---

## 🐍 Python Model Inference Backend (FastAPI / Flask)

Below is an example Python FastAPI server script (`server/main.py`) that loads your trained models from the `models/` directory and exposes a REST API endpoint for the web application:

```python
import os
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="HomeWise AI Model Inference API")

# Load trained models from models/ directory
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

school_model = joblib.load(os.path.join(MODELS_DIR, "school", "school_quality_xgb.pkl"))
hospital_model = joblib.load(os.path.join(MODELS_DIR, "hospital", "hospital_random_forest.pkl"))
market_model = joblib.load(os.path.join(MODELS_DIR, "market", "market_model.pkl"))
# Load remaining models...

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

@app.post("/api/predict-scores")
def predict_neighborhood_scores(req: LocationRequest):
    lat, lng = req.latitude, req.longitude
    
    # 1. Fetch spatial features from Overpass API / UDISE+ / CPCB runtime sources
    # 2. Construct feature dataframe
    features_df = pd.DataFrame([{"latitude": lat, "longitude": lng}])
    
    # 3. Predict scores across trained models
    school_score = int(school_model.predict(features_df)[0])
    hospital_score = int(hospital_model.predict(features_df)[0])
    market_score = int(market_model.predict(features_df)[0])
    
    # Calculate Overall Livability Score
    livability_score = int((school_score + hospital_score + market_score) / 3)

    return {
        "latitude": lat,
        "longitude": lng,
        "schoolScore": school_score,
        "hospitalScore": hospital_score,
        "marketScore": market_score,
        "livabilityScore": livability_score
    }
```

---

## 💻 Web Application Setup & Execution

### Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)

### Installation & Local Server

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 📜 Academic Review Disclaimer

> **Prototype Synthetic Data — Not for Real Property Decisions**:
> The factor values displayed in this Review 2 prototype website are generated from synthetic baseline metrics across 40 Mumbai Metropolitan Region (MMR) localities for academic evaluation. For production deployment, connect the web app to the Python backend inference API loading real trained models from the `models/` folder.
