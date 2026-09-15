# Overall Livability Composite Model

- **Output Field**: `livabilityScore`
- **Training Dataset**: Generated Composite Dataset from 11 Factor Models
- **Runtime Data Source / API**: Recommendation API & Meta-Model Engine

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/overall_livability/overall_livability_meta_model.pkl`
- `models/overall_livability/mcdm_weights_config.json`

## Model Input Features
- `schoolScore`
- `hospitalScore`
- `marketScore`
- `safetyScore`
- `connectivityScore`
- `airQualityScore`
- `floodSafetyScore`
- `priceScore`
- `waterScore`
- `powerScore`
- `futureInfrastructureScore`
