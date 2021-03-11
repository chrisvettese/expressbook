__version__ = '1.0'

import os

import psycopg2
import atexit

import yaml
from flask import Flask
from hotel_booking_server import setup_db


def main():
    app = Flask(__name__)

    with open("./config.yml", "r") as file:
        config = yaml.load(file, Loader=yaml.SafeLoader)

    print('Connecting to db')
    try:
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['user'],
            password=config['password'])

        setup_db.setup(conn)
    except psycopg2.DatabaseError as e:
        print('Error connecting to db')
        raise e

    print('Connected to db')

    @app.route('/')
    def index():
        return 'Hello, World!'

    def exit_handler():
        print('Shutting down')
        conn.close()

    atexit.register(exit_handler)

    # remove before releasing production build
    os.environ['FLASK_ENV'] = 'development'
    app.run(host='localhost', port=1234, debug=True, use_reloader=False)


if __name__ == '__main__':
    main()
