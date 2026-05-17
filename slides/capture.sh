#!/usr/bin/env bash
# Capture every slide as a 1080×1080 PNG ready for LinkedIn carousel.
# Requires a static server serving the repo root at http://localhost:4000
# (e.g. `npx http-server -p 4000 -c-1` from the repo root).

set -e

cd "$(dirname "$0")"
mkdir -p exports

PORT=${PORT:-4000}
URL_BASE="http://localhost:${PORT}/slides/slide.html"

# Probe the server up-front so we fail fast with a useful message.
if ! curl -s -o /dev/null -w "%{http_code}" "${URL_BASE}?n=1" | grep -q "200"; then
  echo "ERROR: cannot reach ${URL_BASE}"
  echo "Start a static server from the repo root first:"
  echo "  npx http-server -p ${PORT} -c-1"
  exit 1
fi

# Total slide count comes from data.js; grep the array length.
TOTAL=$(grep -cE '^[[:space:]]*\{[[:space:]]*kind:' data.js)
if [ -z "$TOTAL" ] || [ "$TOTAL" -lt 1 ]; then
  TOTAL=13
fi

echo "Capturing ${TOTAL} slides → exports/"
echo

for n in $(seq 1 "$TOTAL"); do
  num=$(printf "%02d" "$n")
  out="exports/slide-${num}.png"
  printf "  %s ... " "slide-${num}"

  # pageres-cli writes to the CWD; capture and move.
  npx --yes pageres-cli@latest "${URL_BASE}?n=${n}&capture=1" 1080x1080 \
    -d 4 --overwrite --filename="slide-${num}" \
    > /dev/null 2>&1 || true

  if [ -f "slide-${num}.png" ]; then
    mv "slide-${num}.png" "$out"
  fi

  if [ -f "$out" ]; then
    size=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")
    echo "ok (${size} bytes)"
  else
    echo "FAIL"
  fi
done

echo
echo "Done. Open exports/ and upload to LinkedIn as a carousel post."
