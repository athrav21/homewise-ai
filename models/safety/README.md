# Safety & Crime Risk Model

- **Output Field**: `safetyScore`
- **Training Dataset**: Mumbai Crime Statistics 2018–2025
- **Runtime Data Source / API**: Mumbai Police / NCRB / data.gov.in

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/safety/safety_model.pkl`
- `models/safety/crime_scaler.pkl`
- `models/safety/safety_feature_names.json`

## Model Input Features
- `cognizable_crimes_per_10k`
- `night_patrol_density`
- `cctv_coverage_pct`
- `street_lighting_score`
- `police_station_dist_km`
