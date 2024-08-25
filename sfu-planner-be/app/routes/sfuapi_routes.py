from flask import Blueprint, request, jsonify
from app.utils.api_helpers import parse_term_code, fetch_data_from_api, process_course_number_data, process_course_section_data, process_course_number_and_section_data
import os

sfuapi_bp = Blueprint('sfuapi_bp', __name__)
SFU_API_BASE_URL = os.getenv('SFU_API_BASE_URL')

@sfuapi_bp.route("/", methods=["GET"])
def get_api_response():
    termCode = request.args.get("termCode", None)
    major = request.args.get("major", None)
    course_number = request.args.get("course", None)
    course_section = request.args.get("section", None)
    
    semester = parse_term_code(termCode)
    year, term = semester[0], semester[1]

    response = {}
    if course_section:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{course_section}")
        response = process_course_section_data(response)
    elif course_number:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}")
        response = process_course_number_and_section_data(response, year, term, major, course_number)
    elif major:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}")
    elif termCode:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}")

    if not response:
        return jsonify({"error": "No valid parameters provided"}), 400

    return jsonify(response)
