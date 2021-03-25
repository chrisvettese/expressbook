import ast

import psycopg2
from flask import request, Response
from flask_cors import cross_origin
from datetime import datetime, date

from hotel_booking_server.errors.BadRequestError import BadRequestError
from hotel_booking_server.errors.ResourceNotFoundError import ResourceNotFoundError
from hotel_booking_server.errors.ResourceConflictError import ResourceConflictError


def add_routes(app, conn):
    from hotel_booking_server.routes.setup_routes import get_customer_by_id, validate_sin, validate_email, \
        validate_phone, execute, get_results

    @app.route('/customers/<cid>')
    @cross_origin()
    def get_customer(cid):
        validate_sin(cid)
        results = get_customer_by_id(cid, conn)
        return Response(results, status=200, mimetype='application/json')

    @app.route('/customers', methods=["POST"])
    @cross_origin()
    def create_customer():
        data = request.json
        if 'customer_sin' not in data:
            raise BadRequestError(message="Missing required body field 'customer_sin'")
        if 'customer_name' not in data:
            raise BadRequestError(message="Missing required body field 'customer_name'")
        if 'customer_address' not in data:
            raise BadRequestError(message="Missing required body field 'customer_address'")
        if 'customer_email' not in data:
            raise BadRequestError(message="Missing required body field 'customer_email'")
        if 'customer_phone' not in data:
            raise BadRequestError(message="Missing required body field 'customer_phone'")

        customer_sin = data['customer_sin']
        customer_name = data['customer_name']
        customer_address = data['customer_address']
        customer_email = data['customer_email']
        customer_phone = data['customer_phone']

        validate_sin(customer_sin)
        validate_email(customer_email)
        validate_phone(customer_phone)
        if len(customer_address) == 0 or len(customer_address) > 255:
            raise BadRequestError(message='Invalid customer address - must be between 1 and 255 characters')

        query = """INSERT INTO hotel.customer(customer_SIN, customer_name, customer_address, customer_email,
            customer_phone) VALUES ('{}', '{}', '{}', '{}', '{}')""" \
            .format(customer_sin, customer_name, customer_address, customer_email, customer_phone)
        try:
            execute(query, conn)
        except psycopg2.DatabaseError:
            raise ResourceConflictError(message='Customer already exists')
        return Response(status=201, mimetype='application/json')

    @app.route('/customers/<cid>', methods=["PATCH"])
    @cross_origin()
    def update_customer(cid):
        data = request.json
        validate_sin(cid)
        get_customer_by_id(cid, conn)

        name_exists = False
        address_exists = False
        email_exists = False
        phone_exists = False
        query = 'UPDATE hotel.customer SET '

        if 'customer_name' in data and len(data['customer_name']) > 0:
            query += 'customer_name = \'' + data['customer_name'] + '\' '
            name_exists = True
        if 'customer_address' in data and len(data['customer_address']) > 0:
            if name_exists:
                query += ', '

            query += 'customer_address = \'' + data['customer_address'] + '\' '
            address_exists = True
        if 'customer_email' in data:
            if name_exists or address_exists:
                query += ', '

            validate_email(data['customer_email'])
            query += 'customer_email = \'' + data['customer_email'] + '\' '
            email_exists = True
        if 'customer_phone' in data:
            if name_exists or address_exists or email_exists:
                query += ', '

            validate_phone(data['customer_phone'])
            query += 'customer_phone = \'' + data['customer_phone'] + '\' '
            phone_exists = True

        if not name_exists and not address_exists and not email_exists and not phone_exists:
            raise BadRequestError(message='Must provide at least one of: customer_name, customer_address, '
                                          'customer_email, customer_phone')
        query += 'WHERE customer_sin = \'' + cid + "'"

        execute(query, conn)
        return Response(status=204, mimetype='application/json')

    @app.route('/customers/<cid>/reservations')
    @cross_origin()
    def get_reservations_by_customer(cid):
        validate_sin(cid)

        execute('SELECT hotel.correct_status_customer(\'{}\')'.format(cid), conn)
        query = '''SELECT b.booking_id, b.date_of_registration, b.check_in_day, b.check_out_day, s.value AS status,
                   t.title, t.is_extendable, t.amenities, v.view, h.physical_address, t.price, e.employee_name,
                   e.job_title
                   FROM hotel.room_booking b
                   JOIN hotel.booking_status s ON s.status_ID = b.status_ID
                   JOIN hotel.hotel_room_type t ON t.type_ID = b.type_ID
                   JOIN hotel.view_type v ON v.view_ID = t.view_ID
                   JOIN hotel.hotel h ON h.hotel_ID = b.hotel_ID
                   LEFT JOIN hotel.employee e ON b.employee_sin = e.employee_sin
                   WHERE b.customer_sin = '{}';'''.format(cid)
        response = get_results(query, conn)
        return Response(response, status=200, mimetype='application/json')

    @app.route('/customers/<cid>/reservations', methods=["POST"])
    @cross_origin()
    def create_reservation(cid):
        validate_sin(cid)

        data = request.json
        if 'check_in' not in data:
            raise BadRequestError(message="Missing required body field 'check_in'")
        if 'check_out' not in data:
            raise BadRequestError(message="Missing required body field 'check_out'")
        if 'type_id' not in data:
            raise BadRequestError(message="Missing required body field 'type_id'")

        check_in = data['check_in']
        check_out = data['check_out']
        type_id = data['type_id']

        try:
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
            today = date.today()
            if check_in_date < today:
                raise BadRequestError(message="Check in date cannot be in the past")
        except ValueError:
            raise BadRequestError(message="Invalid date format for check_in. Must be YYYY-MM-DD")

        try:
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
            if check_out_date <= check_in_date:
                raise BadRequestError(message="Check out date must be later than check in date")
        except ValueError:
            raise BadRequestError(message="Invalid date format for check_out. Must be YYYY-MM-DD")

        try:
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
            if check_out_date <= check_in_date:
                raise BadRequestError(message="Check out date must be later than check in date")
        except ValueError:
            raise BadRequestError(message="Invalid date format for check_out. Must be YYYY-MM-DD")

        query = 'SELECT hotel_ID FROM hotel.hotel_room_type WHERE type_ID = {}'.format(type_id)
        result = get_results(query, conn, jsonify=False)
        if len(result) == 0:
            raise ResourceNotFoundError(message="Hotel not found with type id=" + str(type_id))

        if 'employee_sin' in data:
            query = 'SELECT employee_SIN FROM hotel.employee WHERE status_id = 1 AND employee_SIN = \'{}\' ' \
                    'AND hotel_ID = {}'.format(data['employee_sin'], int(result[0].get('hotel_id')))
            e_result = get_results(query, conn, jsonify=False)
            if len(e_result) == 0:
                raise ResourceNotFoundError(message="Employee SIN not found")
            query = '''INSERT INTO hotel.room_booking(type_ID, hotel_ID, customer_SIN, check_in_day, check_out_day,
                       employee_SIN) VALUES ({}, {}, '{}', DATE '{}', DATE '{}', '{}')''' \
                .format(type_id, result[0].get('hotel_id'), cid, check_in_date, check_out_date,
                        e_result[0].get('employee_sin'))

        else:
            query = 'INSERT INTO hotel.room_booking(type_ID, hotel_ID, customer_SIN, check_in_day, check_out_day) ' \
                    "VALUES ({}, {}, '{}', DATE '{}', DATE '{}')".format(type_id, result[0].get('hotel_id'), cid,
                                                                         check_in_date, check_out_date)
        try:
            execute(query, conn)
        except psycopg2.DatabaseError as e:
            e = str(e)
            if 'Key (customer_sin)=' in e:
                raise BadRequestError(message='Customer id not found: ' + cid)
            if 'This room is already booked up' in e:
                raise ResourceConflictError(message='Room is already booked up')
            raise BadRequestError

        return Response(status=201, mimetype='application/json')

    @app.route('/customers/<cid>/reservations/<rid>', methods=["PATCH"])
    @cross_origin()
    def update_reservation(cid, rid):
        validate_sin(cid)

        data = request.json
        if 'status' not in data:
            raise BadRequestError(message='Missing required body field \'status\'')
        status = request.json['status']

        query = '''SELECT status_id, check_in_day, hotel_id FROM hotel.room_booking
        WHERE customer_sin = '{}' AND booking_ID = '{}\''''.format(cid, rid)
        result = get_results(query, conn, single=True)
        if len(result) == 0:
            raise ResourceNotFoundError(message='Reservation does not exist or does not belong to this customer'
                                        .format(cid))

        result = ast.literal_eval(result)
        current_status = result['status_id']
        d = result['check_in_day']

        if not (current_status == 1 and status == 'Cancelled') and not (current_status == 2 and status == 'Archived') \
                and not (current_status == 1 and status == 'Renting' and d == datetime.today().strftime('%Y-%m-%d')):
            raise BadRequestError(
                message='Invalid status transition. Booked rooms can be cancelled, and rented rooms can be archived.'
                    .format(cid))

        if 'employee_sin' in data:
            validate_sin(data['employee_sin'])

            query = 'SELECT employee_SIN, hotel_id FROM hotel.employee WHERE status_id = 1 AND employee_SIN = \'{}\'' \
                .format(data['employee_sin'])
            e_result = get_results(query, conn, jsonify=False)
            if len(e_result) == 0:
                raise ResourceNotFoundError(message='Employee SIN not found')
            if e_result[0].get('hotel_id') != result['hotel_id']:
                raise BadRequestError(
                    message="Given employee cannot update this reservation - works at different hotel")

            query = '''UPDATE hotel.room_booking SET status_ID = 
                   (SELECT s.status_ID FROM hotel.booking_status s WHERE s.value = '{}') , employee_sin = '{}'
                   WHERE booking_ID = {}'''.format(status, e_result[0].get('employee_sin'), rid)

        else:
            query = '''UPDATE hotel.room_booking SET status_ID = 
                       (SELECT s.status_ID FROM hotel.booking_status s WHERE s.value = '{}')
                       WHERE booking_ID = {}'''.format(status, rid)
        execute(query, conn)
        return Response(status=204, mimetype='application/json')
