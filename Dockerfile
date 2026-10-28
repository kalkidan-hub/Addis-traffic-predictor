FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    API_PORT=8000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api ./api
COPY model ./model

WORKDIR /app/api
EXPOSE 8000

CMD ["uvicorn", "ping:app", "--host", "0.0.0.0", "--port", "8000"]
