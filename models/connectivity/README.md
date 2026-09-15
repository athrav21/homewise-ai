# City Transit Connectivity Model

- **Output Field**: `connectivityScore`
- **Training Dataset**: OSM Road/Rail/Metro Data + MMRDA Metro Network Data
- **Runtime Data Source / API**: Overpass API + MMRDA GIS

## Expected Trained Model Files
Place your trained model binaries in this folder:
- `models/connectivity/connectivity_model.pkl`
- `models/connectivity/transit_graph_weights.pkl`

## Model Input Features
- `dist_nearest_railway_stn_km`
- `dist_nearest_metro_stn_km`
- `weh_eeh_highway_dist_km`
- `bus_stop_density_500m`
- `peak_hour_commute_time_bkc`
