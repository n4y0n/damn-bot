FROM node:alpine

#Add Tini
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./

CMD [ "node", "index.js" ]