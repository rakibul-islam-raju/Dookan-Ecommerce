#!/bin/bash

# Wait for database to be ready
echo "Waiting for postgres..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Create static directory if it doesn't exist
mkdir -p /app/staticfiles

# Collect static files
echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

# Make migrations
echo "Making migrations..."
uv run python manage.py makemigrations --noinput

# Run migrations
echo "Running migrations..."
uv run python manage.py migrate --noinput

# Start Gunicorn
echo "Starting Gunicorn..."
exec uv run python manage.py runserver 0.0.0.0:8000