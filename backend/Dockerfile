# Development Dockerfile
FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY . .

# Install dependencies
RUN uv sync

EXPOSE 8000

# Run Django dev server
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
