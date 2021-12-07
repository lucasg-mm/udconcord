FROM node:14.14.0-alpine
RUN mkdir /uploads
WORKDIR "/app"
COPY ./package.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]