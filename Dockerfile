FROM python:3.9 AS backend
RUN mkdir /app
RUN mkdir /app/hotel_booking_server
RUN mkdir /pgadmin4
COPY servers.json /pgadmin4
WORKDIR /app
COPY pyproject.toml poetry.lock config.yml ./
COPY requirements.txt ./
ENV PYTHONPATH=${PYTHONPATH}:${PWD}
RUN pip3 install -r requirements.txt
RUN poetry config virtualenvs.create false
RUN poetry install --no-root --no-dev
COPY ./hotel_booking_server ./hotel_booking_server
RUN poetry install --no-dev

FROM node:14 AS build
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./hotel-ui/package.json ./hotel-ui/package.json
COPY ./hotel-ui/package-lock.json ./hotel-ui/package-lock.json
WORKDIR ./hotel-ui
RUN npm ci --silent
COPY ./hotel-ui ./
RUN npm run build

FROM nginx:alpine AS frontend
COPY --from=build ./app/hotel-ui/build ./usr/share/nginx/html
COPY ./nginx.conf ./etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]