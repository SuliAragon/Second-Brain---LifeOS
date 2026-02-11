#!/bin/bash
trap "kill 0" EXIT

echo "Starting Life OS..."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please run setup first."
    exit 1
fi

source venv/bin/activate

# Backend
echo "Starting Django Backend..."
cd backend
python manage.py runserver 0.0.0.0:8000 &

# Frontend
echo "Starting React Frontend..."
cd ../frontend
npm run dev &

wait
