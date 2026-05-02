# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from backend folder
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Create a non-root user for Hugging Face compatibility
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set environment variables (Hugging Face specific)
ENV PORT=7860
EXPOSE 7860

# Run the application
# We use 0.0.0.0 to bind to all interfaces
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
