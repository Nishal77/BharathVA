#!/usr/bin/env bash
set -euo pipefail

# Usage: HOST=http://localhost:8080 ./register_profile_flow.sh <email> <otp> <full_name> <phone> <country_code> <dob:YYYY-MM-DD> <password> <username> <gender>

HOST=${HOST:-http://localhost:8080}

EMAIL=${1:-test+$(date +%s)@example.com}
OTP=${2:-123456}
FULL_NAME=${3:-Test User}
PHONE=${4:-9999999999}
COUNTRY=${5:-+91}
DOB=${6:-1999-01-01}
PASSWORD=${7:-Password@123}
USERNAME=${8:-testuser$RANDOM}
GENDER_RAW=${9:-male}

echo "1) Register email"
SESSION_TOKEN=$(curl -sS -X POST "$HOST/api/auth/register/email" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\"}" | jq -r '.data.sessionToken')
echo "   sessionToken=$SESSION_TOKEN"

echo "2) Verify OTP"
curl -sS -X POST "$HOST/api/auth/register/verify-otp" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"otp\":\"$OTP\"}" > /dev/null

echo "3) Save details"
curl -sS -X POST "$HOST/api/auth/register/details" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"fullName\":\"$FULL_NAME\",\"phoneNumber\":\"$PHONE\",\"countryCode\":\"$COUNTRY\",\"dateOfBirth\":\"$DOB\"}" > /dev/null

echo "4) Create password"
curl -sS -X POST "$HOST/api/auth/register/password" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"password\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\"}" > /dev/null

echo "5) Create username"
curl -sS -X POST "$HOST/api/auth/register/username" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"username\":\"$USERNAME\"}" > /dev/null

echo "6) Save profile (gender) to registration_sessions"
curl -sS -X POST "$HOST/api/auth/register/profile" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"gender\":\"$GENDER_RAW\"}" | jq .

echo "7) Complete registration (move to users)"
curl -sS -X POST "$HOST/api/auth/register/complete" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\"}" | jq .

echo "8) Login"
ACCESS_TOKEN=$(curl -sS -X POST "$HOST/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.data.accessToken')

echo "9) Verify stored gender in users via /auth/user/me"
curl -sS -X GET "$HOST/api/auth/user/me" -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data | {gender, bio, profileImageUrl}'

echo "Done."



