#!/usr/bin/env bash
# Haalt de FIS-objecten op bij RWS Vaarweginformatie (CC-0) als JSONL. Gebruik: tools/fetch_fis.sh <doelmap>
set -euo pipefail
OUT=${1:?doelmap}; mkdir -p "$OUT"
BASE=https://www.vaarweginformatie.nl/wfswms/dataservice/1.4
GEN=$(curl -sS "$BASE/geogeneration" | python3 -c "import sys,json;print(json.load(sys.stdin)['GeoGeneration'])")
echo "geogeneratie $GEN"
for t in bridge opening lock radiocallinpoint operatingtimes fairway; do
  o=0; : > "$OUT/$t.jsonl"
  while :; do
    n=$(curl -sS -m 90 "$BASE/$GEN/$t?offset=$o&count=500" \
      | python3 -c "import sys,json;[print(json.dumps(x)) for x in json.load(sys.stdin)['Result']]" | tee -a "$OUT/$t.jsonl" | wc -l)
    [ "$n" -lt 500 ] && break; o=$((o+500))
  done
  echo "$t: $(wc -l < "$OUT/$t.jsonl")"
done
