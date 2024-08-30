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
        'client_id': GOOGLE_CLIENT_ID, # client ID from the credential at google developer console
        'client_secret': GOOGLE_SECRET_KEY, # client secret from the credential at google developer console
        'redirect_uri': 'postmessage',
        'grant_type': 'authorization_code'
    }

    response = requests.post(GOOGLE_TOKEN_POST_URL, data=data).json()
    headers = {'Authorization': f'Bearer {response["access_token"]}'}
    user_info = requests.get(GOOGLE_USER_GET_URL, headers=headers).json()
    """
        check here if user exists in database, if not, add them
    """
    user = mongo.db.users.find_one({'google_id': user_info['sub']})

    if not user:
        # If the user doesn't exist, add them to the database
        user_id = mongo.db.users.insert_one({
            'google_id': user_info['sub'],
            'email': user_info['email'],
            'name': user_info.get('name'),
            'picture': user_info.get('picture')  # Optionally store profile picture
        }).inserted_id
    else:
        user_id = user['_id']

    jwt_token = create_access_token(identity=str(user_id))
    response = jsonify(user=user_info)
    print(f"Setting cookie with value: {jwt_token}, SameSite=Lax, HttpOnly=True")
    response.set_cookie('access', value=jwt_token, secure=False, samesite='Lax', max_age=86400)

    return response, 200

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    print(f"JWT identity: {current_user_id}")
    user = mongo.db.users.find_one({'_id': current_user_id})
    return jsonify(logged_in_as=user['email']), 200


@auth_bp.route('/protected', methods=['OPTIONS', 'GET'])
def handle_options():
    if request.method == 'OPTIONS':
        return jsonify({}), 200