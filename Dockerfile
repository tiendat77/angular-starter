#################################################
# STAGE 1: Build
#################################################
# Angular 22 supports Node ^22.22.3 || ^24.15.0 || >=26; 24 (LTS) is the line it runs on without Node
# warnings. Keep it in sync with .nvmrc (CI reads it) and "engines" in package.json.
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /workspace

# Dependencies first: this layer is rebuilt only when package.json, package-lock.json or .npmrc change.
# - HUSKY=0: the `prepare` script installs git hooks, and there is no .git in the image.
# - NODE_ENV is not "production" yet: `npm ci` would then skip devDependencies, and the Angular CLI
#   and build tools are devDependencies.
# - The cache mount keeps npm's download cache between builds (BuildKit).
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,id=npm,target=/root/.npm \
    HUSKY=0 npm ci --no-fund --no-audit

COPY . .

ARG BUILD_CONFIGURATION=production
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN npx --no-install ng build main --configuration ${BUILD_CONFIGURATION}

#################################################
# STAGE 2: Run
#################################################
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /workspace/dist/main/browser /usr/share/nginx/html

EXPOSE 80

STOPSIGNAL SIGTERM

# Render the runtime config from the environment, then run nginx
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/environments/env.template.js > /usr/share/nginx/html/environments/env.js && exec nginx -g 'daemon off;'"]
