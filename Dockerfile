FROM node:22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /daedalOS
COPY . .

RUN yarn
RUN yarn build

FROM node:22-alpine

WORKDIR /daedalOS
COPY --from=builder /daedalOS/out ./out

RUN npm install -g serve@latest

CMD ["serve", "out"]
