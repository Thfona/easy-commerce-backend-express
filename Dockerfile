FROM node:12.18.2-stretch AS build
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install --quiet
COPY . .
RUN npm run build


FROM node:12.18.2-stretch
COPY --from=build /app/dist /app/dist
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm install --only=production --quiet
CMD npm start
