import json

from flask import request, Response
from psycopg2.extras import DictCursor


def add_routes(app, conn):
    @app.route('/customers')
    def get_all_customers():
        query = 'SELECT * FROM hotel.customer c'
        sin = request.args.get('sin')
        if sin is not None:
            query += ' WHERE c.customer_SIN = \'{}\''.format(sin)
        query += ' LIMIT 10'

        response = get_results(query, conn)
        return Response(response, status=200, mimetype='application/json')


def get_results(query, conn):
    with conn:
        with conn.cursor() as curs:
            curs.execute(query)
            results = [dict((curs.description[i][0], value)
                            for i, value in enumerate(row)) for row in curs.fetchall()]
            return json.dumps(results)
