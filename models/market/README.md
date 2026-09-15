# Market Accessibility Model

- **Output Field**: `marketScore`
- **Training Dataset**: OpenStreetMap POI Dataset
- **Runtime Data Source / API**: Overpass API (OSM POIs)

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/market/market_model.pkl`
- `models/market/market_features.pkl`
- `models/market/market_model_metadata.pkl`

## Model Input Features
- `supermarkets_1km`
- `local_bazaars_1km`
- `malls_3km`
- `dist_nearest_market_km`
- `commercial_poi_density`
