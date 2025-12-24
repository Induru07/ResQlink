# 1. Use an official Node.js runtime as a parent image
# "alpine" is a super-small version of Linux (very professional)
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first (for better caching)
COPY package*.json ./

# 4. Install dependencies inside the container
RUN npm install

# 5. Copy the rest of your app code
COPY . .

# 6. Open Port 5000 (Your .env port)
EXPOSE 5000

# 7. Define the command to run your app
# (Change this to "node server.js" if you don't have a start script)
CMD ["npm", "run", "dev"]
