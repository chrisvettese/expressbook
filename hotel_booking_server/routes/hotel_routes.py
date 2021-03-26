import psycopg2
from flask import Response, request
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

        verify_manager(manager_sin, hid, conn)

        query = """INSERT INTO hotel.employee(employee_sin, employee_name, employee_address, salary, job_title,
                   hotel_ID) VALUES ('{}', '{}', '{}', '{}', '{}', '{}')""" \
            .format(employee_sin, name, address, salary, job_title, hid)

        try:
            execute(query, conn)
        except psycopg2.DatabaseError:
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
            query += '''UPDATE hotel.employee e SET employee_name = '{}' WHERE employee_sin = \'{}\';'''\
                .format(data['employee_name'], eid)
        if 'salary' in data:
            try:
                float(data['salary'])
            except ValueError:
                raise BadRequestError(message='Invalid salary - Must be a decimal number')
            query += '''UPDATE hotel.employee e SET salary = '{}' WHERE employee_sin = \'{}\';'''\
                .format(data['salary'], eid)
        if 'job_title' in data and len(data['job_title']) > 0:
            query += '''UPDATE hotel.employee e SET job_title = '{}' WHERE employee_sin = \'{}\';'''\
                .format(data['job_title'], eid)

        try:
            if query != '':
                execute(query, conn)
        except psycopg2.DatabaseError:
            raise ResourceConflictError(message='Unable to delete employee')
        return Response(status=204, mimetype='application/json')

    @app.route('/hotels/<hid>/employees')
    @cross_origin()
    def get_employees_by_hotel(hid):
        query = '''SELECT e.employee_sin, e.employee_name, e.employee_address, e.salary, e.job_title
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
