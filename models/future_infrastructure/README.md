# Future Infrastructure Growth Model

- **Output Field**: `futureInfrastructureScore`
- **Training Dataset**: MMRDA Metro / Trans-Harbour / Infrastructure Project Data
- **Runtime Data Source / API**: MMRDA GIS / Project Master Plan

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/future_infrastructure/future_infrastructure_model.pkl`
- `models/future_infrastructure/project_impact_weights.json`

## Model Input Features
- `under_construction_metro_dist_km`
- `coastal_road_interchange_dist_km`
- `mthl_sea_link_access_km`
- `completion_timeline_months`
- `capex_investment_crores`
