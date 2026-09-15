# Hospital Accessibility Model

- **Output Field**: `hospitalScore`
- **Training Dataset**: Mumbai Public Health Centres / Hospitals Dataset
- **Runtime Data Source / API**: BMC / OpenCity + OpenStreetMap (OSM)

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/hospital/hospital_random_forest.pkl`
- `models/hospital/hospital_xgboost.pkl`
- `models/hospital/hospital_scaler.pkl`

## Model Input Features
- `tertiary_hospitals_3km`
- `clinics_1km`
- `emergency_beds_5km`
- `dist_nearest_hospital_km`
- `trauma_center_access`
