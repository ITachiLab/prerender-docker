FROM node:6-onbuild

RUN mkdir /var/prerender
WORKDIR /var/prerender

RUN apt-get update
RUN apt-get install -y chromium

ADD server.js .
ADD package.json .
RUN npm install  prerender

EXPOSE 3000

CMD ["node", "server.js"]
