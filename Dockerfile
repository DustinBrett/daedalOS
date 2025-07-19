FROM node:22-alpine

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN apk add --no-cache git

WORKDIR taqyudin-portfolio
COPY . .

RUN yarn
RUN yarn build

CMD yarn serve
