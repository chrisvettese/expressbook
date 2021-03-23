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
