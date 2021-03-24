__version__ = '1.0'

import os

import psycopg2
import atexit

import yaml
from flask import Flask
from flask_cors import CORS

from hotel_booking_server import setup_db, routes
from hotel_booking_server.BadRequestError import BadRequestError
from hotel_booking_server.ResourceConflictError import ResourceConflictError
from hotel_booking_server.ResourceNotFoundError import ResourceNotFoundError


def main():
    app = Flask(__name__, static_folder='../hotel-ui/build')
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    with open("config.yml", "r") as file:
        config = yaml.load(file, Loader=yaml.SafeLoader)

    print('Connecting to db')
    try:
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['user'],
            password=config['password'])

        print('Connected to db')

        data_mode = config['data-mode']
        if config['reset-db']:
            setup_db.setup(conn, data_mode)
        else:
            setup_db.setup_if_missing(conn, data_mode)
    except psycopg2.DatabaseError as e:
        print('Error connecting to db')
        raise e

    @app.route('/ui/<path:path>')
    def user(path):
        return app.send_static_file('index.html')

    @app.errorhandler(ResourceNotFoundError)
    @app.errorhandler(ResourceConflictError)
    @app.errorhandler(BadRequestError)
    def handle_not_found(error):
        response = error.json()
        response.status_code = error.status_code
        return response

    routes.add_routes(app, conn)

    def exit_handler():
        print('Shutting down')
        conn.close()

    atexit.register(exit_handler)

    # remove before releasing production build
    os.environ['FLASK_ENV'] = 'development'
    app.run(host='0.0.0.0', port=1234, debug=True, use_reloader=False)


if __name__ == '__main__':
    main()
