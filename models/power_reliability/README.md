# Power Grid Reliability Model

- **Output Field**: `powerScore`
- **Training Dataset**: Maharashtra Electricity Outage & Feeder Dataset
- **Runtime Data Source / API**: MSEDCL / Mahavitaran + Government Data

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/power_reliability/power_reliability_model.pkl`
- `models/power_reliability/feeder_stability_classifier.pkl`

## Model Input Features
- `annual_outage_hours`
- `feeder_automation_level`
- `substation_capacity_mva`
- `saidi_saifi_index`
- `underground_cabling_pct`
