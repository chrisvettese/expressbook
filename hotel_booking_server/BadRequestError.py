from flask import jsonify


class BadRequestError(Exception):

    def __init__(self, status_code=400, error='Bad Request', message='Bad Request'):
        Exception.__init__(self)
        self.status_code = status_code
        self.error = error
        self.message = message

    def json(self):
        response = {'error': self.error, 'message': self.message}
        return jsonify(response)
