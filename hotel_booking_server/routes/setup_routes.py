import json
import re

from flask import Response
from flask_cors import cross_origin

from hotel_booking_server.errors.BadRequestError import BadRequestError
from hotel_booking_server.errors.ResourceNotFoundError import ResourceNotFoundError
from hotel_booking_server.routes import customer_routes, hotel_routes

phone_regex = r'^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|' \
              r'[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]' \
              r'\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$'

sin_regex = '''^[0-9]{3}-[0-9]{3}-[0-9]{3}$'''


def add_routes(app, conn):
    customer_routes.add_routes(app, conn)
    hotel_routes.add_routes(app, conn)

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

    @app.route('/employees/<eid>')
    @cross_origin()
    def get_employee(eid):
        validate_sin(eid)
        query = '''SELECT e.employee_sin, s.status, e.employee_name, e.employee_address, e.salary, e.job_title,
                   b.name AS brand_name, h.brand_id, h.hotel_id, h.physical_address AS hotel_address
                   FROM hotel.employee e
                   JOIN hotel.hotel h ON h.hotel_id = e.hotel_id
                   JOIN hotel.hotel_brand b ON b.brand_id = h.brand_id
                   JOIN hotel.employee_status s ON s.status_id = e.status_id
                   WHERE e.employee_sin = '{}\''''.format(eid)
        response = get_results(query, conn, jsonify=False)
        if len(response) == 0:
            raise ResourceNotFoundError(message='Employee SIN={} not found'.format(eid))
        return Response(json.dumps(response[0], default=str), status=200, mimetype='application/json')


def execute(query, conn):
    print(query)
    with conn:
        with conn.cursor() as curs:
            curs.execute(query)


def verify_manager(manager_sin, hotel_id, conn):
    query = 'SELECT employee_sin FROM hotel.employee WHERE job_title = \'Manager\' AND hotel_id = {}'.format(hotel_id)
    result = get_results(query, conn, jsonify=False)
    if len(result) == 0:
        raise BadRequestError(message='Invalid manager SIN')
    for employee in result:
        sin = employee.get('employee_sin')
        if sin is not None:
            if sin == manager_sin:
                return
    raise BadRequestError(message='Invalid manager SIN')


def get_customer_by_id(cid, conn):
    query = 'SELECT * FROM hotel.customer c WHERE c.customer_sin = \'{}\''.format(cid)
    response = get_results(query, conn, single=True)
    if len(response) == 0:
        raise ResourceNotFoundError(message='Customer SIN={} not found'.format(cid))
    return response


def validate_email(email):
    try:
        email_error = ' ' in email or email.index('@') < 1
        if not email_error:
            index = email.index('.', email.index('@'))
            if index < 3 or index == len(email) - 1:
                email_error = True
    except ValueError:
        email_error = True
    if email_error:
        raise BadRequestError(message='Invalid email address')


def validate_phone(phone):
    if len(re.findall(phone_regex, phone)) == 0:
        raise BadRequestError(message='Invalid phone number')


def validate_sin(sin):
    if len(re.findall(sin_regex, sin)) == 0:
        raise BadRequestError(message='Invalid social insurance number')


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
                # remove null values from dictionaries
                if not single:
                    for i in range(0, len(results)):
                        results[i] = {k: v for k, v in results[i].items() if v is not None}
                else:
                    results = {k: v for k, v in results.items() if v is not None}
                return json.dumps(results, default=str)
            else:
                return results
