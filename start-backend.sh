#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/backed"
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8000
