import json

from flask import request, Response
from psycopg2.extras import DictCursor


def add_routes(app, conn):
    @app.route('/customers/<cid>')
    def get_customer(cid):
        query = 'SELECT * FROM hotel.customer c WHERE c.customer_sin = \'{}\''.format(id)
        # sin = request.args.get('sin')
        response = get_results(query, conn, single=True)
        return Response(response, status=200, mimetype='application/json')


def get_results(query, conn, single):
    with conn:
        with conn.cursor() as curs:
            curs.execute(query)
            results = [dict((curs.description[i][0], value)
                            for i, value in enumerate(row)) for row in curs.fetchall()]
            if single:
                results = results[0]
            return json.dumps(results)
