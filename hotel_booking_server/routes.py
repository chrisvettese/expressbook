import ast
import json
from datetime import datetime

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

        query = """INSERT INTO hotel.customer(customer_SIN, customer_name, customer_address, customer_email,
            customer_phone) VALUES ('{}', '{}', '{}', '{}', '{}')""" \
            .format(customer_sin, customer_name, customer_address, customer_email, customer_phone)
        try:
            execute(query, conn)
        except psycopg2.DatabaseError:
            raise ResourceConflictError(message='Customer already exists')
        return Response(status=201, mimetype='application/json')

    @app.route('/customers/<cid>/reservations')
    @cross_origin()
    def get_reservations_by_customer(cid):
        execute('SELECT hotel.correct_status(\'{}\')'.format(cid), conn)
        query = '''SELECT b.booking_id, b.date_of_registration, b.check_in_day, b.check_out_day, s.value AS status,
                   t.title, t.is_extendable, t.amenities, v.view, h.physical_address, t.price
                   FROM hotel.room_booking b
                   JOIN hotel.booking_status s ON s.status_ID = b.status_ID
                   JOIN hotel.hotel_room_type t ON t.type_ID = b.type_ID
                   JOIN hotel.view_type v ON v.view_ID = t.view_ID
                   JOIN hotel.hotel h ON h.hotel_ID = b.hotel_ID
                   WHERE b.customer_sin = '{}';'''.format(cid)
        response = get_results(query, conn)
        return Response(response, status=200, mimetype='application/json')

    @app.route('/customers/<cid>/reservations', methods=["POST"])
    @cross_origin()
    def create_reservation(cid):
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
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
            today = datetime.today().strptime(check_in, '%Y-%m-%d')
            if check_in_date < today:
                raise BadRequestError(message="Check in date cannot be in the past")
        except ValueError:
            raise BadRequestError(message="Invalid date format for check_in. Must be YYYY-MM-DD")

        try:
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
            if check_out_date <= check_in_date:
                raise BadRequestError(message="Check out date must be later than check in date")
        except ValueError:
            raise BadRequestError(message="Invalid date format for check_out. Must be YYYY-MM-DD")

        try:
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
            if check_out_date <= check_in_date:
                raise BadRequestError(message="Check out date must be later than check in date")
        except ValueError:
            raise BadRequestError(message="Invalid date format for check_out. Must be YYYY-MM-DD")

        query = 'SELECT hotel_ID FROM hotel.hotel_room_type WHERE type_ID = {}'.format(type_id)
        result = get_results(query, conn, jsonify=False)
        if len(result) == 0:
            raise BadRequestError(message="Hotel not found with type id=" + str(type_id))

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
        status = request.json['status']
        query = '''SELECT status_ID, check_in_day FROM hotel.room_booking
            WHERE customer_sin = '{}' AND booking_ID = '{}\''''.format(cid, rid)
        result = get_results(query, conn, single=True)
        if len(result) == 0:
            raise ResourceNotFoundError(message='Reservation does not exist or does not belong to this customer'
                                        .format(cid))

        result = ast.literal_eval(result)
        current_status = result['status_id']
        date = result['check_in_day']

        if not (current_status == 1 and status == 'Cancelled') and not (current_status == 2 and status == 'Archived') \
                and not (current_status == 1 and status == 'Renting' and date == datetime.today().strftime('%Y-%m-%d')):
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
        query = '''SELECT h.type_id, h.title, h.price, h.amenities, h.room_capacity, v.view, h.is_extendable,
        h.total_number_rooms, h.rooms_available FROM hotel.hotel_room_type h JOIN hotel.view_type v 
        ON v.view_ID = h.view_ID WHERE h.hotel_id = {}'''.format(hid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))
        return Response(response, status=200, mimetype='application/json')

    @app.route('/hotels/<hid>/rooms/availability')
    @cross_origin()
    def get_room_availability_by_hotel(hid):
        people = request.args.get('people')
        check_in_day = request.args.get('check-in')
        check_out_day = request.args.get('check-out')

        if people is None:
            raise BadRequestError(message="Missing required header field 'people'")
        if check_in_day is None:
            raise BadRequestError(message="Missing required header field 'check-in'")
        if check_out_day is None:
            raise BadRequestError(message="Missing required header field 'check-out'")

        try:
            people = int(people)
            if people < 1:
                raise BadRequestError(message="'people' must be a positive integer")
        except ValueError:
            raise BadRequestError(message="'people' must be a positive integer")

        try:
            datetime.strptime(check_in_day, '%Y-%m-%d')
        except ValueError:
            raise BadRequestError(message="Invalid date format for check-in. Must be YYYY-MM-DD")

        try:
            datetime.strptime(check_out_day, '%Y-%m-%d')
        except ValueError:
            raise BadRequestError(message="Invalid date format for check-in. Must be YYYY-MM-DD")

        if check_out_day <= check_in_day:
            raise BadRequestError(message='check-out must be later than check-in')

        query = '''SELECT t.type_id FROM hotel.hotel_room_type t
                   WHERE t.hotel_ID = {} AND t.room_capacity >= {}'''.format(hid, people)

        response = get_results(query, conn, jsonify=False)

        for room in response:
            query = '''SELECT hotel.max_occupancy(DATE '{}', DATE '{}', {})'''.format(check_in_day, check_out_day,
                                                                                      room.get('type_id'))
            occupancy = get_results(query, conn, jsonify=False)
            room['occupancy'] = occupancy[0].get('max_occupancy')

        return Response(json.dumps(response, default=str), status=200, mimetype='application/json')

    @app.route('/hotels/<hid>/employees', methods=["POST"])
    @cross_origin()
    def create_employee(hid):
        data = request.json
        if 'employee_sin' not in data:
            raise BadRequestError(message="Missing required body field 'employee_sin'")
        if 'manager_sin' not in data:
            raise BadRequestError(message="Missing required body field 'manager_sin'")
        if 'name' not in data:
            raise BadRequestError(message="Missing required body field 'name'")
        if 'address' not in data:
            raise BadRequestError(message="Missing required body field 'address'")
        if 'salary' not in data:
            raise BadRequestError(message="Missing required body field 'salary'")
        if 'job_title' not in data:
            raise BadRequestError(message="Missing required body field 'job_title'")

        employee_sin = data['employee_sin']
        manager_sin = data['manager_sin']
        name = data['name']
        address = data['address']
        salary = data['salary']
        job_title = data['job_title']

        if not verify_manager(manager_sin, hid, conn):
            raise BadRequestError(message='Invalid manager SIN')

        query = """INSERT INTO hotel.employee(employee_sin, employee_name, employee_address, salary, job_title,
                   hotel_ID) VALUES ('{}', '{}', '{}', '{}', '{}', '{}')""" \
            .format(employee_sin, name, address, salary, job_title, hid)

        try:
            execute(query, conn)
        except psycopg2.DatabaseError:
            raise ResourceConflictError(message='Employee already exists')
        return Response(status=201, mimetype='application/json')

    @app.route('/hotels/<hid>/employees/<eid>', methods=["DELETE"])
    @cross_origin()
    def delete_employee(hid, eid):
        data = request.json
        if 'manager_sin' not in data:
            raise BadRequestError(message="Missing required body field 'manager_sin'")

        manager_sin = data['manager_sin']

        if not verify_manager(manager_sin, hid, conn):
            raise BadRequestError(message='Invalid manager SIN')

        query = 'DELETE FROM hotel.employee WHERE employee_sin = \'{}\''.format(eid)
        try:
            execute(query, conn)
        except psycopg2.DatabaseError:
            raise ResourceConflictError(message='Unable to delete employee')
        return Response(status=204, mimetype='application/json')

    @app.route('/hotels/<hid>/employees')
    @cross_origin()
    def get_employees_by_hotel(hid):
        query = '''SELECT e.employee_sin, e.employee_name, e.employee_address, e.salary, e.job_title
                   FROM hotel.employee e WHERE e.hotel_id = {}'''.format(hid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))
        return Response(response, status=200, mimetype='application/json')

    @app.route('/employees/<eid>')
    @cross_origin()
    def get_employee(eid):
        query = '''SELECT e.employee_sin, e.employee_name, e.employee_address, e.salary, e.job_title, b.name,
                   h.brand_id, h.hotel_id FROM hotel.employee e JOIN hotel.hotel h ON h.hotel_id = e.hotel_id
                   JOIN hotel.hotel_brand b ON b.brand_id = h.brand_id WHERE e.employee_sin = '{}\''''.format(eid)
        response = get_results(query, conn, single=True)
        if len(response) == 0:
            raise ResourceNotFoundError(message='Employee SIN={} not found'.format(eid))
        return Response(response, status=200, mimetype='application/json')


def get_results(query, conn, single=False, jsonify=True):
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
            if jsonify:
                return json.dumps(results, default=str)
            else:
                return results


def execute(query, conn):
    print(query)
    with conn:
        with conn.cursor() as curs:
            curs.execute(query)


def verify_manager(manager_sin, hotel_id, conn):
    query = 'SELECT employee_sin FROM hotel.employee WHERE job_title = \'Manager\' AND hotel_id = {}'.format(hotel_id)
    result = get_results(query, conn, jsonify=False)
    if len(result) == 0:
        return False
    for employee in result:
        sin = employee.get('employee_sin')
        if sin is not None:
            if sin == manager_sin:
                return True
    return False
