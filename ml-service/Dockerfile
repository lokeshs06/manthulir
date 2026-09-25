FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Shell form (not exec form) so ${PORT} expands — Render and most PaaS hosts
# inject PORT at runtime and expect the container to bind to it, not a
# hardcoded value. Falls back to 8000 for local `docker run`.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
