FROM node:23

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install i18next react-i18next

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host"] 