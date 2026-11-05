FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html privacy.html terms.html /srv/
COPY assets /srv/assets
