### Build Step
FROM node:18 as builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

### Serve Step
FROM node:18-alpine
WORKDIR /app

ENV ORIGIN=http://localhost:3000

COPY --from=builder /usr/src/app/build .
COPY --from=builder /usr/src/app/package.json .

VOLUME /app/files
EXPOSE 3000

CMD ["node", "index.js"]