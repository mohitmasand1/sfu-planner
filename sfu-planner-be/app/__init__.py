from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

load_dotenv()

mongo = PyMongo()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.rmp_routes import rmp_bp
    from app.routes.sfuapi_routes import sfuapi_bp
    from app.routes.term_routes import term_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(rmp_bp, url_prefix='/api/rmp')
    app.register_blueprint(sfuapi_bp, url_prefix='/api/sfuapi')
    app.register_blueprint(term_bp, url_prefix='/api/terms')
    
    return app
