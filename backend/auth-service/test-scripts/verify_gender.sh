#!/usr/bin/env bash
set -euo pipefail

# Verifies the stored gender for the currently authenticated user.
# Usage:
#   HOST=http://localhost:8080 ./verify_gender.sh <email> <password>

HOST=${HOST:-http://localhost:8080}
EMAIL=${1:?Email required}
PASSWORD=${2:?Password required}

echo "Logging in to fetch access token..."
ACCESS_TOKEN=$(curl -sS -X POST "$HOST/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.data.accessToken')

if [[ -z "$ACCESS_TOKEN" || "$ACCESS_TOKEN" == "null" ]]; then
  echo "Login failed or no access token returned." >&2
  exit 1
fi

echo "Reading user profile (gender, bio, profileImageUrl) ..."
curl -sS -X GET "$HOST/api/auth/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data | {gender, bio, profileImageUrl}'

echo "Done."



