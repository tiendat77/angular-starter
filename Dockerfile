#################################################
# STAGE 1: Build
#################################################
ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /workspace

COPY package*.json .
COPY packages ./packages
COPY projects ./projects

RUN npm pkg delete scripts.prepare
RUN yarn install --frozen-lockfile

ENV NODE_OPTIONS=--max-old-space-size=8192
ENV NODE_ENV=production

COPY . .
RUN npm run build

#################################################
# STAGE 2: Run
#################################################
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /workspace/dist/browser /usr/share/nginx/html

EXPOSE 80