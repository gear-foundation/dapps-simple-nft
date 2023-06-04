FROM node:18-alpine

WORKDIR /usr/src

COPY . /usr/src

RUN yarn install

RUN yarn build

CMD ["sleep", "3600000"]
