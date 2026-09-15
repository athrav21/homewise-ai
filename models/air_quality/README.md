# Air Quality (AQI) Model

- **Output Field**: `airQualityScore`
- **Training Dataset**: Mumbai Hourly AQI 2017–2025
- **Runtime Data Source / API**: CPCB / MPCB / OpenCity

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/air_quality/air_quality_model.pkl`
- `models/air_quality/aqi_time_series_lstm.pkl`

## Model Input Features
- `pm25_annual_avg`
- `pm10_annual_avg`
- `no2_concentration`
- `industrial_buffer_dist_km`
- `green_cover_pct`
