from flask import jsonify


class ResourceNotFoundError(Exception):

    def __init__(self, status_code=404, error='Resource Not Found', message='Not Found'):
        Exception.__init__(self)
        self.status_code = status_code
        self.error = error
        self.message = message

    def json(self):
        response = {'error': self.error, 'message': self.message}
        return jsonify(response)
