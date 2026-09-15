# Monsoon Flood Vulnerability Model

- **Output Field**: `floodSafetyScore`
- **Training Dataset**: Bhuvan National Flood Vulnerability Dataset
- **Runtime Data Source / API**: ISRO Bhuvan GIS

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/flood_safety/flood_vulnerability_model.pkl`
- `models/flood_safety/elevation_raster_config.json`

## Model Input Features
- `elevation_msl_meters`
- `drainage_density_score`
- `historical_waterlogging_frequency`
- `coastal_high_tide_buffer_km`
- `stormwater_drain_capacity`
