import os
import random
import numpy as np
import pandas as pd
import osmnx as ox

def fetch_and_generate_addis_traffic_data():
    print("1. Downloading Addis Ababa road network from OpenStreetMap...")
    # Fetch drivable street network for Addis Ababa
    place_name = "Addis Ababa, Ethiopia"
    G = ox.graph_from_place(place_name, network_type="drive")
    
    # Convert edges to a GeoDataFrame
    _, edges = ox.graph_to_gdfs(G)
    
    # Clean up and select key attributes
    edges = edges.reset_index()
    # Keep essential columns if they exist, fill missing ones safely
    cols_to_keep = ['u', 'v', 'osmid', 'length', 'highway', 'maxspeed', 'lanes']
    existing_cols = [c for c in cols_to_keep if c in edges.columns]
    road_segments = edges[existing_cols].copy()
    
    # Sample a subset of major road segments to keep dataset size manageable and relevant (e.g., top 1,000 segments)
    if len(road_segments) > 1000:
        road_segments = road_segments.sample(n=1000, random_state=42)
    
    print(f"2. Extracted {len(road_segments)} road segments. Generating temporal traffic patterns...")
    
    # Define time range: Past 30 days, hourly intervals
    date_range = pd.date_range(start="2026-03-01", end="2026-03-31", freq="h")
    
    records = []
    
    # Helper to simulate traffic congestion based on time and location features
    for _, segment in road_segments.iterrows():
        seg_id = segment.get('osmid', random.randint(10000, 99999))
        if isinstance(seg_id, list):
            seg_id = seg_id[0]
            
        length = float(segment.get('length', 100.0))
        # Handle maxspeed which can be string, list, or NaN
        max_speed = segment.get('maxspeed', 50)
        if isinstance(max_speed, list):
            max_speed = max_speed[0]
        try:
            max_speed = float(str(max_speed).replace('[', '').replace(']', '').split()[0])
        except (ValueError, TypeError):
            max_speed = 50.0  # default urban speed limit in km/h

        for timestamp in date_range:
            hour = timestamp.hour
            day_of_week = timestamp.dayofweek  # 0=Monday, 6=Sunday
            is_weekend = 1 if day_of_week >= 5 else 0
            
            # Heuristic for Addis traffic congestion multiplier (0 = free flow, 1 = heavy gridlock)
            congestion_factor = 0.1
            
            # Weekend vs Weekday behavior
            if not is_weekend:
                # Morning rush (7:30 AM - 9:30 AM)
                if 7 <= hour <= 9:
                    congestion_factor += random.uniform(0.6, 0.9)
                # Evening rush (5:00 PM - 7:00 PM)
                elif 17 <= hour <= 19:
                    congestion_factor += random.uniform(0.7, 0.95)
                # Midday moderate traffic
                elif 10 <= hour <= 16:
                    congestion_factor += random.uniform(0.2, 0.4)
            else:
                # Lighter weekend traffic with midday peaks around Mercato/Bole
                if 11 <= hour <= 15:
                    congestion_factor += random.uniform(0.2, 0.4)

            # Add random noise/weather variance
            congestion_factor = np.clip(congestion_factor + random.uniform(-0.1, 0.1), 0.0, 1.0)
            
            # Calculate average speed based on congestion
            current_speed = max_speed * (1.0 - (congestion_factor * 0.7))
            
            # Define categorical status label for classification or regression
            if congestion_factor < 0.3:
                status = "Smooth"
            elif congestion_factor < 0.7:
                status = "Moderate"
            else:
                status = "Heavy"

            records.append({
                'segment_id': seg_id,
                'timestamp': timestamp,
                'hour': hour,
                'day_of_week': day_of_week,
                'is_weekend': is_weekend,
                'length_meters': length,
                'max_speed_kmh': max_speed,
                'congestion_index': round(congestion_factor, 3),
                'current_speed_kmh': round(current_speed, 2),
                'traffic_status': status
            })

    df_traffic = pd.DataFrame(records)
    
    # Save to CSV
    output_filename = "addis_traffic_training_data.csv"
    df_traffic.to_csv(output_filename, index=False)
    print(f"3. Successfully generated dataset with {len(df_traffic)} rows and saved to '{output_filename}'.")
    return df_traffic

if __name__ == "__main__":
    fetch_and_generate_addis_traffic_data()