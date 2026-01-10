#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -ex

# 1. Get the directory where this script is located
SCRIPT_DIR="$(dirname "$0")"

# 2. Reference the SQL file using that directory variable
psql "postgresql://admin:password123@localhost:5432/shop" -f "$SCRIPT_DIR/seedAll.sql"
