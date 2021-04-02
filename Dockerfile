FROM python:3.9 AS backend
ENV TIMEZONE America/Toronto
RUN ln -snf /usr/share/zoneinfo/$TIMEZONE /etc/localtime && echo $TIMEZONE > /etc/timezone
RUN mkdir /app
RUN mkdir /app/hotel_booking_server
WORKDIR /app
ENV PYTHONPATH=${PYTHONPATH}:${PWD}
COPY requirements.txt ./
RUN pip3 install -r requirements.txt
RUN poetry config virtualenvs.create false
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --no-dev
COPY ./hotel_booking_server ./hotel_booking_server
COPY ./sql ./sql
RUN poetry install --no-dev
COPY config.yml ./
COPY ./hotel_booking_server/wsgi.py ./

FROM node:14 AS build
RUN mkdir /react
WORKDIR /react
ENV PATH /react/node_modules/.bin:$PATH
COPY ./hotel-ui/package.json ./hotel-ui/package.json
COPY ./hotel-ui/package-lock.json ./hotel-ui/package-lock.json
WORKDIR ./hotel-ui
RUN npm ci --silent
COPY ./hotel-ui ./
RUN npm run build

FROM nginx:alpine AS proxy
COPY --from=build ./react/hotel-ui/build ./usr/share/nginx/html
COPY ./nginx.conf ./etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]