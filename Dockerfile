FROM node:18-alpine AS builder

WORKDIR /usr/src

COPY . /usr/src

RUN yarn install

RUN yarn build

FROM nginx:alpine
RUN rm -vf /usr/share/nginx/html/*
COPY --from=builder /usr/src/build /usr/share/nginx/html
