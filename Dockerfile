FROM node:alpine AS node-builder

WORKDIR /backend

COPY package*.json ./
RUN npm install

COPY tsconfig.json .
COPY /src ./
RUN npx tsc 

FROM heroiclabs/nakama:3.14.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY my-config.yml /nakama/data/
