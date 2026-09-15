# School Quality Model

- **Output Field**: `schoolScore`
- **Training Dataset**: UDISE+ Mumbai School Dataset
- **Runtime Data Source / API**: UDISE+ / data.gov.in + OpenStreetMap (OSM)

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/school/school_quality_xgb.pkl`
- `models/school/school_quality_imputer.pkl`
- `models/school/school_quality_features.pkl`

## Model Input Features
- `num_primary_schools_2km`
- `num_secondary_schools_2km`
- `avg_student_teacher_ratio`
- `board_affiliation_score`
- `dist_nearest_school_km`
