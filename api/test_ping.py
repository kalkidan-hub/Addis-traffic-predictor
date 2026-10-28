from fastapi.testclient import TestClient
from ping import app

# Initialize the TestClient using our FastAPI app
client = TestClient(app)


def test_predict_morning_rush_hour():
  """Test traffic prediction during morning rush hour (Monday, 8:00 AM).

  Expects higher congestion index.
  """
  payload = {
      "hour": 8,
      "day_of_week": 0,  # Monday
      "is_weekend": 0,
      "length_meters": 200.0,
      "max_speed_kmh": 50.0,
      "segment_id": 12345678,
  }

  response = client.post("/predict", json=payload)

  # Assert status code is 200 OK
  assert response.status_code == 200

  data = response.json()

  # Assert expected keys exist in the response
  assert "congestion_index" in data
  assert "traffic_status" in data

  # Assert data types are correct
  assert isinstance(data["congestion_index"], float)
  assert isinstance(data["traffic_status"], str)

  # Congestion index should be within valid bounds [0.0, 1.0]
  assert 0.0 <= data["congestion_index"] <= 1.0


def test_predict_weekend_offpeak():
  """Test traffic prediction during a weekend off-peak hour (Sunday, 3:00 AM).

  Expects smooth traffic flow.
  """
  payload = {
      "hour": 3,
      "day_of_week": 6,  # Sunday
      "is_weekend": 1,
      "length_meters": 150.0,
      "max_speed_kmh": 60.0,
      "segment_id": 87654321,
  }

  response = client.post("/predict", json=payload)

  assert response.status_code == 200
  data = response.json()

  assert "congestion_index" in data
  assert "traffic_status" in data


def test_predict_invalid_payload_types():
  """Test that FastAPI's Pydantic validation rejects invalid data types

  (e.g., sending a string for 'hour' instead of an integer).
  """
  payload = {
      "hour": "eight_am",  # Invalid type (should be int)
      "day_of_week": 0,
      "is_weekend": 0,
      "length_meters": 150.0,
      "max_speed_kmh": 50.0,
      "segment_id": 12345678,
  }

  response = client.post("/predict", json=payload)

  # FastAPI should automatically return a 422 Unprocessable Entity error
  assert response.status_code == 422


def test_predict_missing_fields():
  """Test that FastAPI rejects payloads missing required fields."""
  payload = {
      "hour": 8
      # Missing day_of_week, is_weekend, length_meters, max_speed_kmh, segment_id
  }

  response = client.post("/predict", json=payload)

  # Expect 422 Validation Error
  assert response.status_code == 422