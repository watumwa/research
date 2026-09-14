#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "== Backend setup =="
cd "$ROOT/backed"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
[ -f .env ] || cp .env.example .env
python manage.py makemigrations accounts learning
python manage.py migrate
python manage.py seed_platform

echo
echo "Backend database and seed content are ready."
echo "Create the first administrator with:"
echo "  cd backed && source .venv/bin/activate && python manage.py createsuperuser"

echo
echo "== Frontend setup =="
cd "$ROOT/frontend"
[ -f .env ] || cp .env.example .env
npm install

echo
echo "Setup complete. See README.md for the two development server commands."
