#!/bin/bash

set -e

DB_HOST="${POSTGRES_HOST:-db}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Wait for database to be ready
echo "Waiting for postgres..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 0.1
done
echo "PostgreSQL started"

# Create static directory if it doesn't exist
mkdir -p /app/staticfiles
mkdir -p "${CACHE_DIR:-/tmp/django-cache}"

if [ "${COLLECT_STATIC:-1}" = "1" ]; then
  echo "Collecting static files..."
  uv run python manage.py collectstatic --noinput
fi

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "Running migrations..."
  uv run python manage.py migrate --noinput
fi

# Start Gunicorn
echo "Starting Gunicorn..."
exec uv run gunicorn core.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-3}" \
  --threads "${GUNICORN_THREADS:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-60}" \
  --access-logfile - \
  --error-logfile -
