
FROM hub.onlinebank.kz/core-images/runners/nginx:1.18.0-alpine

COPY --chown=nonroot:nonroot ./dist/ob-web/ /usr/share/nginx/html

COPY --chown=nonroot:nonroot ./nginx/default.conf /etc/nginx/conf.d/default.conf

USER root
RUN  ["nginx", "-T"]
USER nonroot
