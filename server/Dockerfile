FROM node:23

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 
RUN npm install bcrypt

COPY . .

EXPOSE 3001

CMD ["npx", "nodemon", "src/server.js"]
