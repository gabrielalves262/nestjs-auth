FROM node:20.14.0-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["node", "dist/main.js"]