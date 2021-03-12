import json

from flask import Response
from flask_cors import cross_origin

from hotel_booking_server.ResourceNotFoundError import ResourceNotFoundError


def add_routes(app, conn):
    @app.route('/customers/<cid>')
    @cross_origin()
    def get_customer(cid):
        query = 'SELECT * FROM hotel.customer c WHERE c.customer_sin = \'{}\''.format(cid)
        print(query)
        # sin = request.args.get('sin')
        response = get_results(query, conn, single=True)
        if len(response) == 0:
            raise ResourceNotFoundError(message='Customer SIN not found')
        return Response(response, status=200, mimetype='application/json')


def get_results(query, conn, single):
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
