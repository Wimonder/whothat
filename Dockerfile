FROM node:16-alpine AS builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
RUN npm config set unsafe-perm true
RUN npm install -g typescript
RUN npm install -g ts-node
USER node
RUN npm install
COPY --chown=node:node . .
RUN npx prisma generate
RUN npm run build

FROM node:16-alpine AS runner
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
USER node
RUN npm install --production
COPY --from=builder /home/node/app/build .
COPY --from=builder /home/node/app/prisma ./prisma
RUN npx prisma generate

CMD [ "node", "index.js" ]
