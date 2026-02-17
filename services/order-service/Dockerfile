FROM node:20-alpine

WORKDIR /app

# Copy only this service's package.json first
COPY services/order-service/package*.json ./services/order-service/

WORKDIR /app/services/order-service
RUN npm install

# Now copy entire project (shared included)
WORKDIR /app
COPY . .

# Build the service
WORKDIR /app/services/order-service
RUN npm run build

CMD ["node", "dist/order-service/src/index.js"]
