#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Python Agent..."
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting server..."
python agent_mvp.py
