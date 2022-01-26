# Dockerfile to start a docker in DEV mode

# To generate the docker:
# docker build -t daedalos:v1 .

# To run the docker:
# docker run -d --rm -p 3000:3000 --name daedalos daedalos:v1
FROM node:16-alpine
RUN apk add --no-cache git
COPY . daedalOS
WORKDIR daedalOS
RUN yarn
RUN yarn build:fs
CMD yarn dev
