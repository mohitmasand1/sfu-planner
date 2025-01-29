import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SFU_API_BASE_URL = os.getenv('SFU_API_BASE_URL')

