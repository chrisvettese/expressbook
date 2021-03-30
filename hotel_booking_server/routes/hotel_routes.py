import psycopg2
from flask import Response, request, app
from flask_cors import cross_origin
import json
from datetime import datetime
from hotel_booking_server.errors.BadRequestError import BadRequestError
from hotel_booking_server.errors.ResourceNotFoundError import ResourceNotFoundError
from hotel_booking_server.errors.ResourceConflictError import ResourceConflictError


def add_routes(app, conn):
    from hotel_booking_server.routes.setup_routes import get_results, verify_manager, execute

    @app.route('/hotels/<hid>/rooms')
    @cross_origin()
    def get_rooms_by_hotel(hid):
        query = '''SELECT * FROM hotel.hotel WHERE hotel_id = {}'''.format(hid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))

        query = '''SELECT h.type_id, h.title, h.price, h.amenities, h.room_capacity, v.view, h.is_extendable,
        h.total_number_rooms, h.rooms_available FROM hotel.hotel_room_type h JOIN hotel.view_type v 
        ON v.view_ID = h.view_ID WHERE h.hotel_id = {} AND h.deleted = false'''.format(hid)
        response = get_results(query, conn)

        return Response(response, status=200, mimetype='application/json')

    @app.route('/hotels/<hid>/rooms', methods=['POST'])
    @cross_origin()
    def create_room(hid):
        query = '''SELECT * FROM hotel.hotel WHERE hotel_id = {}'''.format(hid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))

        data = request.json
        if 'manager_sin' not in data:
            raise BadRequestError(message="Missing required body field 'manager_sin'")
        if 'title' not in data:
            raise BadRequestError(message="Missing required body field 'title'")
        if 'price' not in data:
            raise BadRequestError(message="Missing required body field 'price'")
        if 'amenities' not in data:
            raise BadRequestError(message="Missing required body field 'amenities'")
        if 'room_capacity' not in data:
            raise BadRequestError(message="Missing required body field 'price'")
        if 'view' not in data:
            raise BadRequestError(message="Missing required body field 'view'")
        if 'is_extendable' not in data:
            raise BadRequestError(message="Missing required body field 'is_extendable'")
        if 'rooms' not in data:
            raise BadRequestError(message="Missing required body field 'rooms'")

        manager_sin = data['manager_sin']
        verify_manager(manager_sin, hid, conn)

        title = data['title']
        price = data['price']
        amenities = data['amenities']
        room_capacity = data['room_capacity']
        view = data['view']
        is_extendable = data['is_extendable']
        rooms = data['rooms']

        if len(title) == 0:
            raise BadRequestError(message='Length of \'title\' must be greater than 0')
        try:
            price = round(float(price), 2)
        except ValueError:
            raise BadRequestError(message="Invalid value of 'price'")
        if price < 0:
            raise BadRequestError(message="Invalid value of 'price'")
        if type(amenities) != list:
            raise BadRequestError(message="Invalid format of 'amenities': must be an array of strings")
        if type(room_capacity) != int or room_capacity <= 0:
            raise BadRequestError(message="Invalid value of 'room_capacity'")
        if type(view) != str or len(view) == 0:
            raise BadRequestError(message="Invalid value of 'view'")
        view_id = '''SELECT view_id FROM hotel.view_type WHERE view = '{}\''''.format(view)
        view_id = get_results(view_id, conn, jsonify=False)
        if len(view_id) == 0:
            raise BadRequestError(message="View='{}' not found".format(view))
        view_id = view_id[0].get('view_id')

        if type(is_extendable) != bool:
            raise BadRequestError(message="Invalid value of 'is_extendable'")
        if type(rooms) != int or rooms < 0:
            raise BadRequestError(message="Invalid value of 'rooms'")

        amenities = to_pg_array(amenities)

        query = '''INSERT INTO hotel.hotel_room_type(hotel_id, title, price, amenities, room_capacity, view_id, is_extendable, 
            total_number_rooms, rooms_available) VALUES ({}, '{}', '{}', '{}', {}, {}, {}, {}, {})''' \
            .format(hid, title, price, amenities, room_capacity, view_id, is_extendable, rooms, rooms)
        execute(query, conn)

        query = '''SELECT MAX(type_id) FROM hotel.hotel_room_type WHERE hotel_id = {}'''.format(hid)
        response = get_results(query, conn, jsonify=False)
        response = {'type_id': response[0].get('max')}
        return Response(json.dumps(response, default=str), status=201, mimetype='application/json')

    @app.route('/hotels/<hid>/rooms/<rid>', methods=['DELETE'])
    @cross_origin()
    def delete_room(hid, rid):
        data = request.json
        if 'manager_sin' not in data:
            raise BadRequestError(message="Missing required body field 'manager_sin'")

        manager_sin = data['manager_sin']
        verify_manager(manager_sin, hid, conn)

        query = '''SELECT COUNT(*) FROM hotel.hotel WHERE hotel_id = {}'''.format(hid)
        response = get_results(query, conn, jsonify=False)
        if response[0].get('count') == 0:
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))
        query = '''SELECT COUNT(*) FROM hotel.hotel_room_type WHERE hotel_id = {} AND type_id = {} 
                AND deleted = false'''.format(hid, rid)
        response = get_results(query, conn, jsonify=False)
        if response[0].get('count') == 0:
            raise ResourceNotFoundError(message='Room ID={} not found at hotel'.format(rid))

        query = '''UPDATE hotel.hotel_room_type SET deleted = true WHERE type_id = {}'''.format(rid)
        execute(query, conn)
        return Response(status=204, mimetype='application/json')

    @app.route('/hotels/<hid>/rooms/availability')
    @cross_origin()
    def get_room_availability_by_hotel(hid):
        people = request.args.get('people')
        check_in_day = request.args.get('check-in')
        check_out_day = request.args.get('check-out')

        if people is None:
            raise BadRequestError(message="Missing required query param 'people'")
        if check_in_day is None:
            raise BadRequestError(message="Missing required query param 'check-in'")
        if check_out_day is None:
            raise BadRequestError(message="Missing required query param 'check-out'")

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
        if 'email' not in data:
            raise BadRequestError(message="Missing required body field 'email'")
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
        email = data['email']
        address = data['address']
        salary = data['salary']
        job_title = data['job_title']

        verify_manager(manager_sin, hid, conn)

        query = """INSERT INTO hotel.employee(employee_sin, employee_name, employee_email, employee_address, salary, job_title,
                       hotel_ID) VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}')""" \
            .format(employee_sin, name, email, address, salary, job_title, hid)

        try:
            execute(query, conn)
        except psycopg2.DatabaseError as e:
            if 'duplicate key value violates unique constraint "employee_employee_email_key"' in str(e):
                raise ResourceConflictError(message='Unable to add employee - email already in use')
            raise ResourceConflictError(message='Employee already exists')
        return Response(status=201, mimetype='application/json')

    @app.route('/hotels/<hid>/employees/<eid>', methods=["PATCH"])
    @cross_origin()
    def update_employee(hid, eid):
        data = request.json
        if 'status' in data or 'hotel_id' in data or 'salary' in data or 'job_title' in data:
            if 'manager_sin' not in data:
                raise BadRequestError(message="Body field 'manager_sin' is required to update status and hotel_id")

            manager_sin = data['manager_sin']
            verify_manager(manager_sin, hid, conn)
            if manager_sin == eid:
                raise BadRequestError(message='Manager cannot change themself - please contact the db administrator')

        query = ''
        if 'status' in data:
            query += '''UPDATE hotel.employee e SET status_id = (SELECT status_id FROM hotel.employee_status s
                        WHERE s.status = '{}') WHERE employee_sin = \'{}\';'''.format(data['status'], eid)

        if 'hotel_id' in data:
            query += '''UPDATE hotel.employee e SET hotel_id = {} WHERE employee_sin = \'{}\';'''.format(hid, eid)
        if 'employee_address' in data and len(data['employee_address']) > 0:
            query += '''UPDATE hotel.employee e SET employee_address = '{}' WHERE employee_sin = \'{}\';''' \
                .format(data['employee_address'], eid)
        if 'employee_name' in data and len(data['employee_name']) > 0:
            query += '''UPDATE hotel.employee e SET employee_name = '{}' WHERE employee_sin = \'{}\';''' \
                .format(data['employee_name'], eid)
        if 'employee_email' in data and len(data['employee_email']) > 0:
            print('employee email UPDATING')
            query += '''UPDATE hotel.employee e SET employee_email = '{}' WHERE employee_sin = \'{}\';''' \
                .format(data['employee_email'], eid)
        if 'salary' in data:
            try:
                float(data['salary'])
            except ValueError:
                raise BadRequestError(message='Invalid salary - Must be a decimal number')
            query += '''UPDATE hotel.employee e SET salary = '{}' WHERE employee_sin = \'{}\';''' \
                .format(data['salary'], eid)
        if 'job_title' in data and len(data['job_title']) > 0:
            query += '''UPDATE hotel.employee e SET job_title = '{}' WHERE employee_sin = \'{}\';''' \
                .format(data['job_title'], eid)

        try:
            if query != '':
                execute(query, conn)
        except psycopg2.DatabaseError as e:
            if 'null value in column "status_id" of relation "employee" violates not-null constraint' in str(e):
                raise BadRequestError(message='Unable to delete employee - invalid status')
            if 'duplicate key value violates unique constraint "employee_employee_email_key"' in str(e):
                raise ResourceConflictError(message='Unable to update employee - email already in use')
            raise ResourceConflictError(message='Unable to delete employee')
        return Response(status=204, mimetype='application/json')

    @app.route('/hotels/<hid>/employees')
    @cross_origin()
    def get_employees_by_hotel(hid):
        query = '''SELECT e.employee_sin, e.employee_email, e.employee_name, e.employee_address, e.salary, e.job_title
                       FROM hotel.employee e WHERE e.status_id = 1 AND e.hotel_id = {}'''.format(hid)
        response = get_results(query, conn)
        if response == '[]':
            raise ResourceNotFoundError(message='Hotel ID={} not found'.format(hid))
        return Response(response, status=200, mimetype='application/json')

    @app.route('/hotels/<hid>/reservations')
    @cross_origin()
    def get_reservations(hid):
        action = request.args.get('action')
        if action is None:
            raise BadRequestError(message='Missing required query param action')
        if action != 'check-in' and action != 'check-out':
            raise BadRequestError(message='Invalid action param, must be check-in or check-out')

        try:
            hid = int(hid)
        except ValueError:
            raise BadRequestError(message="Invalid hotel_ID: must be an integer")

        execute('SELECT hotel.correct_status_hotel({})'.format(hid), conn)

        if action == 'check-in':
            query = '''SELECT b.booking_id, b.date_of_registration, b.check_in_day, b.check_out_day,
                           t.title, t.is_extendable, t.amenities, v.view, t.price, c.customer_sin, c.customer_name,
                           e.employee_name, e.job_title
                           FROM hotel.room_booking b
                           JOIN hotel.booking_status s ON s.status_ID = b.status_ID
                           JOIN hotel.hotel_room_type t ON t.type_ID = b.type_ID
                           JOIN hotel.view_type v ON v.view_ID = t.view_ID
                           JOIN hotel.customer c ON b.customer_sin = c.customer_sin
                           JOIN hotel.employee e ON b.employee_sin = e.employee_sin
                           WHERE s.value = 'Booked' AND b.hotel_id = {} AND CURRENT_DATE >= b.check_in_day
                           AND CURRENT_DATE < b.check_out_day
                           '''.format(hid)

        else:
            query = '''SELECT b.booking_id, b.date_of_registration, b.check_in_day, b.check_out_day,
                           t.title, t.is_extendable, t.amenities, v.view, t.price, c.customer_sin, c.customer_name
                           FROM hotel.room_booking b
                           JOIN hotel.booking_status s ON s.status_ID = b.status_ID
                           JOIN hotel.hotel_room_type t ON t.type_ID = b.type_ID
                           JOIN hotel.view_type v ON v.view_ID = t.view_ID
                           JOIN hotel.customer c ON b.customer_sin = c.customer_sin
                           WHERE b.hotel_id = {} AND s.value = 'Renting\''''.format(hid)

        response = get_results(query, conn)
        return Response(response, status=200, mimetype='application/json')


def to_pg_array(arr):
    arr = str(arr)
    arr = '{' + arr[1:len(arr) - 1] + '}'
    arr = arr.replace('\'', '"')
    return arr
