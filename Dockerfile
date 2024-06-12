# Use the official lightweight Node.js 18 image.
# https://hub.docker.com/_/node
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV GH_PAT=$GH_PAT

# Copy package.json, package-lock.json, and your Next.js app to the container
COPY package*.json ./
COPY . .

# Install production dependencies.
RUN npm install

# Build your Next.js app
# RUN npm run build

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "run", "dev" ]
