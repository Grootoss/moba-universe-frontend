#!/bin/sh
# Reload nginx after certbot replaces the mounted certificate.
# Port 80 stays with nginx; nothing here binds it.
set -eu

CERT=/etc/letsencrypt/live/mobauniverse.com/fullchain.pem
if [ ! -f "$CERT" ]; then
  exit 0
fi

nohup sh -c '
  cert="$1"
  last=$(stat -c %Y "$cert" 2>/dev/null || echo 0)
  while sleep 3600; do
    now=$(stat -c %Y "$cert" 2>/dev/null || echo 0)
    if [ "$now" != "$last" ]; then
      nginx -s reload || true
      last=$now
    fi
  done
' sh "$CERT" >/dev/null 2>&1 &
