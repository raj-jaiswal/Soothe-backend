# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (matches your PORT env variable)
EXPOSE 3000

CMD ["node", "src/server.js"]