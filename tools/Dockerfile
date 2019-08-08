FROM node:alpine

ENV TINI_VERSION=v0.18.0 \
    NODE_ENV=production

#Add Tini
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "." ]
