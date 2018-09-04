FROM node:8-stretch

RUN mkdir /var/prerender
WORKDIR /var/prerender

RUN apt-get update
RUN apt-get install -y chromium

ADD lib ./lib
ADD server.js .
ADD package.json .

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
