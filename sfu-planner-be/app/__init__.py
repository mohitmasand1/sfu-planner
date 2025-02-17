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
    # Configuration for JWT in cookies
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']  # Look for JWT in cookies
    app.config['JWT_COOKIE_SECURE'] = False  # Set to True if using HTTPS
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable CSRF protection for simplicity in development
    
    # Load configuration
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins=["*"])
    
    # Register blueprints
    from app.routes.rmp_routes import rmp_bp
    from app.routes.sfuapi_routes import sfuapi_bp
    from app.routes.term_routes import term_bp
    from app.routes.cd_routes import cd_bp
    from app.routes.user_routes import user_bp
    from app.routes.health_routes import health_bp
    
    app.register_blueprint(rmp_bp, url_prefix='/api/rmp')
    app.register_blueprint(sfuapi_bp, url_prefix='/api/sfuapi')
    app.register_blueprint(term_bp, url_prefix='/api/terms')
    app.register_blueprint(cd_bp, url_prefix='/api/cd')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(health_bp)
    
    return app
