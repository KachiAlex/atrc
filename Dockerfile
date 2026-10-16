                                                                    # Build stage
FROM node:18-alpine AS build
WORKDIR /app

ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=2048

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Runtime stage: nginx + Postgres + API server in one container
FROM postgres:16

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor nodejs npm \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default

COPY server /app/server
RUN cd /app/server && npm install --omit=dev

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/atrc.conf
COPY --from=build /app/build /usr/share/nginx/html

RUN mkdir -p /var/lib/atrc/uploads

ENV PGDATA=/var/lib/postgresql/data
ENV UPLOAD_DIR=/var/lib/atrc/uploads
ENV PORT=3001

EXPOSE 80
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
