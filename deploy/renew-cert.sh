#!/bin/sh
# Renew the Let's Encrypt certificate for mobauniverse.com without binding port 80.
#
# Port 80 stays with nginx (the site). Certbot must use webroot, not standalone.
# Nginx already serves http://mobauniverse.com/.well-known/acme-challenge/
# from /var/www/certbot inside the frontend container.
#
# Run once on the VPS as root:
#   sudo sh deploy/renew-cert.sh
# Install the daily retry (certbot itself renews only when the cert is near expiry):
#   sudo sh deploy/renew-cert.sh --install-cron
#
# The frontend container must mount:
#   -v /etc/letsencrypt:/etc/letsencrypt:ro
#   -v /var/www/certbot:/var/www/certbot:ro
set -eu

DOMAIN="${DOMAIN:-mobauniverse.com}"
WEBROOT="${WEBROOT:-/var/www/certbot}"
SCRIPT_PATH=$(python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "$0")
CRON_LINE="17 3 * * * root $SCRIPT_PATH --quiet >> /var/log/moba-cert-renew.log 2>&1"
INSTALL_CRON=0
QUIET=0

for arg in "$@"; do
  case "$arg" in
    --install-cron) INSTALL_CRON=1 ;;
    --quiet) QUIET=1 ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

log() {
  if [ "$QUIET" -eq 0 ]; then
    echo "$*"
  fi
}

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root on the VPS (certbot and /etc/letsencrypt)." >&2
  exit 1
fi

if ! command -v certbot >/dev/null 2>&1; then
  echo "certbot is not installed on this host." >&2
  exit 1
fi

mkdir -p "$WEBROOT/.well-known/acme-challenge"
PROBE="mu-probe-$(date +%s)"
printf 'ok\n' > "$WEBROOT/.well-known/acme-challenge/$PROBE"
PROBE_URL="http://127.0.0.1/.well-known/acme-challenge/$PROBE"
PROBE_BODY="$(curl -fsS --resolve "${DOMAIN}:80:127.0.0.1" "$PROBE_URL" 2>/dev/null || true)"
rm -f "$WEBROOT/.well-known/acme-challenge/$PROBE"

if [ "$PROBE_BODY" != "ok" ]; then
  echo "Nginx on port 80 did not serve $WEBROOT." >&2
  echo "Port 80 is already taken by the site, so certbot must NOT use standalone." >&2
  echo "Mount the same directory into the frontend container and keep nginx on port 80:" >&2
  echo "  -v /etc/letsencrypt:/etc/letsencrypt:ro" >&2
  echo "  -v /var/www/certbot:/var/www/certbot:ro" >&2
  echo "The nginx config already has location /.well-known/acme-challenge/ { root /var/www/certbot; }" >&2
  if command -v docker >/dev/null 2>&1; then
    echo "Containers publishing port 80:" >&2
    docker ps --format '  {{.Names}}  {{.Ports}}' | awk '/:80->/ { print }' >&2 || true
  fi
  exit 1
fi

CONF="/etc/letsencrypt/renewal/${DOMAIN}.conf"
if [ ! -f "$CONF" ]; then
  echo "No renewal config at $CONF. Issue the cert once with webroot:" >&2
  echo "  certbot certonly --webroot -w $WEBROOT -d $DOMAIN -d www.$DOMAIN" >&2
  exit 1
fi

BACKUP="${CONF}.bak.$(date +%Y%m%d%H%M%S)"
cp -a "$CONF" "$BACKUP"
log "Backed up renewal config to $BACKUP"

python3 - "$CONF" "$WEBROOT" << 'PY'
import sys
from pathlib import Path

conf_path, webroot = sys.argv[1], sys.argv[2]
text = Path(conf_path).read_text()
lines = []
seen_auth = False
seen_webroot = False
for line in text.splitlines():
    stripped = line.strip()
    if stripped.startswith("authenticator ") or stripped.startswith("authenticator="):
        lines.append("authenticator = webroot")
        seen_auth = True
        continue
    if stripped.startswith("webroot_path ") or stripped.startswith("webroot_path="):
        lines.append(f"webroot_path = {webroot},")
        seen_webroot = True
        continue
    if stripped.startswith("pref_challs ") or stripped.startswith("pref_challs="):
        lines.append("pref_challs = http-01,")
        continue
    lines.append(line)
if not seen_auth or not seen_webroot:
    out = []
    inserted = False
    for line in lines:
        out.append(line)
        if not inserted and line.strip() == "[renewalparams]":
            if not seen_auth:
                out.append("authenticator = webroot")
            if not seen_webroot:
                out.append(f"webroot_path = {webroot},")
            inserted = True
    lines = out
Path(conf_path).write_text("\n".join(lines) + "\n")
PY

HOOK_DIR=/etc/letsencrypt/renewal-hooks/deploy
HOOK="$HOOK_DIR/reload-moba-nginx.sh"
mkdir -p "$HOOK_DIR"
cat > "$HOOK" << 'EOF'
#!/bin/sh
# Reload the nginx that is listening on 80/443 so it picks up the renewed cert.
if ! command -v docker >/dev/null 2>&1; then
  if command -v nginx >/dev/null 2>&1; then
    nginx -s reload
  fi
  exit 0
fi
container=$(docker ps --format '{{.Names}} {{.Ports}}' | awk '/:80->|:443->/ { print $1; exit }')
if [ -n "$container" ]; then
  docker exec "$container" nginx -s reload
fi
EOF
chmod 755 "$HOOK"

log "Renewal method is webroot ($WEBROOT). Dry-run:"
certbot renew --cert-name "$DOMAIN" --dry-run --non-interactive

if [ "$INSTALL_CRON" -eq 1 ]; then
  CRON_FILE=/etc/cron.d/moba-cert-renew
  printf '%s\n' "$CRON_LINE" > "$CRON_FILE"
  chmod 644 "$CRON_FILE"
  log "Installed $CRON_FILE"
  log "certbot renews the cert about 30 days before it expires. The cron retries daily."
fi

log "Done. Nginx keeps port 80. The next real renew will not try to bind it."
