import ast
import json

import psycopg2
from flask import Response, request
from flask_cors import cross_origin

from hotel_booking_server.BadRequestError import BadRequestError
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

    @app.route('/customers/<cid>/reservations')
    @cross_origin()
    def get_reservations_by_customer(cid):
        execute('SELECT hotel.correct_status(\'{}\')'.format(cid), conn)
        query = '''SELECT b.booking_id, b.date_of_registration, b.check_in_day, b.check_out_day, s.value, t.title
                   FROM hotel.room_booking b
                   JOIN hotel.booking_status s ON s.status_ID = b.status_ID
                   JOIN hotel.hotel_room_type t ON t.type_ID = b.type_ID
                   WHERE b.customer_sin = '{}';'''.format(cid)
        response = get_results(query, conn)
        return Response(response, status=200, mimetype='application/json')

    @app.route('/customers/<cid>/reservations/<rid>', methods=["PATCH"])
    @cross_origin()
    def update_reservation(cid, rid):
        status = request.json['status']
        query = '''SELECT status_ID FROM hotel.room_booking
            WHERE customer_sin = '{}' AND booking_ID = '{}\''''.format(cid, rid)
        result = get_results(query, conn, single=True)
        if len(result) == 0:
            raise ResourceNotFoundError(message='Reservation does not exist or does not belong to this customer'
                                        .format(cid))

        current_status = ast.literal_eval(result)['status_id']
        if not (current_status == 1 and status == 'Cancelled') or not (current_status == 1 and status == 'Cancelled'):
            raise BadRequestError(
                message='Invalid status transition. Booked rooms can be cancelled, and rented rooms can be archived.'
                    .format(cid))

        query = '''UPDATE hotel.room_booking SET status_ID = 
                   (SELECT s.status_ID FROM hotel.booking_status s WHERE s.value = '{}')
                   WHERE booking_ID = {};'''.format(status, rid)
        execute(query, conn)
        return Response(status=204, mimetype='application/json')

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
        query = '''SELECT h.type_id, h.title, h.price, h.amenities, h.room_capacity, v.type, h.is_extendable,
        h.total_number_rooms, h.rooms_available FROM hotel.hotel_room_type h JOIN hotel.view_type v 
        ON v.view_ID = h.view_ID WHERE h.hotel_id = {}'''.format(hid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))
        return Response(response, status=200, mimetype='application/json')


def get_results(query, conn, single=False, dictionary=False):
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
            return json.dumps(results, default=str)


def execute(query, conn):
    print(query)
    with conn:
        with conn.cursor() as curs:
            curs.execute(query)
