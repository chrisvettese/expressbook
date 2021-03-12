from flask import jsonify


class ResourceConflictError(Exception):

    def __init__(self, status_code=409, error='Conflict', message='Conflict'):
        Exception.__init__(self)
        self.status_code = status_code
        self.error = error
        self.message = message

    def json(self):
        response = {'error': self.error, 'message': self.message}
        return jsonify(response)
