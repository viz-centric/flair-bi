FROM traefik:alpine

COPY traefik.toml /etc/traefik/traefik.toml
COPY acme.json /etc/traefik/acme.json
RUN /bin/sh -c 'chmod 600 /etc/traefik/acme.json'
