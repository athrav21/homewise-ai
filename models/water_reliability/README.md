# Municipal Water Supply Reliability Model

- **Output Field**: `waterScore`
- **Training Dataset**: BMC Mumbai Water Connections & Supply Dataset
- **Runtime Data Source / API**: BMC / OpenCity

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/water_reliability/water_reliability_model.pkl`
- `models/water_reliability/bmc_zone_encoders.pkl`

## Model Input Features
- `daily_supply_hours`
- `water_pressure_psi`
- `pipeline_leakage_frequency`
- `reservoir_source_distance`
- `tanker_dependency_pct`
