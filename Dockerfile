FROM node:12-alpine
# Create app directory and use it as working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
# Getting the package manager
RUN npm install
COPY . /usr/src/app
# start
CMD ["node", "index.js"]
EXPOSE 3000