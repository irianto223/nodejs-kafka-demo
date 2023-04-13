FROM node:16.19.0

WORKDIR /app

COPY package.json index.js /app/

RUN npm install
RUN npm install --global nodemon

CMD ["nodemon", "index.js"]
