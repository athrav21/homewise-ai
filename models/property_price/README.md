# Property Valuation & Price Prediction Model

- **Output Field**: `priceScore / predictedPrice`
- **Training Dataset**: Mumbai House Price Dataset (70K+ Listings)
- **Runtime Data Source / API**: Property Dataset & Valuation Inference Model

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/property_price/property_price_xgb.pkl`
- `models/property_price/price_ridge_regression.pkl`
- `models/property_price/feature_encoder.pkl`

## Model Input Features
- `latitude`
- `longitude`
- `carpet_area_sqft`
- `bhk_count`
- `locality_id`
- `floor_number`
- `building_age_years`
- `amenities_score`
