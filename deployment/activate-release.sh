#!/usr/bin/env bash
# Executed on the Linux VPS by the frontend deployment workflow.
set -euo pipefail

commit="${1:?Pass the release commit SHA}"
[[ "$commit" =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid commit SHA' >&2; exit 1; }
base=/var/www/pms-frontend
release="$base/releases/$commit"
test -s "$release/index.html"
test -s "$release/version.json"
previous="$(readlink "$base/current" || true)"

activate() {
  ln -sfn "$1" "$base/current-next"
  mv -Tf "$base/current-next" "$base/current"
}

verify() {
  local served
  served="$(curl --fail --silent --show-error --max-time 30 \
    --resolve etihadrealestate.tech:443:127.0.0.1 \
    https://etihadrealestate.tech/version.json)" || return 1
  [[ "$served" == "{\"commit\":\"$commit\"}" ]] || return 1
  curl --fail --silent --show-error --max-time 30 \
    -H 'Origin: https://etihadrealestate.tech' \
    https://api.etihadrealestate.tech/api/v1/openapi.json > /dev/null
}

activate "$release"
if ! verify; then
  if [[ -n "$previous" ]]; then
    activate "$previous"
    echo 'Deployment verification failed; restored the previous frontend release.' >&2
  else
    echo 'First deployment verification failed; no previous release exists to restore.' >&2
  fi
  exit 1
fi
echo "Frontend release $commit is live at https://etihadrealestate.tech"
