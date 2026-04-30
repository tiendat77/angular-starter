#################################################
# STAGE 1: Build
#################################################
ARG NODE_VERSION=22.17.0

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /workspace

COPY package*.json .
COPY packages ./packages
COPY libs ./libs

RUN npm pkg delete scripts.prepare
RUN yarn install --frozen-lockfile

ENV NODE_OPTIONS=--max-old-space-size=8192
ENV NODE_ENV=production

COPY . .
RUN yarn run build

#################################################
# STAGE 2: Run
#################################################
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /workspace/dist/browser /usr/share/nginx/html

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/environments/env.template.js > /usr/share/nginx/html/environments/env.js && exec nginx -g 'daemon off;'"]