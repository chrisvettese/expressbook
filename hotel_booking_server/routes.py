import json

import psycopg2
from flask import Response, request
from flask_cors import cross_origin

from hotel_booking_server.ResourceConflictError import ResourceConflictError
from hotel_booking_server.ResourceNotFoundError import ResourceNotFoundError


def add_routes(app, conn):
    @app.route('/customers/<cid>')
    @cross_origin()
    def get_customer(cid):
        query = 'SELECT * FROM hotel.customer c WHERE c.customer_sin = \'{}\''.format(cid)
        response = get_results(query, conn, single=True)
        if len(response) == 0:
            raise ResourceNotFoundError(message='Customer SIN={} not found'.format(cid))
        return Response(response, status=200, mimetype='application/json')

    @app.route('/customers', methods=["POST"])
    @cross_origin()
    def create_customer():
        data = request.json
        customer_sin = data['customer_sin']
        customer_name = data['customer_name']
        customer_address = data['customer_address']
        query = 'INSERT INTO hotel.customer(customer_SIN, customer_name, customer_address) ' \
                "VALUES ('{}', '{}', '{}')".format(customer_sin, customer_name, customer_address)
        try:
            execute(query, conn)
        except psycopg2.DatabaseError:
            raise ResourceConflictError(message='Customer already exists')
        return Response(status=201, mimetype='application/json')

    @app.route('/brands')
    @cross_origin()
    def get_brands():
        query = 'SELECT * FROM hotel.hotel_brand'
        response = get_results(query, conn)
        return Response(response, status=200, mimetype='application/json')

    @app.route('/brands/<bid>/hotels')
    @cross_origin()
    def get_hotels_by_brand(bid):
        query = 'SELECT * FROM hotel.hotel h WHERE h.brand_id = {}'.format(bid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Brand ID={} not found'.format(bid))
        return Response(response, status=200, mimetype='application/json')

    @app.route('/hotels/<hid>/rooms')
    @cross_origin()
    def get_rooms_by_hotel(hid):
        query = 'SELECT * FROM hotel.hotel_room_type h WHERE h.hotel_id = {}'.format(hid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))
        return Response(response, status=200, mimetype='application/json')


def get_results(query, conn, single=False):
    print(query)
    with conn:
        with conn.cursor() as curs:
            curs.execute(query)
            results = [dict((curs.description[i][0], value)
                            for i, value in enumerate(row)) for row in curs.fetchall()]
            if single:
                if len(results) != 0:
                    results = results[0]
                else:
                    return results
            return json.dumps(results)


def execute(query, conn):
    print(query)
    with conn:
        with conn.cursor() as curs:
            curs.execute(query)
