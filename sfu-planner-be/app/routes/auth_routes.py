from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
import os
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app import mongo

auth_bp = Blueprint('auth_bp', __name__)

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_SECRET_KEY = os.getenv('GOOGLE_SECRET_KEY')
GOOGLE_TOKEN_POST_URL = os.getenv('GOOGLE_TOKEN_POST_URL')
GOOGLE_USER_GET_URL = os.getenv('GOOGLE_USER_GET_URL')

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    auth_code = request.get_json()['code']

    data = {
        'code': auth_code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_SECRET_KEY,
        'redirect_uri': 'postmessage',
        'grant_type': 'authorization_code'
    }

    response = requests.post(GOOGLE_TOKEN_POST_URL, data=data).json()
    headers = {'Authorization': f'Bearer {response["access_token"]}'}
    user_info = requests.get(GOOGLE_USER_GET_URL, headers=headers).json()

    jwt_token = create_access_token(identity=user_info['email'])
    response = jsonify(user=user_info)
    response.set_cookie('access_token_cookie', value=jwt_token, secure=True)

    return response, 200

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': current_user_id})
    return jsonify(logged_in_as=user['email']), 200
