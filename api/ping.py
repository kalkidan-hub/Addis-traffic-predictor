import joblib
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="addis-traffic-predictor",
    description=(
        "API for predicting traffic congestion status across road segments in"
        " Addis Ababa"
    ),
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://sheger-flow.fly.dev",
    ],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Load the model using joblib
model_filename = Path(__file__).resolve().parent.parent / "model" / "addis_traffic_xgboost_model.pkl"
model = joblib.load(model_filename)
print(f"Model successfully loaded from '{model_filename}'")


# Define Pydantic schema for input validation
class TrafficPredictionRequest(BaseModel):
  hour: int
  day_of_week: int
  is_weekend: int
  length_meters: float
  max_speed_kmh: float
  segment_id: int


# Helper function to map float score to human-readable status
def get_status_label(congestion_val: float) -> str:
  if congestion_val < 0.3:
    return "Smooth"
  elif congestion_val < 0.7:
    return "Moderate"
  else:
    return "Heavy"


def predict_single(data) -> float:
  # Handle both Pydantic model objects and raw dictionaries safely
  if hasattr(data, "model_dump"):
    data_dict = data.model_dump()
  elif hasattr(data, "dict"):
    data_dict = data.dict()
  else:
    data_dict = data

  input_df = pd.DataFrame([{
      "hour": data_dict["hour"],
      "day_of_week": data_dict["day_of_week"],
      "is_weekend": data_dict["is_weekend"],
      "length_meters": data_dict["length_meters"],
      "max_speed_kmh": data_dict["max_speed_kmh"],
      "segment_id": data_dict["segment_id"],
  }])

  result = model.predict(input_df)[0]
  return float(result)


@app.post("/predict")
def predict(data: TrafficPredictionRequest):
  congestion_index = predict_single(data)
  status = get_status_label(congestion_index)

  return {
      "congestion_index": round(congestion_index, 4),
      "traffic_status": status,
  }


@app.get("/health")
def health():
  return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, port=int(os.getenv("API_PORT", "8000")))