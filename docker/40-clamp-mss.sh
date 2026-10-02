#!/bin/sh
# VPN tunnels often drop ICMP "fragmentation needed", so a 1500-byte path
# blackholes and the site never finishes loading. Clamp MSS when we can.
# The container needs cap_add: NET_ADMIN; without it this is a no-op.
if command -v iptables >/dev/null 2>&1; then
  iptables -t mangle -C OUTPUT -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1280 2>/dev/null \
    || iptables -t mangle -A OUTPUT -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1280 \
    || true
fi
if command -v sysctl >/dev/null 2>&1; then
  sysctl -w net.ipv4.tcp_mtu_probing=1 >/dev/null 2>&1 || true
fi
